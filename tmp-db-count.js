import { connectDB } from './server/utils/db.js';

async function main() {
  const db = await connectDB();
  if (!db) {
    console.error('DB connection failed');
    process.exit(1);
  }

  const counts = [
    'SELECT COUNT(*) AS c FROM transactions',
    'SELECT COUNT(*) AS c FROM deposits',
    'SELECT COUNT(*) AS c FROM withdrawals',
    'SELECT COUNT(*) AS c FROM trades',
    'SELECT COUNT(*) AS c FROM users',
  ];

  for (const sql of counts) {
    try {
      const [rows] = await db.execute(sql);
      console.log(sql, '=>', rows[0].c);
    } catch (err) {
      console.error(sql, 'ERROR', err.message);
    }
  }

  process.exit(0);
}

main();