import mysql from 'mysql2/promise';
import 'dotenv/config';

async function testAdminLogin() {
  try {
    console.log('Testing admin user...\n');
    
    // Check environment admin credentials
    console.log('📋 Environment Admin Config:');
    console.log('  VITE_ADMIN_EMAIL:', process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL);
    console.log('  VITE_ADMIN_PASS:', process.env.VITE_ADMIN_PASS || process.env.ADMIN_PASS);
    
    // Connect to database and check user
    const c = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('\n🔍 Checking database for admin user...');
    const [rows] = await c.execute(
      'SELECT id, email, password, role FROM users WHERE email = ? OR role = ?',
      ['cfdtradingpro@gmail.com', 'admin']
    );
    
    console.log('Found users:', rows.length);
    rows.forEach(r => {
      console.log(`  - Email: ${r.email}, Role: ${r.role}, Password: ${r.password}`);
    });
    
    // Check all users
    const [allUsers] = await c.execute('SELECT id, email, role FROM users LIMIT 5');
    console.log('\nFirst 5 users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (role: ${u.role})`);
    });
    
    // Check deposits/withdrawals
    const [deposits] = await c.execute('SELECT id, type, userId, amount, status FROM transactions WHERE type = "deposit"');
    const [withdrawals] = await c.execute('SELECT id, type, userId, amount, status FROM transactions WHERE type = "withdrawal"');
    
    console.log('\n💰 Transactions in database:');
    console.log(`  Deposits: ${deposits.length}`);
    deposits.forEach(d => {
      console.log(`    - ID: ${d.id}, User: ${d.userId}, Amount: $${d.amount}, Status: ${d.status}`);
    });
    console.log(`  Withdrawals: ${withdrawals.length}`);
    withdrawals.forEach(w => {
      console.log(`    - ID: ${w.id}, User: ${w.userId}, Amount: $${w.amount}, Status: ${w.status}`);
    });
    
    await c.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAdminLogin();
