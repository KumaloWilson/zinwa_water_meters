import express from "express"
import {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByUserId,
  updateProperty,
  deleteProperty,
  changePropertyOwner,
} from "../controllers/propertyController"
import { authenticate, isAdmin, isOwnerOrAdmin } from "../middleware/auth"
import { propertyValidators, validate } from "../middleware/validators"

const router = express.Router()

// Create property
router.post("/", authenticate, propertyValidators.create, validate, createProperty)

// Get all properties
router.get("/", authenticate, getAllProperties)

// Get property by ID
router.get(
  "/:id",
   authenticate,
    // isOwnerOrAdmin("id"),
     propertyValidators.getById,
      validate, getPropertyById
    )

// Get properties by user ID
router.get(
  "/user/:userId",
  authenticate,
  isOwnerOrAdmin("userId"),
  propertyValidators.getByUser,
  validate,
  getPropertiesByUserId,
)

// Update property
router.put("/:id", authenticate, isOwnerOrAdmin("id"), propertyValidators.update, validate, updateProperty)

// Delete property (admin only)
router.delete("/:id", authenticate, isAdmin, propertyValidators.getById, validate, deleteProperty)

// Change property owner (admin only)
router.patch("/:id/owner", authenticate, isAdmin, changePropertyOwner)

export default router

