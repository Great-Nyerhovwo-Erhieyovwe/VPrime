import express from "express";
import authRoutes from "./auth.js";
import adminRoutes from "./admin.js";
import dashboardRoutes from "./dashboard.js";
import marketRoutes from "./market.js";
import requestsRoutes from "./requests.js";

const router = express.Router();

// ============================================
// API ROUTE GROUPS
// ============================================

// Authentication routes (login, signup, OTP verification, etc.)
router.use('/auth', authRoutes);

// Admin routes (admin-only operations)
router.use('/admin', adminRoutes);

// Dashboard routes (user portfolio, transactions, notifications, etc.)
// All dashboard endpoints require JWT authentication
router.use('/dashboard', dashboardRoutes);

// Request routes (deposits, withdrawals, trades, upgrades, verifications, settings)
// All request endpoints require JWT authentication
router.use('/requests', requestsRoutes);

// Market data (public)
router.use('/market', marketRoutes);

export default router;
