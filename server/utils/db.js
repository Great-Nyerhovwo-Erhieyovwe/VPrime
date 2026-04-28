import mongoose from 'mongoose';

let db = null;

/**
 * Get MongoDB database instance
 * @returns {Object} MongoDB database instance with collection methods
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

/**
 * Connect to MongoDB
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<Object>} Database instance
 */
export async function connectDb(uri) {
  try {
    await mongoose.connect(uri);
    db = mongoose.connection.db;
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeDb() {
  await mongoose.connection.close();
  db = null;
}
