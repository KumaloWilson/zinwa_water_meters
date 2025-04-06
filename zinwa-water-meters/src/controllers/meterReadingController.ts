import type { Request, Response } from "express"
import { MeterReading, Property } from "../models"
import { logger } from "../utils/logger"
import { Op } from "sequelize"

// Create meter reading
export const createMeterReading = async (req: Request, res: Response) => {
  try {
    const { propertyId, reading, readingDate, isEstimated, notes } = req.body

    // Check if property exists
    const property = await Property.findByPk(propertyId)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== property.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Get previous reading
    const previousReading = await MeterReading.findOne({
      where: { propertyId },
      order: [["readingDate", "DESC"]],
    })

    // Calculate consumption
    let consumption = 0
    if (previousReading) {
      if (reading < previousReading.reading) {
        return res.status(400).json({ message: "New reading cannot be less than previous reading" })
      }
      consumption = reading - previousReading.reading
    }

    // Create meter reading
    const meterReading = await MeterReading.create({
      propertyId,
      reading,
      consumption,
      readingDate: readingDate || new Date(),
      isEstimated: isEstimated || false,
      notes,
    })

    // Update property total consumption
    property.totalConsumption += consumption

    // Update property current balance
    property.currentBalance -= consumption
    if (property.currentBalance < 0) {
      property.currentBalance = 0
    }

    await property.save()

    res.status(201).json({
      message: "Meter reading created successfully",
      meterReading,
    })
  } catch (error) {
    logger.error("Create meter reading error:", error)
    res.status(500).json({ message: "Error creating meter reading" })
  }
}

// Get all meter readings
export const getAllMeterReadings = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    const whereClause: any = {}

    if (startDate && endDate) {
      whereClause.readingDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.readingDate = {
        [Op.gte]: new Date(startDate),
      }
    } else if (endDate) {
      whereClause.readingDate = {
        [Op.lte]: new Date(endDate),
      }
    }

    const { count, rows } = await MeterReading.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["readingDate", "DESC"]],
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber", "userId"],
        },
      ],
    })

    res.status(200).json({
      meterReadings: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get all meter readings error:", error)
    res.status(500).json({ message: "Error retrieving meter readings" })
  }
}

// Get meter reading by ID
export const getMeterReadingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const meterReading = await MeterReading.findByPk(id, {
      include: [
        {
          model: Property,
          as: "property",
          attributes: ["id", "propertyName", "address", "meterNumber", "userId"],
        },
      ],
    })

    if (!meterReading) {
      return res.status(404).json({ message: "Meter reading not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (
      req.user?.id !== meterReading.property.userId &&
      req.user?.role !== "admin" &&
      req.user?.role !== "super_admin"
    ) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.status(200).json({ meterReading })
  } catch (error) {
    logger.error("Get meter reading by ID error:", error)
    res.status(500).json({ message: "Error retrieving meter reading" })
  }
}

// Get meter readings by property ID
export const getMeterReadingsByPropertyId = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    // Check if property exists
    const property = await Property.findByPk(propertyId)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== property.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const whereClause: any = { propertyId }

    if (startDate && endDate) {
      whereClause.readingDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.readingDate = {
        [Op.gte]: new Date(startDate),
      }
    } else if (endDate) {
      whereClause.readingDate = {
        [Op.lte]: new Date(endDate),
      }
    }

    const { count, rows } = await MeterReading.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["readingDate", "DESC"]],
    })

    res.status(200).json({
      meterReadings: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get meter readings by property ID error:", error)
    res.status(500).json({ message: "Error retrieving meter readings" })
  }
}

// Update meter reading
export const updateMeterReading = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { reading, readingDate, isEstimated, notes } = req.body

    const meterReading = await MeterReading.findByPk(id, {
      include: [
        {
          model: Property,
          as: "property",
        },
      ],
    })

    if (!meterReading) {
      return res.status(404).json({ message: "Meter reading not found" })
    }

    // Only admins can update meter readings
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Calculate new consumption if reading is updated
    let newConsumption = meterReading.consumption
    if (reading !== undefined && reading !== meterReading.reading) {
      // Get previous reading
      const previousReading = await MeterReading.findOne({
        where: {
          propertyId: meterReading.propertyId,
          readingDate: {
            [Op.lt]: meterReading.readingDate,
          },
        },
        order: [["readingDate", "DESC"]],
      })

      if (previousReading && reading < previousReading.reading) {
        return res.status(400).json({ message: "New reading cannot be less than previous reading" })
      }

      // Calculate new consumption
      newConsumption = previousReading ? reading - previousReading.reading : reading

      // Update property total consumption
      const property = meterReading.property
      property.totalConsumption = property.totalConsumption - meterReading.consumption + newConsumption

      // Update property current balance
      property.currentBalance = property.currentBalance + meterReading.consumption - newConsumption
      if (property.currentBalance < 0) {
        property.currentBalance = 0
      }

      await property.save()
    }

    // Update meter reading
    if (reading !== undefined) meterReading.reading = reading
    if (newConsumption !== meterReading.consumption) meterReading.consumption = newConsumption
    if (readingDate) meterReading.readingDate = new Date(readingDate)
    if (isEstimated !== undefined) meterReading.isEstimated = isEstimated
    if (notes) meterReading.notes = notes

    await meterReading.save()

    res.status(200).json({
      message: "Meter reading updated successfully",
      meterReading,
    })
  } catch (error) {
    logger.error("Update meter reading error:", error)
    res.status(500).json({ message: "Error updating meter reading" })
  }
}

// Delete meter reading (admin only)
export const deleteMeterReading = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const meterReading = await MeterReading.findByPk(id, {
      include: [
        {
          model: Property,
          as: "property",
        },
      ],
    })

    if (!meterReading) {
      return res.status(404).json({ message: "Meter reading not found" })
    }

    // Only admins can delete meter readings
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Update property total consumption
    const property = meterReading.property
    property.totalConsumption -= meterReading.consumption

    // Update property current balance
    property.currentBalance += meterReading.consumption

    await property.save()

    await meterReading.destroy()

    res.status(200).json({ message: "Meter reading deleted successfully" })
  } catch (error) {
    logger.error("Delete meter reading error:", error)
    res.status(500).json({ message: "Error deleting meter reading" })
  }
}

