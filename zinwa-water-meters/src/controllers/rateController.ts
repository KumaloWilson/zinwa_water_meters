import type { Request, Response } from "express"
import { Rate, PropertyType } from "../models"
import { logger } from "../utils/logger"
import { Op } from "sequelize"

// Create rate
export const createRate = async (req: Request, res: Response) => {
  try {
    const { propertyType, ratePerUnit, fixedCharge, minimumCharge, effectiveDate, description } = req.body

    // Check if there's an active rate for this property type
    const existingRate = await Rate.findOne({
      where: {
        propertyType,
        isActive: true,
        effectiveDate: {
          [Op.lte]: effectiveDate || new Date(),
        },
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gt]: effectiveDate || new Date() } }],
      },
    })

    if (existingRate) {
      // Set end date for existing rate
      existingRate.endDate = effectiveDate || new Date()
      existingRate.isActive = false
      await existingRate.save()
    }

    // Create new rate
    const rate = await Rate.create({
      propertyType,
      ratePerUnit,
      fixedCharge: fixedCharge || 0,
      minimumCharge: minimumCharge || 0,
      effectiveDate: effectiveDate || new Date(),
      description,
      isActive: true,
    })

    res.status(201).json({
      message: "Rate created successfully",
      rate,
    })
  } catch (error) {
    logger.error("Create rate error:", error)
    res.status(500).json({ message: "Error creating rate" })
  }
}

// Get all rates
export const getAllRates = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const isActive = req.query.isActive === "true"

    let whereClause = {}
    if (req.query.isActive !== undefined) {
      whereClause = { isActive }
    }

    const { count, rows } = await Rate.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["effectiveDate", "DESC"]],
    })

    res.status(200).json({
      rates: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get all rates error:", error)
    res.status(500).json({ message: "Error retrieving rates" })
  }
}

// Get rate by ID
export const getRateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const rate = await Rate.findByPk(id)
    if (!rate) {
      return res.status(404).json({ message: "Rate not found" })
    }

    res.status(200).json({ rate })
  } catch (error) {
    logger.error("Get rate by ID error:", error)
    res.status(500).json({ message: "Error retrieving rate" })
  }
}

// Get current rate by property type
export const getCurrentRateByPropertyType = async (req: Request, res: Response) => {
  try {
    const { propertyType } = req.params

    if (!Object.values(PropertyType).includes(propertyType as PropertyType)) {
      return res.status(400).json({ message: "Invalid property type" })
    }

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
      return res.status(404).json({ message: "No active rate found for this property type" })
    }

    res.status(200).json({ rate })
  } catch (error) {
    logger.error("Get current rate by property type error:", error)
    res.status(500).json({ message: "Error retrieving rate" })
  }
}

// Update rate
export const updateRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { ratePerUnit, fixedCharge, minimumCharge, isActive, endDate, description } = req.body

    const rate = await Rate.findByPk(id)
    if (!rate) {
      return res.status(404).json({ message: "Rate not found" })
    }

    // Update rate fields
    if (ratePerUnit !== undefined) rate.ratePerUnit = ratePerUnit
    if (fixedCharge !== undefined) rate.fixedCharge = fixedCharge
    if (minimumCharge !== undefined) rate.minimumCharge = minimumCharge
    if (isActive !== undefined) rate.isActive = isActive
    if (endDate) rate.endDate = new Date(endDate)
    if (description) rate.description = description

    await rate.save()

    res.status(200).json({
      message: "Rate updated successfully",
      rate,
    })
  } catch (error) {
    logger.error("Update rate error:", error)
    res.status(500).json({ message: "Error updating rate" })
  }
}

// Delete rate (admin only)
export const deleteRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const rate = await Rate.findByPk(id)
    if (!rate) {
      return res.status(404).json({ message: "Rate not found" })
    }

    await rate.destroy()

    res.status(200).json({ message: "Rate deleted successfully" })
  } catch (error) {
    logger.error("Delete rate error:", error)
    res.status(500).json({ message: "Error deleting rate" })
  }
}

