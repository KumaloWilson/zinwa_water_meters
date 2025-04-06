import express from "express"
import {
  createRate,
  getAllRates,
  getRateById,
  getCurrentRateByPropertyType,
  updateRate,
  deleteRate,
} from "../controllers/rateController"
import { authenticate, isAdmin } from "../middleware/auth"
import { rateValidators, validate } from "../middleware/validators"

const router = express.Router()

// Create rate (admin only)
router.post("/", authenticate, isAdmin, rateValidators.create, validate, createRate)

// Get all rates
router.get("/", authenticate, getAllRates)

// Get rate by ID
router.get("/:id", authenticate, rateValidators.getById, validate, getRateById)

// Get current rate by property type
router.get("/property-type/:propertyType", authenticate, getCurrentRateByPropertyType)

// Update rate (admin only)
router.put("/:id", authenticate, isAdmin, rateValidators.update, validate, updateRate)

// Delete rate (admin only)
router.delete("/:id", authenticate, isAdmin, rateValidators.getById, validate, deleteRate)

export default router

