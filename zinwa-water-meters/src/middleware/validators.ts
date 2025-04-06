import type { Request, Response, NextFunction } from "express"
import { body, param, query, validationResult } from "express-validator"
import { PropertyType, UserRole } from "../models"

// Validate request
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

// User validators
export const userValidators = {
  register: [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    body("phoneNumber")
      .matches(/^(\+263|0)7[7-8][0-9]{7}$/)
      .withMessage("Valid Zimbabwean phone number is required"),
    body("role").optional().isIn(Object.values(UserRole)).withMessage("Invalid role"),
  ],
  login: [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  update: [
    body("firstName").optional().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("phoneNumber")
      .optional()
      .matches(/^(\+263|0)7[7-8][0-9]{7}$/)
      .withMessage("Valid Zimbabwean phone number is required"),
    body("address").optional(),
    body("nationalId").optional(),
  ],
  changePassword: [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  forgotPassword: [body("email").isEmail().withMessage("Valid email is required")],
  resetPassword: [
    body("token").notEmpty().withMessage("Token is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
}

// Property validators
export const propertyValidators = {
  create: [
    body("userId").optional().isUUID().withMessage("Valid user ID is required"),
    body("propertyName").notEmpty().withMessage("Property name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("meterNumber").notEmpty().withMessage("Meter number is required"),
    body("propertyType").isIn(Object.values(PropertyType)).withMessage("Valid property type is required"),
    body("city").optional(),
    body("province").optional(),
    body("postalCode").optional(),
    body("latitude").optional().isFloat().withMessage("Latitude must be a number"),
    body("longitude").optional().isFloat().withMessage("Longitude must be a number"),
  ],
  update: [
    param("id").isUUID().withMessage("Valid property ID is required"),
    body("propertyName").optional().notEmpty().withMessage("Property name cannot be empty"),
    body("address").optional().notEmpty().withMessage("Address cannot be empty"),
    body("propertyType").optional().isIn(Object.values(PropertyType)).withMessage("Valid property type is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
    body("city").optional(),
    body("province").optional(),
    body("postalCode").optional(),
    body("latitude").optional().isFloat().withMessage("Latitude must be a number"),
    body("longitude").optional().isFloat().withMessage("Longitude must be a number"),
  ],
  getById: [param("id").isUUID().withMessage("Valid property ID is required")],
  getByUser: [param("userId").isUUID().withMessage("Valid user ID is required")],
}

// Token validators
export const tokenValidators = {
  purchase: [
    body("propertyId").isUUID().withMessage("Valid property ID is required"),
    body("amount").isFloat({ min: 1 }).withMessage("Amount must be a positive number"),
  ],
  getById: [param("id").isUUID().withMessage("Valid token ID is required")],
  getByProperty: [param("propertyId").isUUID().withMessage("Valid property ID is required")],
  getByUser: [param("userId").isUUID().withMessage("Valid user ID is required")],
}

// Payment validators
export const paymentValidators = {
  create: [
    body("propertyId").isUUID().withMessage("Valid property ID is required"),
    body("amount").isFloat({ min: 1 }).withMessage("Amount must be a positive number"),
    body("paymentMethod").optional(),
  ],
  update: [
    param("id").isUUID().withMessage("Valid payment ID is required"),
    body("status").optional(),
    body("transactionId").optional(),
    body("paymentDetails").optional(),
  ],
  getById: [param("id").isUUID().withMessage("Valid payment ID is required")],
  getByUser: [param("userId").isUUID().withMessage("Valid user ID is required")],
  getByProperty: [param("propertyId").isUUID().withMessage("Valid property ID is required")],
}

// Rate validators
export const rateValidators = {
  create: [
    body("propertyType").isIn(Object.values(PropertyType)).withMessage("Valid property type is required"),
    body("ratePerUnit").isFloat({ min: 0 }).withMessage("Rate per unit must be a non-negative number"),
    body("fixedCharge").optional().isFloat({ min: 0 }).withMessage("Fixed charge must be a non-negative number"),
    body("minimumCharge").optional().isFloat({ min: 0 }).withMessage("Minimum charge must be a non-negative number"),
    body("effectiveDate").optional().isISO8601().withMessage("Effective date must be a valid date"),
    body("description").optional(),
  ],
  update: [
    param("id").isUUID().withMessage("Valid rate ID is required"),
    body("ratePerUnit").optional().isFloat({ min: 0 }).withMessage("Rate per unit must be a non-negative number"),
    body("fixedCharge").optional().isFloat({ min: 0 }).withMessage("Fixed charge must be a non-negative number"),
    body("minimumCharge").optional().isFloat({ min: 0 }).withMessage("Minimum charge must be a non-negative number"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
    body("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
    body("description").optional(),
  ],
  getById: [param("id").isUUID().withMessage("Valid rate ID is required")],
}

// Meter reading validators
export const meterReadingValidators = {
  create: [
    body("propertyId").isUUID().withMessage("Valid property ID is required"),
    body("reading").isFloat({ min: 0 }).withMessage("Reading must be a non-negative number"),
    body("readingDate").optional().isISO8601().withMessage("Reading date must be a valid date"),
    body("isEstimated").optional().isBoolean().withMessage("isEstimated must be a boolean"),
    body("notes").optional(),
  ],
  update: [
    param("id").isUUID().withMessage("Valid meter reading ID is required"),
    body("reading").optional().isFloat({ min: 0 }).withMessage("Reading must be a non-negative number"),
    body("readingDate").optional().isISO8601().withMessage("Reading date must be a valid date"),
    body("isEstimated").optional().isBoolean().withMessage("isEstimated must be a boolean"),
    body("notes").optional(),
  ],
  getById: [param("id").isUUID().withMessage("Valid meter reading ID is required")],
  getByProperty: [param("propertyId").isUUID().withMessage("Valid property ID is required")],
}

// Dashboard validators
export const dashboardValidators = {
  customerDashboard: [
    query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
    query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
  ],
  adminDashboard: [
    query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
    query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
    query("propertyType").optional().isIn(Object.values(PropertyType)).withMessage("Valid property type is required"),
  ],
}

