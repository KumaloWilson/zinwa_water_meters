import express from "express"
import {
  createMeterReading,
  getAllMeterReadings,
  getMeterReadingById,
  getMeterReadingsByPropertyId,
  updateMeterReading,
  deleteMeterReading,
} from "../controllers/meterReadingController"
import { authenticate, isAdmin } from "../middleware/auth"
import { meterReadingValidators, validate } from "../middleware/validators"

const router = express.Router()

// Create meter reading
router.post("/", authenticate, meterReadingValidators.create, validate, createMeterReading)

// Get all meter readings (admin only)
router.get("/", authenticate, isAdmin, getAllMeterReadings)

// Get meter reading by ID
router.get("/:id", authenticate, meterReadingValidators.getById, validate, getMeterReadingById)

// Get meter readings by property ID
router.get(
  "/property/:propertyId",
  authenticate,
  meterReadingValidators.getByProperty,
  validate,
  getMeterReadingsByPropertyId,
)

// Update meter reading (admin only)
router.put("/:id", authenticate, isAdmin, meterReadingValidators.update, validate, updateMeterReading)

// Delete meter reading (admin only)
router.delete("/:id", authenticate, isAdmin, meterReadingValidators.getById, validate, deleteMeterReading)

export default router

