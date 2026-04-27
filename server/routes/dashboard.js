/**
 * Dashboard Routes
 * ================
 * All endpoints in this file require JWT authentication (see middleware below)
 * 
 * Middleware flow:
 * 1. Request arrives with Authorization: Bearer <JWT_TOKEN> header
 * 2. authenticate() middleware validates token and extracts user info
 * 3. req.user is set with decoded token data
 * 4. Route handler executes with authenticated user context
 */

import express from "express";
import {
    getUser,
    getPortfolio,
    getTransactions,
    getNotifications,
    markNotificationAsRead,
    getDashboardStats,
    updateUserSettings
} from "../controllers/dashboardController.js";
import { getDepositSettings } from "../controllers/adminController.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

/**
 * Apply authentication middleware to ALL routes in this router
 * This ensures every endpoint requires a valid JWT token
 */
router.use(authenticate);

// ============================================
// USER PROFILE ENDPOINTS
// ============================================

/**
 * GET /api/dashboard/user
 * Fetch authenticated user's profile information
 * No additional parameters needed - uses authenticated user's ID from JWT
 */
router.get("/user", getUser);

// ============================================
// PORTFOLIO & BALANCE ENDPOINTS
// ============================================

/**
 * GET /api/dashboard/portfolio
 * Fetch user's portfolio metrics and holdings
 * Returns: totalBalance, roi, activeTradesCount, activeInvestments, openPositions
 */
router.get("/portfolio", getPortfolio);

/**
 * GET /api/dashboard/stats
 * Fetch dashboard statistics summary
 * Returns: totalBalance, activeTradesCount, roi, monthlyProfit, lastTransactionDate
 */
router.get("/stats", getDashboardStats);

// ============================================
// TRANSACTION HISTORY ENDPOINTS
// ============================================

/**
 * GET /api/dashboard/transactions
 * Fetch user's transaction history with pagination
 * 
 * Query Parameters:
 *   - limit: Max number of transactions (default: 50)
 *   - offset: Pagination offset (default: 0)
 * 
 * Example: GET /api/dashboard/transactions?limit=20&offset=0
 */
router.get("/transactions", getTransactions);

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================

/**
 * GET /api/dashboard/notifications
 * Fetch user's notifications
 * 
 * Query Parameters:
 *   - unreadOnly: Set to 'true' to only return unread notifications (default: false)
 * 
 * Example: GET /api/dashboard/notifications?unreadOnly=true
 */
router.get("/notifications", getNotifications);

/**
 * PATCH /api/dashboard/notifications/:notificationId/read
 * Mark a specific notification as read
 * 
 * Parameters:
 *   - notificationId: ID of the notification to mark as read
 * 
 * Example: PATCH /api/dashboard/notifications/notif123/read
 */
router.patch("/notifications/:notificationId/read", markNotificationAsRead);

// ============================================
// DEPOSIT SETTINGS ENDPOINTS
// ============================================

/**
 * GET /api/dashboard/deposit-settings
 * Fetch global deposit method settings for display to users
 */
router.get("/deposit-settings", getDepositSettings);

// ============================================
// SETTINGS ENDPOINTS
// ============================================

/**
 * PUT /api/dashboard/user/settings
 * Update user settings and preferences
 * 
 * Request Body:
 * {
 *   "currency": "USD",
 *   "country": "United States",
 *   "accountType": "trader",
 *   "notifications": { "email": true, "push": false }
 * }
 * 
 * All fields are optional - only provided fields will be updated
 */
router.put("/user/settings", updateUserSettings);

export default router;
