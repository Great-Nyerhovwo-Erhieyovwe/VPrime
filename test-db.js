import 'dotenv/config';
import { connectDb, getDb } from './server/utils/db.js';

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        const db = await connectDb(process.env.DATABASE_URL);
        console.log('Connection successful:', !!db);

        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();