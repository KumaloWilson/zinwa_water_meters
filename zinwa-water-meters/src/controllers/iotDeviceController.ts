import type { Request, Response } from "express"
import { Token, Property, MeterReading, User, Payment, PaymentStatus, Rate } from "../models"
import { logger } from "../utils/logger"
import { AppError } from "../middleware/errorHandler"
import { sendEmail } from "../utils/email"
import { Op } from "sequelize"

/**
 * Apply a purchased token to the property's account
 * @route POST /api/tokens/apply
 * @access Public (but verification is required)
 */
export const applyToken = async (req: Request, res: Response) => {
  try {
    const { tokenValue, meterNumber } = req.body

    if (!tokenValue) {
      return res.status(400).json({ message: "Token value is required" })
    }

    // Find the token with related property
    const token = await Token.findOne({
      where: { tokenValue },
      include: [
        {
          model: Property,
          as: "property",
        },
        {
          model: User,
          as: "user",
        },
      ],
    })

    if (!token) {
      return res.status(404).json({ message: "Invalid token" })
    }

    if (token.isUsed) {
      return res.status(400).json({ message: "Token has already been used" })
    }

    if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Token has expired" })
    }

    // Check if the token has an associated property
    if (!token.property) {
      return res.status(400).json({ message: "Token is not associated with any property" })
    }

    // Verify meter number if provided - token can only be used for the meter it was purchased for
    if (meterNumber && token.property.meterNumber !== meterNumber) {
      return res.status(400).json({ 
        message: "This token is valid but cannot be used for this meter",
        validForMeter: token.property.meterNumber
      })
    }

    // Begin transaction to ensure atomic operations
    const property = token.property
    const previousBalance = property.currentBalance

    // Mark token as used
    token.isUsed = true
    token.usedAt = new Date()
    await token.save()

    // Update property balance
    property.currentBalance += token.units
    await property.save()

    // Log the balance update
    logger.info(`Balance updated for property ${property.id}: ${previousBalance} -> ${property.currentBalance} units`)

    // Send confirmation email if user exists
    // if (token.user && token.user.email) {
    //   try {
    //     await sendEmail(token.user.email, "tokenApplied", {
    //       name: token.user.firstName,
    //       tokenValue: token.tokenValue,
    //       units: token.units,
    //       previousBalance,
    //       newBalance: property.currentBalance,
    //       propertyAddress: property.address,
    //       propertyName: property.propertyName,
    //       meterNumber: property.meterNumber,
    //     })
    //   } catch (error) {
    //     logger.error("Error sending token application email:", error)
    //     // Continue even if email fails
    //   }
    // }

    res.status(200).json({
      message: "Token applied successfully",
      token: {
        id: token.id,
        tokenValue: token.tokenValue,
        units: token.units,
      },
      property: {
        id: property.id,
        propertyName: property.propertyName,
        meterNumber: property.meterNumber,
        previousBalance,
        currentBalance: property.currentBalance,
      }
    })
  } catch (error) {
    logger.error("Apply token error:", error)
    res.status(500).json({ message: "Error applying token" })
  }
}
/**
 * Get current balance for a property 
 * @route GET /api/properties/:id/balance
 * @access Private
 */
export const getPropertyBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const property = await Property.findByPk(id, {
      attributes: ["id", "propertyName", "meterNumber", "currentBalance", "userId"],
      include: [
        {
          model: MeterReading,
          as: "meterReadings",
          limit: 1,
          order: [["readingDate", "DESC"]],
          attributes: ["reading", "readingDate"]
        }
      ]
    })

    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // // Check if the requesting user is authorized
    // if (req.user?.id !== property.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    //   return res.status(403).json({ message: "Access denied" })
    // }

    // Get the most recent token application
    const lastToken = await Token.findOne({
      where: { 
        propertyId: id,
        isUsed: true
      },
      order: [["usedAt", "DESC"]],
      attributes: ["units", "usedAt"]
    })

    // Calculate usage statistics
    let averageDailyUsage = 0
    
    if (property.meterReadings && property.meterReadings.length > 0) {
      // Get readings from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentReadings = await MeterReading.findAll({
        where: { 
          propertyId: id,
          readingDate: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [["readingDate", "ASC"]]
      })
      
      // Calculate average daily usage if we have enough data
      if (recentReadings.length >= 2) {
        const totalConsumption = recentReadings.reduce((sum, reading, index) => {
          if (index === 0) return sum
          return sum + reading.consumption
        }, 0)
        
        const firstDate = new Date(recentReadings[0].readingDate)
        const lastDate = new Date(recentReadings[recentReadings.length - 1].readingDate)
        const daysDiff = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)))
        
        averageDailyUsage = Number((totalConsumption / daysDiff).toFixed(2))
      }
    }

    // Estimate days remaining based on current balance and average usage
    let estimatedDaysRemaining = null
    if (averageDailyUsage > 0) {
      estimatedDaysRemaining = Math.round(property.currentBalance / averageDailyUsage)
    }

    res.status(200).json({
      property: {
        id: property.id,
        propertyName: property.propertyName,
        meterNumber: property.meterNumber,
      },
      balance: {
        currentBalance: property.currentBalance,
        lastTopUp: lastToken ? {
          units: lastToken.units,
          date: lastToken.usedAt
        } : null,
        usage: {
          averageDaily: averageDailyUsage,
          estimatedDaysRemaining: estimatedDaysRemaining
        },
        lastReading: property.meterReadings && property.meterReadings.length > 0 ? {
          reading: property.meterReadings[0].reading,
          date: property.meterReadings[0].readingDate
        } : null
      }
    })
  } catch (error) {
    logger.error("Get property balance error:", error)
    res.status(500).json({ message: "Error retrieving property balance" })
  }
}

/**
 * Process account top-up after successful purchase
 * @route POST /api/properties/:id/topup
 * @access Private (Admin/System only)
 */
// export const processAccountTopUp = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params
//     const { paymentId } = req.body

//     // This should be a system or admin-only endpoint
//     if (req.user?.role !== "admin" && req.user?.role !== "super_admin" && req.user?.role !== "system") {
//       return res.status(403).json({ message: "Access denied" })
//     }

//     const property = await Property.findByPk(id)
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" })
//     }

//     // Find the payment and check its status
//     const payment = await Payment.findByPk(paymentId, {
//       include: [
//         {
//           model: User,
//           as: "user",
//         }
//       ]
//     })

//     if (!payment) {
//       return res.status(404).json({ message: "Payment not found" })
//     }

//     if (payment.status !== PaymentStatus.COMPLETED) {
//       return res.status(400).json({ message: "Payment has not been completed" })
//     }

//     // Find any tokens already created for this payment to prevent double-top-up
//     const existingToken = await Token.findOne({
//       where: { paymentId }
//     })

//     if (existingToken) {
//       return res.status(400).json({ 
//         message: "This payment has already been processed",
//         token: existingToken.tokenValue
//       })
//     }

//     // Create a token for the payment
//     const tokenValue = generateToken()
//     const token = await Token.create({
//       userId: payment.userId,
//       propertyId: property.id,
//       paymentId: payment.id,
//       tokenValue,
//       units: await calculateUnits(payment.amount, property.propertyType),
//       amount: payment.amount,
//       isUsed: true, // Mark as used immediately as we're auto-applying it
//       usedAt: new Date(),
//       expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry (for record keeping)
//     })

//     // Update property balance
//     const previousBalance = property.currentBalance
//     property.currentBalance += token.units
//     property.lastTokenPurchase = new Date()
//     await property.save()

//     // Send confirmation email
//     try {
//       await sendEmail(payment.user.email, "autoTopUp", {
//         name: payment.user.firstName,
//         tokenValue: token.tokenValue,
//         units: token.units,
//         previousBalance,
//         newBalance: property.currentBalance,
//         propertyAddress: property.address,
//         propertyName: property.propertyName,
//         amount: payment.amount,
//       })
//     } catch (error) {
//       logger.error("Error sending auto top-up email:", error)
//       // Continue even if email fails
//     }

//     res.status(200).json({
//       message: "Account topped up successfully",
//       token: {
//         id: token.id,
//         tokenValue: token.tokenValue,
//         units: token.units,
//       },
//       property: {
//         id: property.id,
//         propertyName: property.propertyName,
//         previousBalance,
//         currentBalance: property.currentBalance,
//       }
//     })
//   } catch (error) {
//     logger.error("Process account top-up error:", error)
//     res.status(500).json({ message: "Error processing account top-up" })
//   }
// }

/**
 * Record water usage and deduct from balance
 * @route POST /api/properties/:id/deduct
 * @access Private (System/IOT access)
 */
export const recordWaterUsage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { reading, units } = req.body


    const property = await Property.findByPk(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    let consumption = 0
    let newReading = null

    // Handle either direct reading or units consumption
    if (reading !== undefined) {
      // Get previous reading
      const previousReading = await MeterReading.findOne({
        where: { propertyId: id },
        order: [["readingDate", "DESC"]],
      })

      if (!previousReading) {
        return res.status(400).json({ message: "No previous reading found, cannot calculate consumption" })
      }

      if (reading < previousReading.reading) {
        return res.status(400).json({ message: "New reading cannot be less than previous reading" })
      }

      consumption = reading - previousReading.reading
      newReading = reading
    } else if (units !== undefined) {
      // Direct units consumption provided (e.g. from smart meter)
      consumption = units
      
      // Get the last reading to calculate the new one
      const lastReading = await MeterReading.findOne({
        where: { propertyId: id },
        order: [["readingDate", "DESC"]],
      })
      
      newReading = lastReading ? lastReading.reading + consumption : consumption
    } else {
      return res.status(400).json({ message: "Either 'reading' or 'units' must be provided" })
    }

    // Check if there's enough balance
    if (property.currentBalance < consumption) {
      // Create meter reading to record the attempted consumption
      await MeterReading.create({
        propertyId: id,
        reading: newReading,
        consumption: 0, // No consumption recorded since balance is insufficient
        readingDate: new Date(),
        isEstimated: false,
        notes: "Attempted usage - insufficient balance",
      })

      return res.status(400).json({ 
        message: "Insufficient balance",
        currentBalance: property.currentBalance,
        requiredUnits: consumption
      })
    }

    // Create meter reading record
    const meterReading = await MeterReading.create({
      propertyId: id,
      reading: newReading,
      consumption,
      readingDate: new Date(),
      isEstimated: false,
      notes: "Usage recorded via API",
    })

    // Update property data
    const previousBalance = property.currentBalance
    property.currentBalance -= consumption
    property.totalConsumption += consumption
    await property.save()

    // If balance is low (less than 10% of typical monthly usage or below 5 units), send alert
    if (property.currentBalance <= 5) {
      // Get the property owner's information
      const user = await User.findByPk(property.userId)
      
      if (user) {
        try {
          await sendEmail(user.email, "lowBalance", {
            name: user.firstName,
            propertyAddress: property.propertyName,
            remainingUnits: property.currentBalance,
          })
        } catch (error) {
          logger.error("Error sending low balance alert:", error)
          // Continue even if email fails
        }
      }
    }

    res.status(200).json({
      message: "Water usage recorded successfully",
      reading: {
        id: meterReading.id,
        reading: meterReading.reading,
        consumption: meterReading.consumption,
        date: meterReading.readingDate,
      },
      balance: {
        previous: previousBalance,
        current: property.currentBalance,
        deducted: consumption
      }
    })
  } catch (error) {
    logger.error("Record water usage error:", error)
    res.status(500).json({ message: "Error recording water usage" })
  }
}

// // Helper functions
// // Generate unique token
// const generateToken = (): string => {
//   // Generate a 12-character alphanumeric token
//   return (
//     Math.random().toString(36).substring(2, 8).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase()
//   )
// }

// // Calculate units based on amount and property type
// const calculateUnits = async (amount: number, propertyType: string): Promise<number> => {
//   try {
//     // Get rate for property type
//     const rate = await Rate.findOne({
//       where: {
//         propertyType,
//         isActive: true,
//         effectiveDate: {
//           [Op.lte]: new Date(),
//         },
//         [Op.or]: [{ endDate: null }, { endDate: { [Op.gt]: new Date() } }],
//       },
//     })

//     if (!rate) {
//       throw new AppError(`No active rate found for property type: ${propertyType}`, 400)
//     }

//     // Calculate units
//     let units = amount / rate.ratePerUnit

//     // Apply fixed charge if any
//     if (rate.fixedCharge) {
//       const amountAfterFixedCharge = amount - rate.fixedCharge
//       if (amountAfterFixedCharge <= 0) {
//         units = 0
//       } else {
//         units = amountAfterFixedCharge / rate.ratePerUnit
//       }
//     }

//     // Apply minimum charge if any
//     if (rate.minimumCharge && amount < rate.minimumCharge) {
//       throw new AppError(`Amount is below minimum charge of $${rate.minimumCharge}`, 400)
//     }

//     return Number.parseFloat(units.toFixed(2))
//   } catch (error) {
//     logger.error("Calculate units error:", error)
//     throw error
//   }
// }
