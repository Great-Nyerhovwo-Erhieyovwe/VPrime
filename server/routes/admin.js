import express from "express";
import * as adminCtrl from "../controllers/adminController.js";
import * as depositsCtrl from "../controllers/adminDepositsController.js";
import * as withdrawalsCtrl from "../controllers/adminWithdrawalsController.js";
import * as verificationsCtrl from "../controllers/adminVerificationsController.js";
import * as tradesCtrl from "../controllers/adminTradesController.js";
import * as messagingCtrl from "../controllers/adminMessagingController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { getDb } from "../utils/db.js";

const router = express.Router();

/**
 * PUBLIC ROUTES (no auth required)
 */
// Admin login endpoint - returns JWT
router.post('/login', adminCtrl.adminLogin);

// Overview metrics: total users, deposits, withdrawals, active, verified (temporarily public for testing)
router.get('/summary', adminCtrl.adminSummary);

/**
 * PROTECTED ROUTES (require JWT + admin role)
 * All routes below are protected by authenticate + requireAdmin middleware
 */
router.use(authenticate, requireAdmin);
router.get('/summary', adminCtrl.adminSummary);

/**
 * USERS MANAGEMENT
 */
// Current admin profile and settings
router.get('/profile', adminCtrl.getAdminProfile);
router.patch('/profile', adminCtrl.updateAdminProfile);

// List all users with details (balance, role, status, etc.)
router.get('/users', adminCtrl.listUsers);
// Create new user
router.post('/users', adminCtrl.createUser);
// Update user (balance, ROI, ban, freeze, delete, etc.)
router.patch('/users/:id', adminCtrl.updateUser);
// Delete user
router.delete('/users/:id', adminCtrl.deleteUser);

/**
 * TRANSACTIONS MANAGEMENT
 * Admin can approve/reject deposits and withdrawals
 */
// List all transactions (deposits, withdrawals, pending/approved/rejected)
router.get('/transactions', depositsCtrl.listDeposits); // For backwards compatibility, return deposits
router.get('/transactions/deposits', depositsCtrl.listDeposits);
router.get('/transactions/withdrawals', withdrawalsCtrl.listWithdrawals);

// Approve or reject deposits or withdrawals
router.patch('/transactions/:id', async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ message: 'Database not connected' });

    // Check withdrawals table first (since withdrawals should subtract, not add)
    const [withdrawalRows] = await db.query('SELECT id FROM withdrawals WHERE id = ? LIMIT 1', [req.params.id]);
    if (withdrawalRows.length > 0) {
        return withdrawalsCtrl.updateWithdrawal(req, res);
    }

    // Then check deposits table
    const [depositRows] = await db.query('SELECT id FROM deposits WHERE id = ? LIMIT 1', [req.params.id]);
    if (depositRows.length > 0) {
        return depositsCtrl.updateDeposit(req, res);
    }

    return res.status(404).json({ message: 'Transaction not found' });
});

/**
 * TRADES MANAGEMENT
 * Admin can view and manually close/modify trades
 */
// List all trades (active and closed)
router.get('/trades', tradesCtrl.listTrades);
// Close or modify a trade manually (set result, exit price, notes)
router.patch('/trades/:id', tradesCtrl.updateTrade);

/**
 * VERIFICATIONS MANAGEMENT
 * Admin can approve/reject KYC and identity verifications
 */
// List all pending verifications
router.get('/verifications', verificationsCtrl.listVerifications);
// Approve or reject verification
router.patch('/verifications/:id', verificationsCtrl.updateVerification);

/**
 * SUPPORT TICKETS MANAGEMENT
 * Admin can respond to user support tickets
 */
// List all support tickets
router.get('/tickets', messagingCtrl.listTickets);
// Add reply to ticket or change status (open, in-progress, resolved, closed)
router.patch('/tickets/:id', messagingCtrl.updateTicket);

/**
 * MESSAGING
 * Admin can send direct messages and warnings to users
 */
// List messages
router.get('/messages', messagingCtrl.listMessages);
// Send direct message, warning, or notice to a user
router.post('/messages', messagingCtrl.sendMessage);
// Mark a sent message as completed so the temporary popup can be removed
router.patch('/messages/:id', messagingCtrl.updateMessage);

/**
 * EMAIL
 * Admin can send emails to users
 */
// Send email to individual or bulk users
router.post('/email', messagingCtrl.sendEmail);

/**
 * UPGRADE PLANS
 * Admin can create, view, and modify upgrade plans
 */
// List all upgrade plans
router.get('/plans', adminCtrl.listPlans);
// Create new upgrade plan
router.post('/plans', adminCtrl.createPlan);
// Update plan details (name, price, features)
router.patch('/plans/:id', adminCtrl.updatePlan);
// Delete plan
router.delete('/plans/:id', adminCtrl.deletePlan);

/**
 * UPGRADE REQUESTS
 * Admin reviews user upgrade requests
 */
router.get('/upgrades', adminCtrl.listUpgrades);
router.patch('/upgrades/:id', adminCtrl.updateUpgrade);

/**
 * DEPOSIT SETTINGS
 * Admin can manage global deposit method settings
 */
router.get('/deposit-settings', adminCtrl.getDepositSettings);
router.put('/deposit-settings', adminCtrl.updateDepositSettings);

/**
 * DEBUG ENDPOINT
 * Check database contents (for development)
 */
router.get('/debug/tables', async (req, res) => {
    try {
        const { getDb } = await import('../utils/db.js');
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'DB not connected' });

        const tables = ['users', 'transactions', 'deposits', 'withdrawals', 'trades', 'verifications', 'upgrades'];
        const results = {};

        for (const table of tables) {
            try {
                const [rows] = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
                results[table] = rows[0]?.count || 0;
            } catch (e) {
                results[table] = `Error: ${e.message.substring(0, 50)}`;
            }
        }

        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
