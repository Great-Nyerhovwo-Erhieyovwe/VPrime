/**
 * Request Controller - Handles all user requests (deposits, withdrawals, trades, upgrades, verifications, settings)
 * ====================================================================================================
 * 
 * This controller manages:
 * - Deposit requests (min $50, pending admin approval)
 * - Withdrawal requests (min varies by account level, max $500 daily, weekly frequency)
 * - Trade requests (deducts balance, waits for trade report)
 * - Upgrade requests (account level upgrade, pending admin approval)
 * - Verification requests (KYC verification, pending admin approval)
 * - Settings updates (user preferences including dark mode)
 * 
 * All requests follow a standard flow:
 * 1. Validate user input and business rules
 * 2. Check user's current state (balance, permissions, frequency limits)
 * 3. Create request record with "pending" status
 * 4. Admin reviews and approves/rejects
 * 5. System updates user balance/status based on admin decision
 */

// const db = require('../utils/db');
// import db from '../utils/db.js';
import { query } from '../utils/db.js';

// ============================================================================
// DEPOSIT REQUEST CONTROLLER
// ============================================================================

// Currency formatter
function formatCurrency(amount, currency = 'USD') {
  const safeCurrency = (typeof currency === 'string' && currency.trim().length > 0)
    ? currency.trim().toUpperCase()
    : 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch (err) {
    console.warn('formatCurrency fallback: invalid currency', safeCurrency, err.message || err);
    const rounded = Number(amount) || 0;
    return `${safeCurrency} ${rounded.toFixed(2)}`;
  }
}

/**
 * Create a deposit request
 * 
 * Business Logic:
 * - Minimum deposit: $50
 * - Creates a pending request with status "pending"
 * - User balance updates only after admin approval
 * - Request stored in deposits collection for admin review
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userId - User ID from JWT token
 * @param {number} req.body.amount - Deposit amount in USD
 * @param {string} req.body.paymentMethod - Payment method (card, bank, crypto)
 */
async function createDeposit(req, res) {
  try {
    const { id: userId } = req.user;
    const { amount, paymentMethod } = req.body;

    // Validation: Check minimum deposit amount ($50)
    if (amount < 50) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit amount is ${50} (entered ${amount})`,
      });
    }

    // Fetch user to get current balance
    const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];
    // const user = users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // insert deposit request
    const result = await query(
      'INSERT INTO deposits (userId, amount, paymentMethod, status, requestedAt) VALUES (?, ?, ?, ?, ?)',
      [userId, amount, paymentMethod, 'pending', new Date()]
    );

    // // Create new deposit request (MariaDB)
    // const deposit = {
    //   _id: `deposit_${Date.now()}`,
    //   userId,
    //   amount,
    //   paymentMethod,
    //   status: 'pending', // pending | approved | rejected
    //   requestedAt: new Date().toISOString(),
    //   approvedAt: null,
    //   adminNotes: '',
    // };

    // // Read existing deposits
    // let deposits = await db.read('deposits');
    // if (!deposits) deposits = [];

    // // Add new deposit to collection
    // deposits.push(deposit);

    // // Save back to database
    // await db.write({ deposits });

    // Return success with request ID for tracking
    res.json({
      success: true,
      message: 'Deposit request submitted successfully. Awaiting admin approval.',
      requestId: result.insertId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Deposit creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create deposit request' });
  }
}

/**
 * Get user's deposit history
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userId - User ID from JWT token
 */
async function getUserDeposits(req, res) {
  try {
    const { id: userId } = req.user;

    // Read all deposits
    const deposits = await query('SELECT * FROM deposits WHERE userId = ?', [userId]);
    // if (!deposits) deposits = [];

    const users = await query('SELECT currency FROM users WHERE id = ? LIMIT 1', [userId]);
    const currency = users[0]?.currency || 'USD';

    const formatted = deposits.map((d) => ({
      ...d,
      amount: formatCurrency(d.amount, currency),
      status: d.status === 'completed' ? 'approved' : d.status === 'failed' ? 'rejected' : d.status,
    }));

    res.json({
      success: true,
      deposits: formatted,
    });
  } catch (error) {
    console.error('Get deposits error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deposit history' });
  }
}

// ============================================================================
// WITHDRAWAL REQUEST CONTROLLER
// ============================================================================

function getWithdrawalRulesForUser(user) {
  const minUsd = Number(user.withdrawal_min_usd ?? 500);
  const rawMaxUsd = user.withdrawal_max_usd === null || user.withdrawal_max_usd === undefined
    ? 5000
    : Number(user.withdrawal_max_usd);
  const maxUsd = Number.isFinite(rawMaxUsd) ? rawMaxUsd : 5000;

  const upgradeLevel = (user.upgradeLevel || 'free').toString().toLowerCase();
  const frequencyDays = (() => {
    switch (upgradeLevel) {
      case 'standard':
        return 3;
      case 'pro':
      case 'premium':
        return 1;
      case 'free':
      case 'mini':
      default:
        return 7;
    }
  })();

  return {
    minUsd: Number.isFinite(minUsd) && minUsd > 0 ? minUsd : 500,
    maxUsd,
    frequencyDays,
    upgradeLevel: upgradeLevel || 'free',
  };
}

/**
 * Create a withdrawal request
 * 
 * Business Logic:
 * - Minimum withdrawal: $500 for basic account, varies by upgrade level
 * - Maximum daily withdrawal: $500
 * - Frequency: Weekly (max 1 withdrawal per week)
 * - Requires sufficient balance
 * - Creates pending request, balance locked until approval
 * 
 * @param {Object} req - Express request object
 * @param {number} req.body.amount - Withdrawal amount
 * @param {string} req.body.withdrawalMethod - Method (bank, crypto, card, wallet)
 */
async function createWithdrawal(req, res) {
  try {
    const { id: userId } = req.user;
    const { amount, withdrawalMethod, destinationAddress } = req.body;

    // Fetch user to check balance and account type
    const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];
    // const user = users.find((u) => u._id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is frozen
    if (user.frozen) {
      return res.status(403).json({
        success: false,
        message: 'Your account is frozen. You cannot make withdrawals. Please contact support.',
      });
    }

    const { minUsd, maxUsd, frequencyDays, upgradeLevel } = getWithdrawalRulesForUser(user);

    if (amount < minUsd) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ${minUsd}`,
      });
    }

    if (maxUsd !== Infinity && amount > maxUsd) {
      return res.status(400).json({
        success: false,
        message: `Maximum daily withdrawal amount is ${maxUsd}. Upgrade for higher limits`,
      });
    }

    if (user.balanceUsd < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for withdrawal',
        availableBalance: user.balanceUsd,
      });
    }

    const frequencyAgo = new Date(Date.now() - frequencyDays * 24 * 60 * 60 * 1000);
    const recentWithdrawal = await query(
      'SELECT COUNT(*) as count FROM withdrawals WHERE userId = ? AND status = ? AND requestedAt > ?',
      [userId, 'approved', frequencyAgo]
    );

    if (recentWithdrawal[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `You can only make one withdrawal every ${frequencyDays} day${frequencyDays === 1 ? '' : 's'}. Please try again later.`,
      });
    }

    // Insert withdrawal
    const result = await query(
      'INSERT INTO withdrawals (userId, amount, withdrawalMethod, destinationAddress, status, requestedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, amount, withdrawalMethod, destinationAddress || null, 'pending', new Date()]
    );

    // // Create withdrawal request
    // const withdrawal = {
    //   _id: `withdrawal_${Date.now()}`,
    //   userId,
    //   amount,
    //   withdrawalMethod,
    //   destinationAddress,
    //   status: 'pending', // pending | approved | rejected
    //   requestedAt: new Date().toISOString(),
    //   approvedAt: null,
    //   processedAt: null,
    //   adminNotes: '',
    // };

    // // Add to withdrawals collection
    // withdrawals.push(withdrawal);
    // await db.write({ withdrawals });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully. Awaiting admin approval.',
      requestId: result.insertId,
      amount: formatCurrency(amount, user.currency),
      status: 'pending',
      withdrawalMinUsd: minUsd,
      withdrawalMaxUsd: Number.isFinite(maxUsd) ? maxUsd : null,
      withdrawalFrequencyDays: frequencyDays,
      upgradeLevel: upgradeLevel || 'free',
    });
  } catch (error) {
    console.error('Withdrawal creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create withdrawal request' });
  }
}

/**
 * Get user's withdrawal history
 */
async function getUserWithdrawals(req, res) {
  try {
    const { id: userId } = req.user;
    const withdrawals = await query('SELECT * FROM withdrawals WHERE userId = ?', [userId]);
    const users = await query('SELECT currency FROM users WHERE id = ? LIMIT 1', [userId]);
    const currency = users[0]?.currency || 'USD';

    const formatted = withdrawals.map((w) => ({
      ...w,
      amount: formatCurrency(w.amount, currency),
      status: w.status === 'completed' ? 'approved' : w.status === 'failed' ? 'rejected' : w.status,
    }));

    res.json({
      success: true,
      withdrawals: formatted,
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch withdrawal history' });
  }
}

// ============================================================================
// TRADE REQUEST CONTROLLER
// ============================================================================

/**
 * Create a trade request
 * 
 * Business Logic:
 * - Immediately deducts amount from user's balance
 * - Creates trade request for admin to report result (loss/gain)
 * - After admin reports: adds profit or subtracts loss
 * - Tracks trade history for user
 * 
 * @param {Object} req - Express request object
 * @param {number} req.body.amount - Trade amount (deducted from balance)
 * @param {string} req.body.asset - Asset being traded (EUR/USD, BTC, etc)
 * @param {string} req.body.type - Trade type (buy/sell)
 */
async function createTrade(req, res) {
  try {
    const { id: userId } = req.user;
    const { amount, asset, type, leverage } = req.body;

    // Fetch user
    const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is frozen
    if (user.frozen) {
      return res.status(403).json({
        success: false,
        message: 'Your account is frozen. You cannot create trades. Please contact support.',
      });
    }

    // Validation: Check sufficient balance
    if (user.balanceUsd < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for trade',
        availableBalance: user.balanceUsd,
      });
    }

    // Deduct balance
    await query('UPDATE users SET balanceUsd = balanceUsd - ? WHERE id = ?', [amount, userId]);

    // insert trade
    const result = await query(
      `INSERT INTO trades
      (userId, amount, asset, type, leverage, status, requestedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [userId, amount, asset, type, leverage || 1, 'active', new Date()]
    );

    // // Create trade request
    // const trade = {
    //   _id: `trade_${Date.now()}`,
    //   userId,
    //   amount,
    //   asset,
    //   type, // 'buy' or 'sell'
    //   leverage: leverage || 1,
    //   status: 'active', // active | closed | reported
    //   requestedAt: new Date().toISOString(),
    //   closedAt: null,
    //   result: null, // 'loss' | 'gain' | null
    //   resultAmount: 0, // profit or loss amount
    //   adminNotes: '',
    // };

    // // Immediately deduct amount from user balance
    // user.balanceUsd -= amount;

    // // Save updated user
    // users[users.findIndex((u) => u._id === userId)] = user;

    // // Read and update trades
    // let trades = await db.read('trades');
    // if (!trades) trades = [];
    // trades.push(trade);

    // // Write both users and trades back
    // await db.write({ users, trades });

    res.json({
      success: true,
      message: 'Trade executed successfully.',
      tradeId: result.insertId,
      deductedAmount: formatCurrency(amount, user.currency),
      newBalance: formatCurrency(user.balanceUsd - amount, user.currency),
    });
  } catch (error) {
    console.error('Trade creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to execute trade' });
  }
}

/**
 * Get user's trades
 */
async function getUserTrades(req, res) {
  try {
    const { id: userId } = req.user;

    const trades = await query('SELECT * FROM trades WHERE userId = ?', [userId]);
    const users = await query('SELECT currency FROM users WHERE id = ?', [userId]);
    // if (!trades) trades = [];

    // const userTrades = trades.filter((t) => t.userId === userId);

    const currency = users[0]?.currency || 'USD';

    const formatted = trades.map((t) => ({
      ...t,
      amount: formatCurrency(t.amount, currency),
      resultAmount: formatCurrency(t.resultAmount || 0, currency),
    }));

    res.json({
      success: true,
      trades: formatted,
    });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trades' });
  }
}

// ============================================================================
// UPGRADE REQUEST CONTROLLER
// ============================================================================

/**
 * Create account upgrade request
 * 
 * Business Logic:
 * - User requests to upgrade account level (e.g., basic -> premium -> pro)
 * - Admin reviews and approves/rejects
 * - On approval: unlock premium features, adjust limits
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.upgradeLevel - Target account level (premium, pro, standard, mini)
 */
async function createUpgrade(req, res) {
  try {
    const { id: userId } = req.user;
    const { upgradeLevel, targetLevel, currentLevel, amount } = req.body;
    
    // Check if user is frozen prior to fetching user
    const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.frozen) {
      return res.status(403).json({
        success: false,
        message: 'Your account is frozen. You cannot request upgrades. Please contact support.',
      });
    }

    // Support multiple field names from frontend
    const level = upgradeLevel || targetLevel;

    // Validate upgrade level
    const validLevels = ['free', 'mini', 'standard', 'pro', 'premium'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid upgrade level',
      });
    }

    // If no amount provided, fetch from upgrade plans
    let upgradeAmount = amount || 0;
    if (!amount) {
      try {
        const [plans] = await query(
          'SELECT priceMonthly FROM upgrade_plans WHERE name = ? LIMIT 1',
          [level]
        );
        upgradeAmount = plans[0]?.priceMonthly || 99.99;
      } catch (e) {
        console.warn('Could not fetch plan price:', e.message);
        upgradeAmount = 99.99;
      }
    }

    const result = await query(
      `INSERT INTO upgrades (userId, upgradeLevel, amount, status, requestedAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, level, upgradeAmount, 'pending', new Date(), new Date()]
    );

    res.json({
      success: true,
      message: 'Upgrade request submitted successfully. Awaiting admin approval.',
      requestId: result.insertId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Upgrade creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create upgrade request', error: error.message });
  }
}

/**
 * Get user's upgrade requests
 */
async function getUserUpgrades(req, res) {
  try {
    const { id: userId } = req.user;

    const upgrades = await query('SELECT * FROM upgrades WHERE userId = ?', [userId]);
    // if (!upgrades) upgrades = [];

    // const userUpgrades = upgrades.filter((u) => u.userId === userId);

    res.json({
      success: true,
      upgrades: upgrades,
    });
  } catch (error) {
    console.error('Get upgrades error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upgrade requests' });
  }
}

// ============================================================================
// VERIFICATION REQUEST CONTROLLER
// ============================================================================

/**
 * Create KYC verification request
 * 
 * Business Logic:
 * - User submits identification documents for verification
 * - Admin reviews documents and approves/rejects
 * - On approval: marks user as verified, unlocks features
 * - On rejection: user can resubmit with corrections
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.documentType - Type of document (passport, drivers_license, etc)
 * @param {string} req.body.documentNumber - Document number
 * @param {string} req.body.expiryDate - Document expiry date
 */
async function createVerification(req, res) {
  try {
    const { id: userId } = req.user;
    const { documentType, documentNumber, expiryDate } = req.body;

    // Check if user is frozen
    const users = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.frozen) {
      return res.status(403).json({
        success: false,
        message: 'Your account is frozen. You cannot request verification. Please contact support.',
      });
    }

    // Validation
    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: 'Document type and number are required',
      });
    }

    const result = await query(
      `INSERT INTO verifications 
      (userId, documentType, documentNumber, expiryDate, status, requestedAt)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, documentType, documentNumber, expiryDate || null, 'pending', new Date()]
    );

    res.json({
      success: true,
      message: 'Verification request submitted successfully. Awaiting admin approval.',
      requestId: result.insertId,
      status: 'pending',
    });
  } catch (error) {
    console.error('Verification creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create verification request' });
  }
}

/**
 * Get user's verification requests
 */
async function getUserVerifications(req, res) {
  try {
    const { id: userId } = req.user;

    const verifications = await query('SELECT * FROM verifications WHERE userId = ?', [userId]);
    // if (!verifications) verifications = [];

    // const userVerifications = verifications.filter((v) => v.userId === userId);

    res.json({
      success: true,
      verifications: verifications,
    });
  } catch (error) {
    console.error('Get verifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch verification requests' });
  }
}

// ============================================================================
// SETTINGS UPDATE CONTROLLER
// ============================================================================

/**
 * Update user settings
 * 
 * Business Logic:
 * - Updates user preferences (dark mode, notifications, etc)
 * - Immediately applied, no admin approval needed
 * - Persists to database
 * 
 * @param {Object} req - Express request object
 * @param {boolean} req.body.darkMode - Enable/disable dark mode
 * @param {boolean} req.body.notifications - Enable/disable notifications
 * @param {string} req.body.language - Preferred language
 */
async function updateSettings(req, res) {
  try {
    const { id: userId } = req.user;
    const { darkMode, notifications, language, currency, timezone } = req.body;

    // Fetch user
    const result = await query(
      `UPDATE users
      SET darkMode = ?, notifications = ?, language = ?, currency = ?, timezone = ?, settingsUpdatedAt = ?
      WHERE id = ?`,
      [
        darkMode !== undefined ? darkMode : null,
        notifications !== undefined ? notifications : null,
        language || null,
        currency || null,
        timezone || null,
        new Date(),
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUserRows = await query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedUser = updatedUserRows[0];

    // if (userIndex === -1) {
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    // // Update user settings
    // const user = users[userIndex];
    // if (darkMode !== undefined) user.darkMode = darkMode;
    // if (notifications !== undefined) user.notifications = notifications;
    // if (language) user.language = language;
    // if (currency) user.currency = currency;
    // if (timezone) user.timezone = timezone;
    // user.settingsUpdatedAt = new Date().toISOString();

    // users[userIndex] = user;

    // // Save updated user
    // await db.write({ users });
    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        darkMode: updatedUser.darkMode,
        notifications: updatedUser.notifications,
        language: updatedUser.language,
        currency: updatedUser.currency,
        timezone: updatedUser.timezone,
      },
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
}

/**
 * Get user settings
 */
async function getSettings(req, res) {
  try {
    const { id: userId } = req.user;

    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      settings: {
        darkMode: !!user.darkMode,
        notifications: user.notifications !== 0,
        language: user.language || 'en',
        currency: user.currency || 'USD',
        timezone: user.timezone || 'UTC',
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
}

// ============================================================================
// REQUEST STATUS CHECK
// ============================================================================

/**
 * Get all pending requests for user (combined view)
 * Useful for dashboard to show all awaiting-approval items
 */
async function getPendingRequests(req, res) {
  try {
    const { id: userId } = req.user;

    const [deposits, withdrawals, trades, upgrades, verifications] = await Promise.all([
      query('SELECT * FROM deposits WHERE userId = ? AND status = "pending"', [userId]),
      query('SELECT * FROM withdrawals WHERE userId = ? AND status = "pending"', [userId]),
      query('SELECT * FROM trades WHERE userId = ? AND status = "active"', [userId]),
      query('SELECT * FROM upgrades WHERE userId = ? AND status = "pending"', [userId]),
      query('SELECT * FROM verifications WHERE userId = ? AND status = "pending"', [userId]),
    ])

    // const userPending = {
    //   deposits: deposits.filter((d) => d.userId === userId && d.status === 'pending'),
    //   withdrawals: withdrawals.filter((w) => w.userId === userId && w.status === 'pending'),
    //   trades: trades.filter((t) => t.userId === userId && t.status === 'active'),
    //   upgrades: upgrades.filter((u) => u.userId === userId && u.status === 'pending'),
    //   verifications: verifications.filter((v) => v.userId === userId && v.status === 'pending'),
    // };

    res.json({
      success: true,
      pending: {
        deposits,
        withdrawals,
        trades,
        upgrades,
        verifications,
      },
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
  }
}

export {
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
};


// export default requestController;