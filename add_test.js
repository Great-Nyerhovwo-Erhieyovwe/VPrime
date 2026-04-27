import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addTestData() {
  try {
    console.log('Connecting to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
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
      [2, 'deposit', 5000, 'pending', 'bank', 'Test deposit', new Date()]
    );
    console.log('✅ Test deposit added with ID:', depositResult.insertId);
    
    // Add test withdrawal
    const [withdrawalResult] = await connection.execute(
      "INSERT INTO transactions (userId, type, amount, status, method, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [2, 'withdrawal', 1000, 'pending', 'crypto', 'Test withdrawal', new Date()]
    );
    console.log('✅ Test withdrawal added with ID:', withdrawalResult.insertId);
    
    // Verify
    const [all] = await connection.execute('SELECT id, type, status, amount FROM transactions ORDER BY createdAt DESC');
    console.log('\n📊 All transactions in database:');
    all.forEach(t => {
      console.log(`  ID: ${t.id}, Type: ${t.type}, Status: ${t.status}, Amount: $${t.amount}`);
    });
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

addTestData();
