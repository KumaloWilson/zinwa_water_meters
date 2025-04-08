import type { Request, Response } from "express"
import { Payment, PaymentStatus, PaymentMethod, User, Property } from "../models"
import { logger } from "../utils/logger"
import paynowService from "../utils/paynow"
import { Op } from "sequelize"

// Get all payments (admin only)
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const status = req.query.status as PaymentStatus
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    const whereClause: any = {}

    if (status) {
      whereClause.status = status
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
      }
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate),
      }
    }

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
      ],
    })

    res.status(200).json({
      payments: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get all payments error:", error)
    res.status(500).json({ message: "Error retrieving payments" })
  }
}

export const checkPaymentStatusFromPaynow = async (req: Request, res: Response) => {
  try {
    const { pollurl } = req.body

    // Check payment status from Paynow
    const paynowStatus = await paynowService.checkTransactionStatus(pollurl)

    res.status(200).json({
      message: "Payment status retrieved successfully",
      status: paynowStatus,
    })
  } catch (error) {
    logger.error("Check payment status error:", error)
    res.status(500).json({ message: "Error checking payment status" })
  }
}

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
      ],
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== payment.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.status(200).json({ payment })
  } catch (error) {
    logger.error("Get payment by ID error:", error)
    res.status(500).json({ message: "Error retrieving payment" })
  }
}

// Get payments by user ID
export const getPaymentsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { count, rows } = await Payment.findAndCountAll({
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
      ],
    })

    res.status(200).json({
      payments: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get payments by user ID error:", error)
    res.status(500).json({ message: "Error retrieving payments" })
  }
}

// Get payments by property ID
export const getPaymentsByPropertyId = async (req: Request, res: Response) => {
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

    const { count, rows } = await Payment.findAndCountAll({
      where: { propertyId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({
      payments: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get payments by property ID error:", error)
    res.status(500).json({ message: "Error retrieving payments" })
  }
}

// Update payment status (webhook from payment gateway)
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { reference, status, pollurl } = req.body

    // Find payment by reference number
    const payment = await Payment.findOne({
      where: { referenceNumber: reference },
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    // Check payment status from Paynow
    const paynowStatus = await paynowService.checkTransactionStatus(pollurl || payment.pollUrl)

    if (paynowStatus.status.toLowerCase() === "paid" || status === "paid") {
      // Update payment status
      payment.status = PaymentStatus.COMPLETED
      payment.paidAt = new Date()
      payment.paymentDetails = { ...payment.paymentDetails, paynowStatus }
      await payment.save()

      return res.status(200).json({
        message: "Payment status updated successfully",
        payment: {
          id: payment.id,
          referenceNumber: payment.referenceNumber,
          status: payment.status,
        },
      })
    } else if (paynowStatus.status.toLowerCase() === "cancelled" || status === "cancelled") {
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
    logger.error("Update payment status error:", error)
    res.status(500).json({ message: "Error updating payment status" })
  }
}

// Create manual payment (admin only)
export const createManualPayment = async (req: Request, res: Response) => {
  try {
    const { userId, propertyId, amount, paymentMethod, notes } = req.body

    // Only admins can create manual payments
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Check if property exists
    const property = await Property.findByPk(propertyId)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Create payment record
    const referenceNumber = `MAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const payment = await Payment.create({
      userId,
      propertyId,
      referenceNumber,
      amount,
      status: PaymentStatus.COMPLETED,
      paymentMethod: paymentMethod || PaymentMethod.CASH,
      paidAt: new Date(),
      paymentDetails: { notes },
    })

    res.status(201).json({
      message: "Manual payment created successfully",
      payment: {
        id: payment.id,
        referenceNumber: payment.referenceNumber,
        amount: payment.amount,
        status: payment.status,
      },
    })
  } catch (error) {
    logger.error("Create manual payment error:", error)
    res.status(500).json({ message: "Error creating manual payment" })
  }
}

