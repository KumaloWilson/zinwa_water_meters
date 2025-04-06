import express from "express"
import { getCustomerDashboard, getAdminDashboard } from "../controllers/dashboardController"
import { authenticate, isAdmin } from "../middleware/auth"
import { dashboardValidators, validate } from "../middleware/validators"

const router = express.Router()

// Get customer dashboard
router.get("/customer", authenticate, dashboardValidators.customerDashboard, validate, getCustomerDashboard)

// Get admin dashboard (admin only)
router.get("/admin", authenticate, isAdmin, dashboardValidators.adminDashboard, validate, getAdminDashboard)

export default router

