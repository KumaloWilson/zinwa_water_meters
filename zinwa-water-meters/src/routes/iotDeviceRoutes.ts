/**
 * Property management routes for handling tokens, balances, top-ups, and water usage
 */
import { Router } from "express"
import { applyToken, getPropertyBalance, recordWaterUsage } from "../controllers/iotDeviceController"
import { body, param } from "express-validator"

import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validators"


const router = Router()

router.post(
  "/tokens/apply", 
  [
    body("tokenValue").notEmpty().withMessage("Token value is required"),
    body("meterNumber").optional().notEmpty().withMessage("Meter number cannot be empty"),
    validate
  ],
  applyToken
)

// Property balance routes
router.get(
  "/properties/:id/balance", 
  [
    param("id").isUUID().withMessage("Valid property ID is required"),
    validate
  ],
  getPropertyBalance
)


// Water usage routes
router.post(
  "/properties/:id/deduct", 
  [
    param("id").isUUID().withMessage("Valid property ID is required"),
    body("reading").optional().isFloat({ min: 0 }).withMessage("Reading must be a non-negative number"),
    body("units").optional().isFloat({ min: 0 }).withMessage("Units must be a non-negative number"),
    validate
  ],
  recordWaterUsage
)

export default router