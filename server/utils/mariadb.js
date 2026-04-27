// import mysql from 'mysql2/promise';
// import dotenv from 'dotenv';

// dotenv.config(); // Load environment variables from .env file

// const db = await mysql.createPool({
//     host: process.env.MARIADB_HOST || 'localhost',
//     user: process.env.DB_USER || process.env.VITE_DB_USER || 'root',
//     password: process.env.DB_PASS || process.env.VITE_DB_PASS || 'SWC@101',
//     database: process.env.DB_NAME || process.env.VITE_DB_NAME || 'cfdprotradedb',
//     port: process.env.DB_PORT || process.env.VITE_DB_PORT || 3306,

//     waitForConnections: true,
//     connectionLimit: 10,
//     connectTimeout: 10000, // 10 seconds
// });
 
// export default db;

// export async function connectMariaDB(uri, dbName) {
//     try {
// // Parse URI: mysql://username:password@host:port/database
//         const url = new URL(uri);
//         const connection = await mysql.createConnection({
//             host: url.hostname,
//             user: url.username,
//             password: url.password,
//             database: dbName || url.pathname.slice(1), // Remove leading '/'
//             port: url.port || 3306,
//             connectTimeout: 10000, // 10 seconds
//         });
//         return connection;
//     } catch (error) {
//         console.error('Error connecting to MariaDB:', error);
//         throw error;
//     }
// }