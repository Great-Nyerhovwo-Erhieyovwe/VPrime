import { getDb, query } from "../utils/db.js";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

// Admin summary: aggregate basic metrics using direct SQL queries
export async function adminSummary(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('AdminSummary: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    // Get total users count
    const [totalUsersResult] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = totalUsersResult[0].count;

    // Get verified users count
    const [verifiedUsersResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE emailVerified = 1');
    const verifiedUsers = verifiedUsersResult[0].count;

    // Get active users count (users with balance > 0)
    const [activeUsersResult] = await db.query('SELECT COUNT(*) as count FROM users WHERE balanceUsd > 0');
    const activeUsers = activeUsersResult[0].count;

    // Get total approved deposits
    const [totalDepositsResult] = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = "approved"');
    const totalDeposits = Number(totalDepositsResult[0].total);

    // Get total approved withdrawals
    const [totalWithdrawalsResult] = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status = "approved"');
    const totalWithdrawals = Number(totalWithdrawalsResult[0].total);

    return res.json({ totalUsers, verifiedUsers, activeUsers, totalDeposits, totalWithdrawals });
  } catch (e) {
    console.error('Admin summary error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Admin login: authenticate admin from database only
export async function adminLogin(req, res) {
  try {
    console.log('🔄 Admin login attempt:', { email: req.body?.email, ip: req.ip });
    const { email, password } = req.body || {};
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const db = getDb();
    if (!db) {
      console.error('AdminLogin: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    // Try to find user in database
    console.log('🔍 Checking database for admin user:', email);
    const [userRows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    const user = userRows[0];

    if (user) {
      console.log('👤 User found in database:', { id: user.id, email: user.email, role: user.role });
      if (password !== user.password) {
        console.log('❌ Password mismatch for user:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      if (user.role !== 'admin') {
        console.log('❌ User is not admin, role:', user.role);
        return res.status(403).json({ message: 'Not authorized as admin' });
      }
      const sub = (user._id || user.id)?.toString() || user.email;
      const token = jwt.sign({ sub, role: 'admin' }, process.env.JWT_SECRET || process.env.VITE_JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || process.env.VITE_JWT_EXPIRES_IN || '24h' });
      return res.json({ success: true, token, user: { id: sub, email: user.email, role: 'admin' } });
    }

    console.log('❌ Admin login failure: admin user not found in database for', email);
    return res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (e) {
    console.error('Admin login error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getAdminProfile(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('GetAdminProfile: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const adminEmail = req.user?.email;
    if (!adminEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [rows] = await db.query(
      'SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE email = ? LIMIT 1',
      [adminEmail]
    );

    const profile = rows[0];
    if (!profile) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    return res.json(profile);
  } catch (e) {
    console.error('Get admin profile error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateAdminProfile(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('UpdateAdminProfile: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const adminEmail = req.user?.email;
    if (!adminEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updates = req.body || {};
    const allowedFields = ['email', 'password', 'firstName', 'lastName'];
    const safeUpdates = {};

    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updateKeys = Object.keys(safeUpdates);
    const updateValues = Object.values(safeUpdates);
    const setClause = updateKeys.map((key) => `${key} = ?`).join(', ');

    await db.query(
      `UPDATE users SET ${setClause} WHERE email = ?`,
      [...updateValues, adminEmail]
    );

    // If email was updated, use the new email for the SELECT
    const selectEmail = safeUpdates.email || adminEmail;

    const [rows] = await db.query(
      'SELECT id, email, firstName, lastName, role, createdAt FROM users WHERE email = ? LIMIT 1',
      [selectEmail]
    );

    return res.json(rows[0] || {});
  } catch (e) {
    console.error('Update admin profile error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Users CRUD
export async function listUsers(req, res) {
  try {
    console.log('🔄 Admin requesting user list...');
    console.log('📋 Admin user:', req.user?.id || req.user?.email);
    const db = getDb();
    if (!db) {
      console.error('ListUsers: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    console.log('🔍 Querying all users from database...');
    const [userRows] = await db.query('SELECT * FROM users');
    console.log('✅ Retrieved', userRows.length, 'users from database');
    return res.json(userRows);
  } catch (e) {
    console.error('List users error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createUser(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('CreateUser: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const payload = req.body || {};
    if (!payload.email || !payload.password) return res.status(400).json({ message: 'Missing fields' });

    // Generate ID if not provided
    const userId = payload.id || randomUUID();

    // store plain password (insecure; per user request)
    const userDoc = {
      id: userId,
      ...payload,
      role: payload.role || 'user',
      emailVerified: payload.emailVerified || false,
      banned: payload.banned || false,
      frozen: payload.frozen || false,
      withdrawal_min_usd: payload.withdrawal_min_usd || 500,
      withdrawal_max_usd: payload.withdrawal_max_usd || 5000,
      upgradeLevel: payload.upgradeLevel || 'free',
      createdAt: new Date().toISOString()
    };

    const keys = Object.keys(userDoc);
    const values = Object.values(userDoc);
    const placeholders = keys.map(() => "?").join(", ");

    const [result] = await db.query(
      `INSERT INTO users (${keys.join(", ")}) VALUES (${placeholders})`,
      values
    );

    return res.json({ success: true, result: { insertedId: userId, _id: userId } });
  } catch (e) {
    console.error('Create user error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateUser(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('UpdateUser: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { id } = req.params;
    const updates = req.body || {};

    // prevent accidental overwrite of _id
    delete updates.id;

    // keep plain text password (insecure; per user request)
    // if provided it's stored directly

    // allow admin to set limit and flags
    const allowedFields = [
      'firstName', 'lastName', 'email', 'password', 'country', 'role', 'emailVerified', 'banned', 'frozen',
      'withdrawal_min_usd', 'withdrawal_max_usd', 'balanceUsd', 'roi', 'upgradeLevel', 'timezone', 'language'
    ];

    const safeUpdates = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updateKeys = Object.keys(safeUpdates);
    const updateValues = Object.values(safeUpdates);
    const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

    const [result] = await db.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...updateValues, id]
    );

    return res.json({ success: true, result: { matchedCount: result.affectedRows, modifiedCount: result.changedRows } });
  } catch (e) {
    console.error('Update user error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('DeleteUser: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return res.json({ success: true, result: { deletedCount: result.affectedRows } });
  } catch (e) {
    console.error('Delete user error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Plans CRUD
export async function listPlans(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('ListPlans: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const [planRows] = await db.query('SELECT * FROM upgrade_plans');
    return res.json(planRows);
  } catch (e) {
    console.error('List plans error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function createPlan(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('CreatePlan: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const payload = req.body || {};
    const planId = payload.id || randomUUID();

    const planDoc = {
      id: planId,
      ...payload,
      createdAt: new Date().toISOString()
    };

    const keys = Object.keys(planDoc);
    const values = Object.values(planDoc);
    const placeholders = keys.map(() => "?").join(", ");

    const [result] = await db.query(
      `INSERT INTO upgrade_plans (${keys.join(", ")}) VALUES (${placeholders})`,
      values
    );

    return res.json({ success: true, result: { insertedId: planId, _id: planId } });
  } catch (e) {
    console.error('Create plan error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updatePlan(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('UpdatePlan: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { id } = req.params;
    const updates = req.body || {};

    const updateKeys = Object.keys(updates);
    const updateValues = Object.values(updates);
    const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

    const [result] = await db.query(
      `UPDATE upgrade_plans SET ${setClause} WHERE id = ?`,
      [...updateValues, id]
    );

    return res.json({ success: true, result: { matchedCount: result.affectedRows, modifiedCount: result.changedRows } });
  } catch (e) {
    console.error('Update plan error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deletePlan(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('DeletePlan: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { id } = req.params;
    const [result] = await db.query('DELETE FROM upgrade_plans WHERE id = ?', [id]);
    return res.json({ success: true, result: { deletedCount: result.affectedRows } });
  } catch (e) {
    console.error('Delete plan error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function listUpgrades(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('ListUpgrades: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const [upgradeRows] = await db.query('SELECT * FROM upgrades');
    // Transform to match expected format
    const upgrades = upgradeRows.map(u => ({
      id: u.id?.toString(),
      _id: u.id?.toString(),
      userId: u.userId?.toString(),
      currentLevel: u.upgradeLevel || 'free',
      targetLevel: u.upgradeLevel || 'free', 
      currentPlan: u.upgradeLevel || 'free',
      targetPlan: u.upgradeLevel || 'free',
      price: u.amount,
      status: u.status === 'completed' ? 'approved' : u.status === 'failed' ? 'rejected' : 'pending',
      adminNotes: u.adminNotes,
      requestedAt: u.requestedAt || u.createdAt,
      reviewedAt: u.reviewedAt || u.approvedAt,
      _original: u
    }));
    return res.json(upgrades);
  } catch (e) {
    console.error('List upgrades error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
}

export async function updateUpgrade(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('UpdateUpgrade: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    console.log(`UpdateUpgrade: id=${id}, status=${status}, notes=${adminNotes}`);

    // Map frontend status to database status
    const dbStatus = status === 'approved' ? 'completed' : status === 'rejected' ? 'failed' : 'pending';

    if (!['pending', 'completed', 'failed'].includes(dbStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Fetch upgrade to get userId
    const [upgradeRows] = await db.query('SELECT * FROM upgrades WHERE id = ? LIMIT 1', [id]);
    const upgrade = upgradeRows[0];
    if (!upgrade) {
      console.warn(`UpdateUpgrade: Upgrade request not found for id=${id}`);
      return res.status(404).json({ message: 'Upgrade request not found' });
    }

    console.log(`UpdateUpgrade: Found upgrade:`, upgrade);

    // Update the upgrade record
    const now = new Date();
    await db.query(
      `UPDATE upgrades SET status = ?, adminNotes = ?, reviewedAt = ? WHERE id = ?`,
      [dbStatus, adminNotes || '', now, id]
    );

    // If approved, update user upgrade level and withdrawal limits
    if (dbStatus === 'completed' && upgrade.userId) {
      console.log(`UpdateUpgrade: Approving upgrade for user=${upgrade.userId}, level=${upgrade.upgradeLevel}`);
      
      // Define withdrawal limits for each plan level
      const withdrawalLimits = {
        free: { min: 500, max: 5000 },
        mini: { min: 500, max: 5000 },
        standard: { min: 1000, max: 50000 },
        pro: { min: 5000, max: 500000 },
        premium: { min: 10000, max: 999999999 }, // Unlimited
      };
      
      const level = upgrade.upgradeLevel || 'free';
      const limits = withdrawalLimits[level] || withdrawalLimits.free;
      
      console.log(`UpdateUpgrade: Setting withdrawal limits for level=${level}`, limits);
      
      await db.query(
        'UPDATE users SET upgradeLevel = ?, withdrawal_min_usd = ?, withdrawal_max_usd = ? WHERE id = ?',
        [level, limits.min, limits.max, upgrade.userId]
      );
    }

    console.log(`UpdateUpgrade: Success for id=${id}`);
    return res.json({ success: true });
  } catch (e) {
    console.error('Update upgrade error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
}

// Deposit Settings CRUD
export async function getDepositSettings(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('GetDepositSettings: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const [rows] = await db.query('SELECT * FROM deposit_settings WHERE id = 1 LIMIT 1');
    let settings = rows[0];

    // If no settings exist, create default ones
    if (!settings) {
      console.log('🔧 Creating default deposit settings...');
      await db.query(
        'INSERT INTO deposit_settings (id, bank_account_number, bank_account_holder, bank_routing_number, bank_name, crypto_address) VALUES (1, "", "", "", "", "")'
      );
      settings = {
        id: 1,
        bank_account_number: '',
        bank_account_holder: '',
        bank_routing_number: '',
        bank_name: '',
        crypto_address: '',
      };
    }

    const data = {
      bank: {
        accountNumber: settings.bank_account_number || '',
        accountHolder: settings.bank_account_holder || '',
        routingNumber: settings.bank_routing_number || '',
        bankName: settings.bank_name || '',
      },
      crypto: {
        address: settings.crypto_address || '',
      },
    };

    return res.json({ success: true, data });
  } catch (e) {
    console.error('Get deposit settings error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function updateDepositSettings(req, res) {
  try {
    const db = getDb();
    if (!db) {
      console.error('UpdateDepositSettings: Database not connected');
      return res.status(500).json({ message: 'Database not connected' });
    }

    const { bank, crypto } = req.body;

    const updates = {
      bank_account_number: bank?.accountNumber,
      bank_account_holder: bank?.accountHolder,
      bank_routing_number: bank?.routingNumber,
      bank_name: bank?.bankName,
      crypto_address: crypto?.address,
    };

    const updateKeys = Object.keys(updates);
    const updateValues = Object.values(updates);
    const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

    const [result] = await db.query(
      `UPDATE deposit_settings SET ${setClause} WHERE id = 1`,
      updateValues
    );

    return res.json({ success: true });
  } catch (e) {
    console.error('Update deposit settings error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
