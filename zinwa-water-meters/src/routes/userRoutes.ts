import express from "express"
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  updateUserRole,
} from "../controllers/userController"
import { authenticate, isAdmin, isSuperAdmin, isOwnerOrAdmin } from "../middleware/auth"
import { userValidators, validate } from "../middleware/validators"

const router = express.Router()

// Get all users (admin only)
router.get("/", authenticate, isAdmin, getAllUsers)

// Get user by ID
router.get("/:id", authenticate, isOwnerOrAdmin("id"), getUserById)

// Update user
router.put("/:id", authenticate, isOwnerOrAdmin("id"), userValidators.update, validate, updateUser)

// Delete user (admin only)
router.delete("/:id", authenticate, isAdmin, deleteUser)

// Create user (admin only)
router.post("/", authenticate, isAdmin, userValidators.register, validate, createUser)

// Update user role (super admin only)
router.patch("/:id/role", authenticate, isSuperAdmin, updateUserRole)

export default router

