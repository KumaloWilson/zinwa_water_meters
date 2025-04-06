import type { Request, Response } from "express"
import { User, UserRole, Property } from "../models"
import { logger } from "../utils/logger"
import { sendEmail } from "../utils/email"
import { Op } from "sequelize"

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const search = req.query.search as string

    let whereClause = {}
    if (search) {
      whereClause = {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phoneNumber: { [Op.iLike]: `%${search}%` } },
        ],
      }
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
    })

    res.status(200).json({
      users: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    })
  } catch (error) {
    logger.error("Get all users error:", error)
    res.status(500).json({ message: "Error retrieving users" })
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
      include: [
        {
          model: Property,
          as: "properties",
        },
      ],
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the requesting user is the same as the requested user or an admin
    if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.status(200).json({ user })
  } catch (error) {
    logger.error("Get user by ID error:", error)
    res.status(500).json({ message: "Error retrieving user" })
  }
}

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { firstName, lastName, phoneNumber, address, nationalId } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if the requesting user is the same as the user being updated or an admin
    if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Update user fields
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (phoneNumber) user.phoneNumber = phoneNumber
    if (address) user.address = address
    if (nationalId) user.nationalId = nationalId

    await user.save()

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        nationalId: user.nationalId,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error("Update user error:", error)
    res.status(500).json({ message: "Error updating user" })
  }
}

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Only super admin can delete other admins
    if (user.role === UserRole.ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: "Only super admins can delete admin users" })
    }

    await user.destroy()

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    logger.error("Delete user error:", error)
    res.status(500).json({ message: "Error deleting user" })
  }
}

// Create user (admin only)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address, nationalId, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Generate a random password if not provided
    const userPassword = password || Math.random().toString(36).slice(-8)

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: userPassword,
      phoneNumber,
      address,
      nationalId,
      role: role || UserRole.CUSTOMER,
      isVerified: true, // Admin-created users are automatically verified
    })

    // Send welcome email with credentials
    try {
      await sendEmail(user.email, "welcome", {
        name: user.fullName,
        email: user.email,
        password: userPassword,
      })
    } catch (error) {
      logger.error("Error sending welcome email:", error)
      // Continue even if email fails
    }

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error("Create user error:", error)
    res.status(500).json({ message: "Error creating user" })
  }
}

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Only super admin can promote to admin or super admin
    if ((role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) && req.user?.role !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: "Only super admins can promote users to admin roles" })
    }

    user.role = role
    await user.save()

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    logger.error("Update user role error:", error)
    res.status(500).json({ message: "Error updating user role" })
  }
}

