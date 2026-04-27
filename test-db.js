import { query, connectDB } from './server/utils/db.js';

async function test() {
  const db = await connectDB();
  if (!db) {
    console.log('Database not connected');
    return;
  }

  try {
    // Check if tables exist
    const [tables] = await query('SHOW TABLES');
    console.log('Tables:', tables.map(t => Object.values(t)[0]));

    // Check users count
    const [users] = await query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);

    // Check transactions count
    const [transactions] = await query('SELECT COUNT(*) as count FROM transactions');
    console.log('Transactions count:', transactions[0].count);

    // If no users, insert a test user
    if (users[0].count === 0) {
      console.log('Inserting test user...');
      await query('INSERT INTO users (id, email, password, firstName, lastName, balanceUsd, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['test1', 'test@example.com', 'password', 'Test', 'User', 1000, 1]);
      console.log('Test user inserted');
    }

    // If no transactions, insert test transactions
    if (transactions[0].count === 0) {
      console.log('Inserting test transactions...');
      await query('INSERT INTO transactions (id, userId, amount, type, status) VALUES (?, ?, ?, ?, ?)',
        ['tx1', 'test1', 500, 'deposit', 'approved']);
      await query('INSERT INTO transactions (id, userId, amount, type, status) VALUES (?, ?, ?, ?, ?)',
        ['tx2', 'test1', 200, 'withdrawal', 'approved']);
      console.log('Test transactions inserted');
    }

  } catch (e) {
    console.error('Error:', e);
  }
}

test();