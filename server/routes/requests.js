/**
 * Request Routes - API endpoints for all user request submissions
 * ================================================================
 * 
 * Routes Organization:
 * POST   /api/requests/deposit           - Submit deposit request
 * GET    /api/requests/deposits          - Get user's deposit history
 * POST   /api/requests/withdrawal        - Submit withdrawal request
 * GET    /api/requests/withdrawals       - Get user's withdrawal history
 * POST   /api/requests/trade             - Execute trade
 * GET    /api/requests/trades            - Get user's trade history
 * POST   /api/requests/upgrade           - Submit upgrade request
 * GET    /api/requests/upgrades          - Get user's upgrade requests
 * POST   /api/requests/verify            - Submit verification request
 * GET    /api/requests/verifications     - Get user's verification requests
 * PUT    /api/requests/settings          - Update user settings
 * GET    /api/requests/settings          - Get user settings
 * GET    /api/requests/pending           - Get all pending requests
 * 
 * All routes require JWT authentication (Bearer token in Authorization header)
 */

// const express = require('express');
import express from 'express';
const router = express.Router();
import { authenticate } from '../middlewares/authenticate.js';
import {
  createDeposit,
  getUserDeposits,
  createWithdrawal,
  getUserWithdrawals,
  createTrade,
  getUserTrades,
  createUpgrade,
  getUserUpgrades,
  createVerification,
  getUserVerifications,
  updateSettings,
  getSettings,
  getPendingRequests,
} from '../controllers/requestController.js';

// import requestController from '../controllers/requestController';

// ============================================================================
// DEPOSIT ROUTES
// ============================================================================

/**
 * POST /api/requests/deposit
 * Create a new deposit request
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "amount": 500,                      // Min $50
 *   "paymentMethod": "card"             // card | bank | crypto
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Deposit request submitted successfully. Awaiting admin approval.",
 *   "requestId": "deposit_1234567890",
 *   "status": "pending"
 * }
 */
router.post('/deposit', authenticate, createDeposit);

/**
 * GET /api/requests/deposits
 * Get user's deposit history
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "deposits": [
 *     {
 *       "_id": "deposit_1234567890",
 *       "userId": "user_id",
 *       "amount": 500,
 *       "status": "pending|approved|rejected",
 *       "requestedAt": "2026-02-20T12:00:00Z",
 *       "approvedAt": null
 *     }
 *   ]
 * }
 */
router.get('/deposits', authenticate, getUserDeposits);

// ============================================================================
// WITHDRAWAL ROUTES
// ============================================================================

/**
 * POST /api/requests/withdrawal
 * Create a new withdrawal request
 * 
 * Business Rules:
 * - Minimum: $500
 * - Maximum daily: $5000
 * - Frequency: Once per week
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "amount": 5000,
 *   "withdrawalMethod": "bank",         // bank | crypto | card | wallet
 *   "destinationAddress": "account..."   // Required for crypto
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Withdrawal request submitted successfully. Awaiting admin approval.",
 *   "requestId": "withdrawal_1234567890",
 *   "status": "pending"
 * }
 */
router.post('/withdrawal', authenticate, createWithdrawal);

/**
 * GET /api/requests/withdrawals
 * Get user's withdrawal history
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "withdrawals": [...]
 * }
 */
router.get('/withdrawals', authenticate, getUserWithdrawals);

// ============================================================================
// TRADE ROUTES
// ============================================================================

/**
 * POST /api/requests/trade
 * Execute a trade (immediately deducts balance)
 * 
 * Business Rules:
 * - Immediately deducts amount from balance
 * - Balance remains locked until admin reports trade result
 * - Admin can report loss (balance -= loss) or gain (balance += gain)
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "amount": 1000,
 *   "asset": "EUR/USD",                 // Trading pair
 *   "type": "buy",                      // buy | sell
 *   "leverage": 1                       // Optional, default 1
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Trade executed successfully. Awaiting admin trade report.",
 *   "tradeId": "trade_1234567890",
 *   "deductedAmount": 1000,
 *   "newBalance": 24430.5
 * }
 */
router.post('/trade', authenticate, createTrade);

/**
 * GET /api/requests/trades
 * Get user's trade history
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Response includes:
 * - Active trades (awaiting admin report)
 * - Closed trades (with profit/loss)
 * - Trade history
 */
router.get('/trades', authenticate, getUserTrades);

// ============================================================================
// UPGRADE ROUTES
// ============================================================================

/**
 * POST /api/requests/upgrade
 * Request account upgrade
 * 
 * Valid upgrade levels: premium | pro | vip
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "upgradeLevel": "premium"           // premium | pro | vip
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Upgrade request submitted successfully. Awaiting admin approval.",
 *   "requestId": "upgrade_1234567890",
 *   "status": "pending"
 * }
 */
router.post('/upgrade', authenticate, createUpgrade);

/**
 * GET /api/requests/upgrades
 * Get user's upgrade request history
 */
router.get('/upgrades', authenticate, getUserUpgrades);

// ============================================================================
// VERIFICATION ROUTES
// ============================================================================

/**
 * POST /api/requests/verify
 * Submit KYC verification request
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "documentType": "passport",         // passport | drivers_license | national_id
 *   "documentNumber": "ABC123456",
 *   "expiryDate": "2030-12-31"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Verification request submitted successfully. Awaiting admin approval.",
 *   "requestId": "verification_1234567890",
 *   "status": "pending"
 * }
 */
router.post('/verify', authenticate, createVerification);

/**
 * GET /api/requests/verifications
 * Get user's verification request history
 */
router.get('/verifications', authenticate, getUserVerifications);

// ============================================================================
// SETTINGS ROUTES
// ============================================================================

/**
 * PUT /api/requests/settings
 * Update user settings (dark mode, notifications, etc)
 * 
 * Immediately applied, no admin approval required
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Request Body (all optional):
 * {
 *   "darkMode": true,
 *   "notifications": true,
 *   "language": "en",
 *   "currency": "USD",
 *   "timezone": "UTC"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Settings updated successfully",
 *   "settings": {
 *     "darkMode": true,
 *     "notifications": true,
 *     "language": "en",
 *     "currency": "USD"
 *   }
 * }
 */
router.put('/settings', authenticate, updateSettings);

/**
 * GET /api/requests/settings
 * Get user's current settings
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "settings": {
 *     "darkMode": false,
 *     "notifications": true,
 *     "language": "en",
 *     "currency": "USD",
 *     "timezone": "UTC"
 *   }
 * }
 */
router.get('/settings', authenticate, getSettings);

// ============================================================================
// PENDING REQUESTS (COMBINED VIEW)
// ============================================================================

/**
 * GET /api/requests/pending
 * Get all pending requests for current user (combined from all types)
 * 
 * Useful for dashboard to show all items awaiting admin approval
 * 
 * Required Headers:
 *   Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "pending": {
 *     "deposits": [...],
 *     "withdrawals": [...],
 *     "trades": [...],           // Active trades
 *     "upgrades": [...],
 *     "verifications": [...]
 *   }
 * }
 */
router.get('/pending', authenticate, getPendingRequests);

// module.exports = router;

export default router;

