import express from "express"
import {
  purchaseToken,
  completeTokenPurchase,
  getAllTokens,
  getTokenById,
  getTokensByPropertyId,
  getTokensByUserId,
  verifyToken,
  applyToken,
} from "../controllers/tokenController"
import { authenticate, isAdmin, isOwnerOrAdmin } from "../middleware/auth"
import { tokenValidators, validate } from "../middleware/validators"

const router = express.Router()

// Purchase token
router.post("/purchase", authenticate, tokenValidators.purchase, validate, purchaseToken)

// Complete token purchase (callback from payment gateway)
router.post("/complete", completeTokenPurchase)

// Get all tokens (admin only)
router.get("/", authenticate, isAdmin, getAllTokens)

// Get token by ID
router.get("/:id", authenticate, tokenValidators.getById, validate, getTokenById)

// Get tokens by property ID
router.get("/property/:propertyId", authenticate, tokenValidators.getByProperty, validate, getTokensByPropertyId)

// Get tokens by user ID
router.get(
  "/user/:userId",
  authenticate,
  isOwnerOrAdmin("userId"),
  tokenValidators.getByUser,
  validate,
  getTokensByUserId,
)

// Verify token
router.post("/verify", verifyToken)

// Apply token
router.post("/apply", applyToken)

export default router

