import type { Request, Response } from "express"
import { Property, type PropertyType, User, MeterReading, Token } from "../models"
import { logger } from "../utils/logger"
import { Op } from "sequelize"

// Create property
export const createProperty = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      propertyName,
      address,
      meterNumber,
      propertyType,
      city,
      province,
      postalCode,
      latitude,
      longitude,
    } = req.body

    // Check if meter number already exists
    const existingProperty = await Property.findOne({ where: { meterNumber } })
    if (existingProperty) {
      return res.status(400).json({ message: "Property with this meter number already exists" })
    }

    // If userId is provided, check if user exists
    let ownerId = userId
    if (!ownerId && req.user) {
      ownerId = req.user.id
    }

    const user = await User.findByPk(ownerId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Create property
    const property = await Property.create({
      userId: ownerId,
      propertyName,
      address,
      meterNumber,
      propertyType,
      city,
      province,
      postalCode,
      latitude,
      longitude,
      currentBalance: 0,
      totalConsumption: 0,
      isActive: true,
    })

    // Create initial meter reading
    await MeterReading.create({
      propertyId: property.id,
      reading: 0,
      consumption: 0,
      readingDate: new Date(),
      isEstimated: false,
      notes: "Initial meter reading",
    })

    res.status(201).json({
      message: "Property created successfully",
      property,
    })
  } catch (error) {
    logger.error("Create property error:", error)
    res.status(500).json({ message: "Error creating property" })
  }
}

// Get all properties
export const getAllProperties = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const search = req.query.search as string
    const propertyType = req.query.propertyType as PropertyType

    let whereClause: any = {}

    if (search) {
      whereClause = {
        [Op.or]: [
          { propertyName: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } },
          { meterNumber: { [Op.iLike]: `%${search}%` } },
          { city: { [Op.iLike]: `%${search}%` } },
        ],
      }
    }

    if (propertyType) {
      whereClause.propertyType = propertyType
    }

    const { count, rows } = await Property.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
      ],
    })

    res.status(200).json({
      properties: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get all properties error:", error)
    res.status(500).json({ message: "Error retrieving properties" })
  }
}

// Get property by ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const property = await Property.findByPk(id, {
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: MeterReading,
          as: "meterReadings",
          limit: 5,
          order: [["readingDate", "DESC"]],
        },
        {
          model: Token,
          as: "tokens",
          limit: 5,
          order: [["createdAt", "DESC"]],
        },
      ],
    })

    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== property.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    res.status(200).json({ property })
  } catch (error) {
    logger.error("Get property by ID error:", error)
    res.status(500).json({ message: "Error retrieving property" })
  }
}

// Get properties by user ID
export const getPropertiesByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { count, rows } = await Property.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: MeterReading,
          as: "meterReadings",
          limit: 1,
          order: [["readingDate", "DESC"]],
        },
      ],
    })

    res.status(200).json({
      properties: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get properties by user ID error:", error)
    res.status(500).json({ message: "Error retrieving properties" })
  }
}

// Update property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { propertyName, address, propertyType, isActive, city, province, postalCode, latitude, longitude } = req.body

    const property = await Property.findByPk(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== property.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Update property fields
    if (propertyName) property.propertyName = propertyName
    if (address) property.address = address
    if (propertyType) property.propertyType = propertyType
    if (isActive !== undefined) property.isActive = isActive
    if (city) property.city = city
    if (province) property.province = province
    if (postalCode) property.postalCode = postalCode
    if (latitude) property.latitude = latitude
    if (longitude) property.longitude = longitude

    await property.save()

    res.status(200).json({
      message: "Property updated successfully",
      property,
    })
  } catch (error) {
    logger.error("Update property error:", error)
    res.status(500).json({ message: "Error updating property" })
  }
}

// Delete property (admin only)
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const property = await Property.findByPk(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Only admins can delete properties
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await property.destroy()

    res.status(200).json({ message: "Property deleted successfully" })
  } catch (error) {
    logger.error("Delete property error:", error)
    res.status(500).json({ message: "Error deleting property" })
  }
}

// Change property owner
export const changePropertyOwner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    const property = await Property.findByPk(id)
    if (!property) {
      return res.status(404).json({ message: "Property not found" })
    }

    // Only admins can change property owners
    if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Check if new owner exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "New owner not found" })
    }

    property.userId = userId
    await property.save()

    res.status(200).json({
      message: "Property owner changed successfully",
      property,
    })
  } catch (error) {
    logger.error("Change property owner error:", error)
    res.status(500).json({ message: "Error changing property owner" })
  }
}

