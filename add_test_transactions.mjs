import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addTestData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('✅ Connected to database\n');
    
    // Add test deposit
    const [depositResult] = await connection.execute(
      "INSERT INTO transactions (userId, type, amount, status, method, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [1, 'deposit', 5000, 'pending', 'bank', 'Test deposit via API', new Date()]
    );
    console.log('✅ Test deposit added:', depositResult.insertId);
    
    // Add test withdrawal
    const [withdrawalResult] = await connection.execute(
      "INSERT INTO transactions (userId, type, amount, status, method, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [1, 'withdrawal', 1000, 'pending', 'crypto', 'Test withdrawal via API', new Date()]
    );
    console.log('✅ Test withdrawal added:', withdrawalResult.insertId);
    
    // Verify
    const [all] = await connection.execute('SELECT id, type, status, amount FROM transactions');
    console.log('\n📊 Transactions now in database:');
    all.forEach(t => {
      console.log(`  ID: ${t.id}, Type: ${t.type}, Status: ${t.status}, Amount: $${t.amount}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

addTestData();
