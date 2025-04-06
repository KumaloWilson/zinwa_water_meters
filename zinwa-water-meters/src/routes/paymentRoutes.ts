import express from "express"
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByUserId,
  getPaymentsByPropertyId,
  updatePaymentStatus,
  createManualPayment,
} from "../controllers/paymentController"
import { authenticate, isAdmin, isOwnerOrAdmin } from "../middleware/auth"
import { paymentValidators, validate } from "../middleware/validators"

const router = express.Router()

// Get all payments (admin only)
router.get("/", authenticate, isAdmin, getAllPayments)

// Get payment by ID
router.get("/:id", authenticate, paymentValidators.getById, validate, getPaymentById)

// Get payments by user ID
router.get(
  "/user/:userId",
  authenticate,
  isOwnerOrAdmin("userId"),
  paymentValidators.getByUser,
  validate,
  getPaymentsByUserId,
)

// Get payments by property ID
router.get("/property/:propertyId", authenticate, paymentValidators.getByProperty, validate, getPaymentsByPropertyId)

// Update payment status (webhook from payment gateway)
router.post("/update", updatePaymentStatus)

// Create manual payment (admin only)
router.post("/manual", authenticate, isAdmin, paymentValidators.create, validate, createManualPayment)

export default router

