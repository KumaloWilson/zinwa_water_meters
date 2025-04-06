import express from "express"
import { authenticate, isAdmin, isSuperAdmin } from "../middleware/auth"

// Import controllers
import { createUser, updateUserRole, deleteUser } from "../controllers/userController"
import { createProperty, deleteProperty, changePropertyOwner } from "../controllers/propertyController"
import { createRate, updateRate, deleteRate } from "../controllers/rateController"
import { createManualPayment } from "../controllers/paymentController"
import { getAdminDashboard } from "../controllers/dashboardController"
import { createNotification } from "../controllers/notificationController"

// Import validators
import {
  userValidators,
  propertyValidators,
  rateValidators,
  paymentValidators,
  dashboardValidators,
  validate,
} from "../middleware/validators"

const router = express.Router()

// Admin dashboard
router.get("/dashboard", authenticate, isAdmin, dashboardValidators.adminDashboard, validate, getAdminDashboard)

// User management
router.post("/users", authenticate, isAdmin, userValidators.register, validate, createUser)
router.patch("/users/:id/role", authenticate, isSuperAdmin, updateUserRole)
router.delete("/users/:id", authenticate, isAdmin, deleteUser)

// Property management
router.post("/properties", authenticate, isAdmin, propertyValidators.create, validate, createProperty)
router.delete("/properties/:id", authenticate, isAdmin, propertyValidators.getById, validate, deleteProperty)
router.patch("/properties/:id/owner", authenticate, isAdmin, changePropertyOwner)

// Rate management
router.post("/rates", authenticate, isAdmin, rateValidators.create, validate, createRate)
router.put("/rates/:id", authenticate, isAdmin, rateValidators.update, validate, updateRate)
router.delete("/rates/:id", authenticate, isAdmin, rateValidators.getById, validate, deleteRate)

// Payment management
router.post("/payments/manual", authenticate, isAdmin, paymentValidators.create, validate, createManualPayment)

// Notification management
router.post("/notifications", authenticate, isAdmin, createNotification)

export default router

