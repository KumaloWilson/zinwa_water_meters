import type { Request, Response } from "express"
import { Notification, NotificationType, User } from "../models"
import { logger } from "../utils/logger"

// Create notification
export const createNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type, link, metadata } = req.body

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Create notification
    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || NotificationType.SYSTEM,
      isRead: false,
      link,
      metadata,
    })

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    })
  } catch (error) {
    logger.error("Create notification error:", error)
    res.status(500).json({ message: "Error creating notification" })
  }
}

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const userId = req.params.userId || req.user.id
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit
    const isRead = req.query.isRead === "true"
    const type = req.query.type as NotificationType

    // Check if the requesting user is the owner or an admin
    if (req.user.id !== userId && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const whereClause: any = { userId }

    if (req.query.isRead !== undefined) {
      whereClause.isRead = isRead
    }

    if (type) {
      whereClause.type = type
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    res.status(200).json({
      notifications: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      unreadCount: await Notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    })
  } catch (error) {
    logger.error("Get user notifications error:", error)
    res.status(500).json({ message: "Error retrieving notifications" })
  }
}

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const notification = await Notification.findByPk(id)
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== notification.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    notification.isRead = true
    await notification.save()

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    })
  } catch (error) {
    logger.error("Mark notification as read error:", error)
    res.status(500).json({ message: "Error updating notification" })
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const userId = req.params.userId || req.user.id

    // Check if the requesting user is the owner or an admin
    if (req.user.id !== userId && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false,
        },
      },
    )

    res.status(200).json({
      message: "All notifications marked as read",
    })
  } catch (error) {
    logger.error("Mark all notifications as read error:", error)
    res.status(500).json({ message: "Error updating notifications" })
  }
}

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const notification = await Notification.findByPk(id)
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if the requesting user is the owner or an admin
    if (req.user?.id !== notification.userId && req.user?.role !== "admin" && req.user?.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    await notification.destroy()

    res.status(200).json({
      message: "Notification deleted successfully",
    })
  } catch (error) {
    logger.error("Delete notification error:", error)
    res.status(500).json({ message: "Error deleting notification" })
  }
}

