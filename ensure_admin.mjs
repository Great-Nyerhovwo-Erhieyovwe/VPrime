import mysql from 'mysql2/promise';
import 'dotenv/config';
import { randomUUID } from 'crypto';

async function ensureAdminUser() {
  try {
    const c = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    // Check if admin user exists
    const [rows] = await c.execute(
      'SELECT id, email, role FROM users WHERE email = ? LIMIT 1',
      ['cfdtradingpro@gmail.com']
    );
    
    if (rows.length > 0) {
      console.log('✅ Admin user exists:', rows[0]);
      if (rows[0].role !== 'admin') {
        console.log('⚠️  Updating role to admin...');
        await c.execute(
          'UPDATE users SET role = ? WHERE id = ?',
          ['admin', rows[0].id]
        );
        console.log('✅ Admin role set');
      }
    } else {
      console.log('➕ Creating new admin user...');
      const userId = randomUUID();
      await c.execute(
        `INSERT INTO users (id, email, password, firstName, lastName, role, emailVerified, balanceUsd)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'cfdtradingpro@gmail.com', 'CFDTrading@101', 'Admin', 'User', 'admin', true, 5000]
      );
      console.log('✅ Admin user created');
    }
    
    // Verify deposits/withdrawals in database
    const [deposits] = await c.execute('SELECT COUNT(*) as count FROM transactions WHERE type = "deposit"');
    const [withdrawals] = await c.execute('SELECT COUNT(*) as count FROM transactions WHERE type = "withdrawal"');
    console.log(`\n📊 Transactions in database:`);
    console.log(`  Deposits: ${deposits[0].count}`);
    console.log(`  Withdrawals: ${withdrawals[0].count}`);
    
    if (deposits[0].count === 0 || withdrawals[0].count === 0) {
      console.log('\n➕ Inserting test transactions...');
      await c.execute(
        `INSERT INTO transactions (userId, type, amount, status, method, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [2, 'deposit', 5000, 'pending', 'bank', 'Test deposit', new Date()]
      );
      await c.execute(
        `INSERT INTO transactions (userId, type, amount, status, method, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [2, 'withdrawal', 1000, 'pending', 'crypto', 'Test withdrawal', new Date()]
      );
      console.log('✅ Test transactions inserted');
    }
    
    await c.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

ensureAdminUser();
