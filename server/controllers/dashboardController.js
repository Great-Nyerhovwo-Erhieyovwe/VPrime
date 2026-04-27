/**
 * Dashboard Controller
 * =====================
 * Handles all dashboard-related operations:
 * - Fetching user profile and portfolio data
 * - Retrieving transaction history
 * - Getting notifications
 * - Managing user settings
 * 
 * All endpoints require JWT authentication via the 'authenticate' middleware
 */

// import { provider } from "../services/dataProvider.js";
import { getDb, query } from "../utils/db.js";
import jwt from 'jsonwebtoken';

/**
 * GET /dashboard/user
 * Fetch authenticated user's profile information
 */
export async function getUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.getUser: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const userId = req.user.id;

        const [rows] = await db.query(
            'SELECT id, email, firstName, lastName, username, country, currency, accountType, emailVerified, createdAt, role, upgradeLevel, withdrawal_min_usd, withdrawal_max_usd FROM users WHERE id = ?',
            [userId]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        return res.json(user);

        // return res.json({
        //     id: user.id,
        //     email: user.email,
        //     firstName: user.firstName,
        //     lastName: user.lastName,
        //     username: user.username,
        //     country: user.country,
        //     currency: user.currency,
        //     accountType: user.accountType,
        //     emailVerified: !!user.emailVerified,
        //     createdAt: user.createdAt,
        //     role: user.role,
        //     balanceUsd: parseFloat(user.balanceUsd) || 0,
        //     roi: parseFloat(user.roi) || 0
        // });
    } catch (e) {
        console.error('Error fetching user:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/portfolio
 * Fetch user's portfolio metrics and balance information
 */
export async function getPortfolio(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.getPortfolio: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const userId = req.user.id;
        const [rows] = await db.query('SELECT balanceUsd, roi, upgradeLevel FROM users WHERE id = ?', [userId]);

        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [activeTradesRows] = await db.query(
            'SELECT COUNT(*) AS activeTrades FROM trades WHERE userId = ? AND status = "active"',
            [userId]
        );

        const activeTradesCount = activeTradesRows[0].activeTrades || 0;

        return res.json({
            totalBalance: user.balanceUsd || 0,
            balanceUsd: user.balanceUsd || 0,
            roi: user.roi || 0,
            activeTradesCount,
            activeInvestments: 0,
            upgradeLevel: user.upgradeLevel,
            openPositions: []
        });

    } catch (e) {
        console.error('Error fetching portfolio:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/transactions
 * Fetch user's transaction history (trades, deposits, withdrawals)
 */
export async function getTransactions(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.getTransactions: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const userId = req.user.id;
        const [transactions] = await db.query(`SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`, 
            [userId, limit, offset]
        );

        const [countRows] = await db.query(
            'SELECT COUNT(*) AS total FROM transactions WHERE userId = ?',
            [userId]
        );

        const total = countRows[0].total;

        return res.json({
            transactions,
            total,
            limit,
            offset
        });

    } catch (e) {
        console.error('Error fetching transactions:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/notifications
 * Fetch user's notifications (alerts, price changes, trade updates, etc)
 */
export async function getNotifications(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.getNotifications: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const userId = req.user.id;
        let sql = 'SELECT * FROM notifications WHERE userId = ?';
        const params = [userId];

        if (req.query.unreadOnly === 'true') {
            sql += ' AND `read` = 0';
        }
        
        sql += ' ORDER BY createdAt DESC';
        // console.log('SQL:', sql)
        // console.log('Params:', params)

        const [rows] = await db.query(sql, params);

        console.log('SQL:', sql)
        console.log('Params:', params)

        const notifications = rows;

        return res.json({
            notifications,
            unreadCount: notifications.filter(n => n.read === 0).length
        });
    } catch (e) {
        console.error('Error fetching notifications:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * PATCH /dashboard/notifications/:notificationId/read
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.markNotificationAsRead: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { notificationId } = req.params;
        const userId = req.user.id;

        const [result] = await db.query(
            'UPDATE notifications SET `read` = 1 WHERE id = ? AND userId = ?',
            [notificationId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        return res.json({ success: true, message: 'Notification marked as read' });

    } catch (e) {
        console.error('Error marking notification as read:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /dashboard/stats
 * Fetch dashboard statistics and summary metrics
 */
export async function getDashboardStats(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.getDashboardStats: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const userId = req.user.id;
        const [userRows] = await db.query(
            'SELECT balanceUsd, roi FROM users WHERE id = ?',
            [userId]
        );

        const user = userRows[0];
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const [activeTradesRows] = await db.query(
            'SELECT COUNT(*) AS activeTrades FROM trades WHERE userId = ? AND status = "active"',
            [userId]
        );

        const activeTrades = activeTradesRows[0].activeTrades;

        const [activeInvestmentsRows] = await db.query(
            `SELECT COUNT(*) AS activeInvestments FROM trades WHERE userId = ? AND status = "active"`,
            [userId]
        );

        const activeInvestments = activeInvestmentsRows[0].activeInvestments;

        const [monthlyProfitRows] = await db.query(
            `SELECT SUM(resultAmount) AS monthlyProfit FROM trades WHERE userId = ? AND closedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
            [userId]
        );

        const monthlyProfit = monthlyProfitRows[0].monthlyProfit || 0;

        // Last transaction date
        const [lastTransactionRows] = await db.query(
            'SELECT MAX(createdAt) AS lastTransactionDate FROM transactions WHERE userId = ?',
            [userId]
        );

        const lastTransactionDate = lastTransactionRows[0].lastTransactionDate;

        return res.json({
            totalBalance: user.balanceUsd || 0,
            activeTradesCount: activeTrades || 0,
            roi: user.roi || 0,
            activeInvestments: activeInvestments || 0,
            monthlyProfit: monthlyProfit || 0,
            lastTransactionDate: lastTransactionDate || null
        });
    } catch (e) {
        console.error('Error fetching dashboard stats:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * PUT /dashboard/user/settings
 * Update user settings and preferences
 */
export async function updateUserSettings(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const db = getDb();
        if (!db) {
            console.error('Dashboard.updateUserSettings: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const userId = req.user.id;
        const { currency, country, accountType, notifications } = req.body;

        const updates = {};
        if (currency) updates.currency = currency;
        if (country) updates.country = country;
        if (accountType) updates.accountType = accountType;
        if (notifications) updates.notifications = notifications;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const setClause = Object.keys(updates).map(f => `${f} = ?`).join(', ');
        const params = [...Object.values(updates), userId];

        const [result] = await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({
            success: true,
            message: 'Settings updated successfully',
            updates
        });
    } catch (e) {
        console.error('Error updating user settings:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
