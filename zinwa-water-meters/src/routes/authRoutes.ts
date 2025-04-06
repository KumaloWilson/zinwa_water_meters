import express from "express"
import {
  register,
  login,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController"
import { authenticate } from "../middleware/auth"
import { userValidators, validate } from "../middleware/validators"

const router = express.Router()

// Register a new user
router.post("/register", userValidators.register, validate, register)

// Login user
router.post("/login", userValidators.login, validate, login)

// Get current user
router.get("/me", authenticate, getCurrentUser)

// Change password
router.post("/change-password", authenticate, userValidators.changePassword, validate, changePassword)

// Forgot password
router.post("/forgot-password", userValidators.forgotPassword, validate, forgotPassword)

// Reset password
router.post("/reset-password", userValidators.resetPassword, validate, resetPassword)

// Verify email
router.get("/verify-email/:token", verifyEmail)

export default router

