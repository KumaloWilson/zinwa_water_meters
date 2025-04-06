import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { User, UserRole } from "../models"
import { sendEmail } from "../utils/email"
import { logger } from "../utils/logger"

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  })
}

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address, nationalId, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      nationalId,
      role:
        req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN
          ? role || UserRole.CUSTOMER
          : UserRole.CUSTOMER,
    })

    // Generate token
    const token = generateToken(user.id)

    // Send welcome email
    try {
      await sendEmail(user.email, "welcome", {
        name: user.fullName,
        email: user.email,
        password: password, // This is the original password before hashing
      })
    } catch (error) {
      logger.error("Error sending welcome email:", error)
      // Continue even if email fails
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    logger.error("Registration error:", error)
    res.status(500).json({ message: "Error registering user" })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user.id)

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
      token,
    })
  } catch (error) {
    logger.error("Login error:", error)
    res.status(500).json({ message: "Error logging in" })
  }
}

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    res.status(200).json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        address: req.user.address,
        nationalId: req.user.nationalId,
        role: req.user.role,
        isVerified: req.user.isVerified,
        lastLogin: req.user.lastLogin,
      },
    })
  } catch (error) {
    logger.error("Get current user error:", error)
    res.status(500).json({ message: "Error getting user information" })
  }
}

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const { currentPassword, newPassword } = req.body

    // Validate current password
    const isPasswordValid = await req.user.validatePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Update password
    req.user.password = newPassword
    await req.user.save()

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    logger.error("Change password error:", error)
    res.status(500).json({ message: "Error changing password" })
  }
}

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ message: "Password reset email sent if account exists" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`

    // TODO: Implement email sending
    // For now, just return the token in the response (for development)
    res.status(200).json({
      message: "Password reset email sent",
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    })
  } catch (error) {
    logger.error("Forgot password error:", error)
    res.status(500).json({ message: "Error processing password reset request" })
  }
}

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body

    // Find user by reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    // Update password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    logger.error("Reset password error:", error)
    res.status(500).json({ message: "Error resetting password" })
  }
}

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    // Find user by verification token
    const user = await User.findOne({ where: { resetPasswordToken: token } })
    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" })
    }

    // Update user verification status
    user.isVerified = true
    user.resetPasswordToken = undefined
    await user.save()

    res.status(200).json({ message: "Email verified successfully" })
  } catch (error) {
    logger.error("Email verification error:", error)
    res.status(500).json({ message: "Error verifying email" })
  }
}

