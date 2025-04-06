import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"
// Import ValidationError as a value, not just a type
import { ValidationError, validationResult } from "express-validator"

// Custom error class
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

// Global error handler middleware
export const errorHandler = (err: Error | AppError | any, req: Request, res: Response, next: NextFunction) => {
  // Log error
  logger.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Handle specific error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    })
  }

  // Handle Sequelize validation errors
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    const errors = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
    }))

    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors,
    })
  }

  // Handle express-validator errors
  // Check if err is an array of objects with a msg property instead of using instanceof
  if (Array.isArray(err) && err.length > 0 && 'msg' in err[0]) {
    const errors = err.map((e: any) => ({
      field: e.type === 'field' ? e.path : e.type,
      message: e.msg,
    }))

    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors,
    })
  }

  // Check for validation errors from express-validator's validationResult
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const errors = validationErrors.array().map(e => ({
      field: e.type === 'field' ? e.path : e.type,
      message: e.msg,
    }));

    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expired",
    })
  }

  // Default error response for unhandled errors
  const statusCode = err.statusCode || 500
  const message = process.env.NODE_ENV === "production" ? "Something went wrong" : err.message || "Something went wrong"

  return res.status(statusCode).json({
    status: "error",
    message,
  })
}