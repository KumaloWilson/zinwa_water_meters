import type { Request, Response } from "express"
import { User, Property, Token, Payment, MeterReading, type PropertyType, PaymentStatus } from "../models"
import { logger } from "../utils/logger"
import { Op, fn, col, literal } from "sequelize"

// Customer dashboard
export const getCustomerDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const userId = req.user.id
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()

    // Get user properties
    const properties = await Property.findAll({
      where: { userId },
      attributes: [
        "id",
        "propertyName",
        "address",
        "meterNumber",
        "propertyType",
        "currentBalance",
        "totalConsumption",
      ],
    })

    // Get recent tokens
    const recentTokens = await Token.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
      ],
    })

    // Get recent payments
    const recentPayments = await Payment.findAll({
      where: {
        userId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber"],
        },
      ],
    })

    // Get total consumption by property
    const consumptionByProperty = await MeterReading.findAll({
      attributes: ["propertyId", [fn("sum", col("consumption")), "totalConsumption"]],
      where: {
        readingDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          where: { userId },
          attributes: ["propertyName", "address", "meterNumber"],
        },
      ],
      group: ["propertyId", "property.id"],
      raw: true,
    })

    // Get total spent by property
    const spentByProperty = await Payment.findAll({
      attributes: ["propertyId", [fn("sum", col("amount")), "totalSpent"]],
      where: {
        userId,
        status: PaymentStatus.COMPLETED,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["propertyName", "address", "meterNumber"],
        },
      ],
      group: ["propertyId", "property.id"],
      raw: true,
    })

    // Get monthly consumption trend
    const monthlyConsumption = await MeterReading.findAll({
      attributes: [
        [fn("date_trunc", "month", col("readingDate")), "month"],
        [fn("sum", col("consumption")), "totalConsumption"],
      ],
      where: {
        readingDate: {
          [Op.between]: [startDate, endDate],
        },
        "$property.userId$": userId,
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: [],
        },
      ],
      group: [fn("date_trunc", "month", col("readingDate"))],
      order: [fn("date_trunc", "month", col("readingDate"))],
      raw: true,
    })

    // Get properties with low balance
    const propertiesWithLowBalance = await Property.findAll({
      where: {
        userId,
        currentBalance: {
          [Op.lt]: 10, // Less than 10 units is considered low
        },
      },
      attributes: ["id", "propertyName", "address", "meterNumber", "currentBalance"],
    })

    res.status(200).json({
      properties,
      recentTokens,
      recentPayments,
      consumptionByProperty,
      spentByProperty,
      monthlyConsumption,
      propertiesWithLowBalance,
      summary: {
        totalProperties: properties.length,
        totalConsumption: properties.reduce((sum, property) => sum + property.totalConsumption, 0),
        averageBalance:
          properties.length > 0
            ? properties.reduce((sum, property) => sum + property.currentBalance, 0) / properties.length
            : 0,
      },
    })
  } catch (error) {
    logger.error("Get customer dashboard error:", error)
    res.status(500).json({ message: "Error retrieving dashboard data" })
  }
}

// Admin dashboard
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1))
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date()
    const propertyType = req.query.propertyType as PropertyType

    let propertyWhereClause = {}
    if (propertyType) {
      propertyWhereClause = { propertyType }
    }

    // Get total users
    const totalUsers = await User.count()

    // Get total properties
    const totalProperties = await Property.count({
      where: propertyWhereClause,
    })

    // Get total revenue
    const totalRevenue =
      (await Payment.findAll({
        attributes: [[fn('sum', col('amount')), 'total']],
        where: {
          status: PaymentStatus.COMPLETED,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: Property,
            as: "property",
            where: propertyWhereClause,
            required: true,
          },
        ],
        raw: true,
      }).then((result: any) => result[0]?.total || 0))

    // Get total consumption
    const totalConsumption = await MeterReading.findAll({
      attributes: [[fn('sum', col('consumption')), 'total']],
      where: {
        readingDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          where: propertyWhereClause,
          required: true,
        },
      ],
      raw: true,
    }).then((result: any) => result[0]?.total || 0)

    // Get revenue by property type
    const revenueByPropertyType = await Payment.findAll({
      attributes: [
        [col("property.propertyType"), "propertyType"],
        [fn("sum", col("amount")), "totalRevenue"],
      ],
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: [],
        },
      ],
      group: [col("property.propertyType")],
      raw: true,
    })

    // Get consumption by property type
    const consumptionByPropertyType = await MeterReading.findAll({
      attributes: [
        [col("property.propertyType"), "propertyType"],
        [fn("sum", col("consumption")), "totalConsumption"],
      ],
      where: {
        readingDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: [],
          where: propertyWhereClause,
        },
      ],
      group: [col("property.propertyType")],
      raw: true,
    })

    // Get monthly revenue trend
    const monthlyRevenue = await Payment.findAll({
      attributes: [
        [fn("date_trunc", "month", col("createdAt")), "month"],
        [fn("sum", col("amount")), "totalRevenue"],
      ],
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: [],
          where: propertyWhereClause,
        },
      ],
      group: [fn("date_trunc", "month", col("createdAt"))],
      order: [fn("date_trunc", "month", col("createdAt"))],
      raw: true,
    })

    // Get monthly consumption trend
    const monthlyConsumption = await MeterReading.findAll({
      attributes: [
        [fn("date_trunc", "month", col("readingDate")), "month"],
        [fn("sum", col("consumption")), "totalConsumption"],
      ],
      where: {
        readingDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: [],
          where: propertyWhereClause,
        },
      ],
      group: [fn("date_trunc", "month", col("readingDate"))],
      order: [fn("date_trunc", "month", col("readingDate"))],
      raw: true,
    })

    // Get recent payments
    const recentPayments = await Payment.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      limit: 10,
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
          attributes: ["id", "propertyName", "address", "meterNumber", "propertyType"],
          where: propertyWhereClause,
        },
      ],
    })

    // Get top consumers
    const topConsumers = await MeterReading.findAll({
      attributes: ["propertyId", [fn("sum", col("consumption")), "totalConsumption"]],
      where: {
        readingDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["propertyName", "address", "meterNumber", "propertyType", "userId"],
          where: propertyWhereClause,
          include: [
            {
              model: User,
              as: "owner",
              attributes: ["firstName", "lastName", "email"],
            },
          ],
        },
      ],
      group: ["propertyId", "property.id", "property.owner.id"],
      order: [[literal("totalConsumption"), "DESC"]],
      limit: 10,
      raw: true,
      nest: true,
    })

    res.status(200).json({
      summary: {
        totalUsers,
        totalProperties,
        totalRevenue,
        totalConsumption,
        averageRevenuePerProperty: totalProperties > 0 ? totalRevenue / totalProperties : 0,
        averageConsumptionPerProperty: totalProperties > 0 ? totalConsumption / totalProperties : 0,
      },
      revenueByPropertyType,
      consumptionByPropertyType,
      monthlyRevenue,
      monthlyConsumption,
      recentPayments,
      topConsumers,
    })
  } catch (error) {
    logger.error("Get admin dashboard error:", error)
    res.status(500).json({ message: "Error retrieving dashboard data" })
  }
}

