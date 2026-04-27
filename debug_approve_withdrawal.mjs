import mysql from 'mysql2/promise';
import 'dotenv/config';

const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'cfdtradingpro@gmail.com';
const ADMIN_PASS = process.env.VITE_ADMIN_PASS || process.env.ADMIN_PASS || 'CFDTrading@101';
const API_BASE = 'http://localhost:4000';

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const [rows] = await db.execute('SELECT id, userId, amount, status FROM withdrawals LIMIT 1');
  if (rows.length === 0) {
    console.error('No withdrawals found in database');
    process.exit(1);
  }

  const withdrawal = rows[0];
  console.log('Selected withdrawal:', withdrawal);

  const loginRes = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  });
  const loginText = await loginRes.text();
  console.log('Login status:', loginRes.status, 'body:', loginText);
  if (!loginRes.ok) {
    process.exit(1);
  }
  const loginJson = JSON.parse(loginText);
  const token = loginJson.token;
  console.log('Token length:', token?.length);

  const patchRes = await fetch(`${API_BASE}/api/admin/transactions/${withdrawal.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'approved', adminNotes: 'Debug approve', reviewedAt: new Date().toISOString() }),
  });
  const patchText = await patchRes.text();
  console.log('Patch status:', patchRes.status);
  console.log('Patch body:', patchText);
  process.exit(0);
}

run().catch((err) => {
  console.error('ERROR', err);
  process.exit(1);
});
