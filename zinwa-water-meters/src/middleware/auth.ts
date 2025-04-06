import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User, UserRole } from "../models"
import { logger } from "../utils/logger"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

// Verify JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error("Authentication error:", error)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ message: "Admin access required" })
  }

  next()
}

// Check if user is super admin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ message: "Super admin access required" })
  }

  next()
}

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = (resourceField: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const resourceId = req.params[resourceField]

    if (!resourceId) {
      return res.status(400).json({ message: `Resource ID (${resourceField}) is required` })
    }

    // Admins can access any resource
    if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN) {
      return next()
    }

    // For customers, check if they own the resource
    const isOwner = req.user.id === resourceId || req.body.userId === req.user.id

    if (!isOwner) {
      return res.status(403).json({ message: "Access denied" })
    }

    next()
  }
}

