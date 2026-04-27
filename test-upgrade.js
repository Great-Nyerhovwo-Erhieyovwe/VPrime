import mysql from 'mysql2/promise';

async function testUpgrade() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'SilverWC@101',
    database: 'cfdtradingprodb',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  try {
    const conn = await pool.getConnection();
    
    // Get the column information
    console.log('📋 Upgrades table structure:');
    const [columns] = await conn.query('DESCRIBE upgrades');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'required'})`);
    });
    
    // Check if upgrades table exists and has data
    const [existing] = await conn.query('SELECT COUNT(*) as count FROM upgrades');
    console.log(`\n📊 Existing upgrade requests: ${existing[0].count}`);
    
    // Clear all and insert fresh test data
    console.log('🔧 Clearing old data and inserting fresh test upgrade requests...');
    await conn.query('DELETE FROM upgrades');
    
    // First get test users
    const [users] = await conn.query('SELECT id, email FROM users LIMIT 5');
    if (users.length > 0) {
      console.log(`  Found ${users.length} users, creating upgrade requests...`);
      
      const levels = ['mini', 'standard', 'pro', 'premium'];
      for (let i = 0; i < Math.min(3, users.length); i++) {
        const userId = users[i].id;
        const level = levels[i % levels.length];
        
        await conn.query(
          `INSERT INTO upgrades (userId, upgradeLevel, amount, status, requestedAt, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, level, 99.99 + (i * 50), 'pending', new Date(), new Date()]
        );
        console.log(`    ✅ Request ${i+1}: User ${userId} requesting upgrade to ${level}`);
      }
    } else {
      console.log('⚠️ No users found');
    }
    
    // Fetch and display upgrade requests
    const [upgrades] = await conn.query('SELECT * FROM upgrades ORDER BY createdAt DESC');
    console.log(`\n📋 All ${upgrades.length} upgrade requests:`);
    upgrades.forEach((u, idx) => {
      console.log(`  ${idx+1}. ID: ${u.id} | User: ${u.userId} | Level: ${u.upgradeLevel} | Amount: $${u.amount} | Status: ${u.status}`);
    });
    
    conn.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  await pool.end();
}

testUpgrade();
