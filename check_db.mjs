import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });
    
    console.log('✅ Connected to database\n');
    
    // Check all transactions
    const [transactions] = await connection.execute('SELECT id, type, status, amount, userId, createdAt FROM transactions');
    console.log('📊 All transactions in database:');
    console.log('Count:', transactions.length);
    if (transactions.length === 0) {
      console.log('⚠️  No transactions found in database');
    } else {
      transactions.forEach(t => {
        console.log(`  ID: ${t.id}, Type: ${t.type}, Status: ${t.status}, Amount: ${t.amount}, UserId: ${t.userId}, Created: ${t.createdAt}`);
      });
    }
    
    // Check deposits
    const [deposits] = await connection.execute("SELECT COUNT(*) as count FROM transactions WHERE type = 'deposit'");
    console.log(`\n💰 Deposits: ${deposits[0].count}`);
    
    // Check withdrawals
    const [withdrawals] = await connection.execute("SELECT COUNT(*) as count FROM transactions WHERE type = 'withdrawal'");
    console.log(`💸 Withdrawals: ${withdrawals[0].count}`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkData();
