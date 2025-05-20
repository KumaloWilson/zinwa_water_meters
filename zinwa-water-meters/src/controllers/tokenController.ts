import type { Request, Response } from "express"
import { Token, Property, Payment, PaymentStatus, PaymentMethod, User, Rate } from "../models"
import { logger } from "../utils/logger"
import { AppError } from "../middleware/errorHandler"
import paynowService from "../utils/paynow"
import { sendEmail } from "../utils/email"
import { Op } from "sequelize"

// Generate unique token
const generateToken = (): string => {
  const chars = '0123456';
  const tokenLength = 16;
  let token = '';

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }

  return token;
};


// Calculate units based on amount and property type
const calculateUnits = async (amount: number, propertyType: string): Promise<number> => {
  try {
    // Get rate for property type
    const rate = await Rate.findOne({
      where: {
        propertyType,
        isActive: true,
        effectiveDate: {
          [Op.lte]: new Date(),
        },
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gt]: new Date() } }],
      },
    })

    if (!rate) {
      throw new AppError(`No active rate found for property type: ${propertyType}`, 400)
    }

    // Calculate units
    let units = amount / rate.ratePerUnit

    // Apply fixed charge if any
    if (rate.fixedCharge) {
      const amountAfterFixedCharge = amount - rate.fixedCharge
      if (amountAfterFixedCharge <= 0) {
        units = 0
      } else {
        units = amountAfterFixedCharge / rate.ratePerUnit
      }
    }

    // Apply minimum charge if any
    if (rate.minimumCharge && amount < rate.minimumCharge) {
      throw new AppError(`Amount is below minimum charge of $${rate.minimumCharge}`, 400)
    }

    return Number.parseFloat(units.toFixed(2))
  } catch (error) {
    logger.error("Calculate units error:", error)
    throw error
  }
}

// Purchase token
export const purchaseToken = async (req: Request, res: Response) => {
  try {
    const { propertyId, amount } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Check if property exists
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
      ],
    })

    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if user owns the property or is an admin
    if (property.userId !== userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Calculate units based on amount and property type
    const units = await calculateUnits(amount, property.propertyType)

    // Create payment record
    const referenceNumber = `TKN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const payment = await Payment.create({
      userId,
      propertyId,
      referenceNumber,
      amount,
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.PAYNOW,
    })

    // Initiate payment with Paynow
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const paynowResponse = await paynowService.initiateTransaction(
      user.email,
      user.phoneNumber,
      amount,
      referenceNumber,
      `Water token purchase for ${property.propertyName}`,
    )

    // Update payment with Paynow response
    payment.transactionId = paynowResponse.transactionReference
    payment.pollUrl = paynowResponse.pollUrl || ''
    payment.paymentDetails = paynowResponse
    await payment.save()

    res.status(200).json({
      message: "Payment initiated successfully",
      payment: {
        id: payment.id,
        referenceNumber: payment.referenceNumber,
        amount: payment.amount,
        status: payment.status,
      },
      redirectUrl: paynowResponse.redirectUrl || "",
      pollUrl: paynowResponse.pollUrl || "",
      units,
    })

  } catch (error) {
    logger.error("Purchase token error:", error)
    res.status(500).json({ message: error })
  }
}

//// Complete token purchase (callback from payment gateway)
export const completeTokenPurchase = async (req: Request, res: Response) => {
  try {
    const { reference, status, pollurl } = req.body

    // Find payment by reference number
    const payment = await Payment.findOne({
      where: { referenceNumber: reference },
      include: [
        {
          model: Property,
          as: "property",
          include: [
            {
              model: User,
              as: "owner",
            },
          ],
        },
        {
          model: User,
          as: "user",
        },
      ],
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check payment status from Paynow
    const paynowStatus = await paynowService.checkTransactionStatus(pollurl || payment.pollUrl)

    if (paynowStatus.status?.toLowerCase() === "paid" || status === "paid" || paynowStatus.paid) {
      // Update payment status
      payment.status = PaymentStatus.COMPLETED
      payment.paidAt = new Date()
      payment.paymentDetails = { ...payment.paymentDetails, paynowStatus }
      await payment.save()

      // Calculate units
      const units = await calculateUnits(payment.amount, payment.property.propertyType)

      // Generate token
      const tokenValue = generateToken()

      // Create token record
      const token = await Token.create({
        userId: payment.userId,
        propertyId: payment.propertyId,
        paymentId: payment.id,
        tokenValue,
        units,
        amount: payment.amount,
        isUsed: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      })

      // Update property balance
      const property = payment.property
      property.currentBalance += units
      property.lastTokenPurchase = new Date()
      await property.save()

      // Send token purchase confirmation email
      try {
        await sendEmail(payment.user.email, "tokenPurchase", {
          name: payment.user.fullName,
          tokenValue: token.tokenValue,
          propertyAddress: property.address,
          amount: payment.amount,
        })
      } catch (error) {
        logger.error("Error sending token purchase email:", error)
        // Continue even if email fails
      }

      return res.status(200).json({
        message: "Token purchase completed successfully",
        token: {
          id: token.id,
          tokenValue: token.tokenValue,
          units: token.units,
          amount: token.amount,
        },
      })
    } else if (paynowStatus.status?.toLowerCase() === "cancelled" || status === "cancelled") {
      // Update payment status
      payment.status = PaymentStatus.FAILED
      payment.paymentDetails = { ...payment.paymentDetails, paynowStatus }
      await payment.save()

      return res.status(200).json({
        message: "Payment was cancelled",
        payment: {
          id: payment.id,
          referenceNumber: payment.referenceNumber,
          status: payment.status,
        },
      })
    } else {
      return res.status(200).json({
        message: "Payment is still pending",
        payment: {
          id: payment.id,
          referenceNumber: payment.referenceNumber,
          status: payment.status,
        },
      })
    }
  } catch (error) {
    logger.error("Complete token purchase error:", error)
    res.status(500).json({ message: "Error completing token purchase" })
  }
}


// Get all tokens
export const getAllTokens = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const { count, rows } = await Token.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "referenceNumber", "amount", "status"],
        },
      ],
    })

    res.status(200).json({
      tokens: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get all tokens error:", error)
    res.status(500).json({ message: "Error retrieving tokens" })
  }
}

// Get token by ID
export const getTokenById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const token = await Token.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "referenceNumber", "amount", "status", "paymentMethod", "paidAt"],
        },
      ],
    })

    if (!token) {
      return res.status(404).json({ message: "Token not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== token.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.status(200).json({ token })
  } catch (error) {
    logger.error("Get token by ID error:", error)
    res.status(500).json({ message: "Error retrieving token" })
  }
}

// Get tokens by property ID
export const getTokensByPropertyId = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Check if property exists
    const property = await Property.findByPk(propertyId)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== property.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { count, rows } = await Token.findAndCountAll({
      where: { propertyId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "referenceNumber", "amount", "status", "paidAt"],
        },
      ],
    })

    res.status(200).json({
      tokens: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get tokens by property ID error:", error)
    res.status(500).json({ message: "Error retrieving tokens" })
  }
}

// Get tokens by user ID
export const getTokensByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { count, rows } = await Token.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "referenceNumber", "amount", "status", "paidAt"],
        },
      ],
    })

    res.status(200).json({
      tokens: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get tokens by user ID error:", error)
    res.status(500).json({ message: "Error retrieving tokens" })
  }
}

// Verify token
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { tokenValue } = req.body

    const token = await Token.findOne({
      where: { tokenValue },
      include: [
        {
          model: Property,
          as: "property",
        },
      ],
    })

    if (!token) {
      return res.status(404).json({ message: "Token not found" })
    }

    if (token.isUsed) {
      return res.status(400).json({ message: "Token has already been used" })
    }

    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Token has expired" })
    }

    res.status(200).json({
      message: "Token is valid",
      token: {
        id: token.id,
        tokenValue: token.tokenValue,
        units: token.units,
        property: {
          id: token.property.id,
          propertyName: token.property.propertyName,
          address: token.property.address,
          meterNumber: token.property.meterNumber,
        },
      },
    })
  } catch (error) {
    logger.error("Verify token error:", error)
    res.status(500).json({ message: "Error verifying token" })
  }
}

// Apply token (mark as used)
export const applyToken = async (req: Request, res: Response) => {
  try {
    const { tokenValue, meterNumber } = req.body

    const token = await Token.findOne({
      where: { tokenValue },
      include: [
        {
          model: Property,
          as: "property",
        },
      ],
    })

    if (!token) {
      return res.status(404).json({ message: "Token not found" })
    }

    if (token.isUsed) {
      return res.status(400).json({ message: "Token has already been used" })
    }

    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Token has expired" })
    }

    // Verify meter number if provided
    if (meterNumber && token.property.meterNumber !== meterNumber) {
      return res.status(400).json({ message: "Token is not valid for this meter" })
    }

    // Mark token as used
    token.isUsed = true
    token.usedAt = new Date()
    await token.save()

    res.status(200).json({
      message: "Token applied successfully",
      token: {
        id: token.id,
        tokenValue: token.tokenValue,
        units: token.units,
        property: {
          id: token.property.id,
          propertyName: token.property.propertyName,
          address: token.property.address,
          meterNumber: token.property.meterNumber,
        },
      },
    })
  } catch (error) {
    logger.error("Apply token error:", error)
    res.status(500).json({ message: "Error applying token" })
  }
}

