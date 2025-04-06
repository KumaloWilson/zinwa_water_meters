import express from "express"
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController"
import { authenticate, isAdmin } from "../middleware/auth"

const router = express.Router()

// Create notification (admin only)
router.post("/", authenticate, isAdmin, createNotification)

// Get all notifications for a user
router.get("/user/:userId?", authenticate, getUserNotifications)

// Mark notification as read
router.patch("/:id/read", authenticate, markNotificationAsRead)

// Mark all notifications as read
router.patch("/user/:userId?/read-all", authenticate, markAllNotificationsAsRead)

// Delete notification
router.delete("/:id", authenticate, deleteNotification)

export default router

