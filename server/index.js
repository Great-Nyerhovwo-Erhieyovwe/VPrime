/**
 * VPrime Capital - Backend Server
 * ====================================
 * 
 * Main Express server setup with:
 * - MariaDB connection (primary)
 * - Local db.json fallback (secondary)
 * - CORS and security middleware
 * - API route management
 * 
 * Architecture Overview:
 * ┌─────────────────────────────────────────────────┐
 * │  Frontend (React + Vite) - http://localhost:5173│
 * └─────────────────┬───────────────────────────────┘
 *                   │ HTTP Requests (JWT auth)
 *                   ▼
 * ┌─────────────────────────────────────────────────┐
 * │  Express Server - http://localhost:4000         │
 * │  ├─ CORS middleware (cross-origin)              │
 * │  ├─ JSON body parser                            │
 * │  └─ API routes (/api/auth, /api/dashboard)      │
 * └─────────────────┬───────────────────────────────┘
 *                   │
 *                   ├──► MongoDB Atlas (Primary DB)
 *                   └──► db.json (Fallback DB if needed)
 */

// ============================================
// IMPORTS
// ============================================
import 'dotenv/config';                    // Load environment variables from .env
import express from 'express';              // Web framework
import cors from 'cors';                    // Cross-Origin Resource Sharing
import helmet from 'helmet';                // Security headers
import routes from './routes/index.js';     // API routes
import { connectDB } from './utils/db.js'; // MongoDB utilities
import jwt from 'jsonwebtoken';             // JWT token handling (optional, for reference)
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


// ============================================
// MongoDB Atlas Connection Setup
// ============================================

// ============================================
// INITIALIZE EXPRESS APP
// ============================================
const app = express();
// const PORT = process.env.PORT || 4000;

// ============================================
// CORS CONFIGURATION
// ============================================
// Determines which frontend URLs can make requests to this backend
// Essential for cross-origin requests from React frontend
const FRONTEND_ORIGIN =
    process.env.FRONTEND_ORIGIN ||
    process.env.VITE_FRONTEND_ORIGIN ||
    (process.env.NODE_ENV === 'production'
      ? 'https://vprimecapital.onrender.com'
      : 'http://localhost:5173');

// Configure CORS to allow requests from frontend
// credentials: true allows cookies to be sent with requests
app.use(cors({ 
    origin: FRONTEND_ORIGIN, 
    credentials: true 
}));

// ============================================
// SECURITY & MIDDLEWARE
// ============================================
// Helmet sets security headers (prevents XSS, clickjacking, etc.)
app.use(helmet());

// Parse JSON request bodies (e.g., POST /login with { email, password })
app.use(express.json());

// Parse URL-encoded request bodies (e.g., form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================
// Mount all API routes under /api prefix
// Routes structure:
//   /api/auth/*           - Authentication (login, signup, OTP)
//   /api/admin/*          - Admin operations
//   /api/dashboard/*      - User dashboard (requires JWT auth)
app.use('/api', routes);

// app.use('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));
// })

// ===========================================
// Build setup for ES Modules
// ===========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// SERVE FRONTEND (React build in /dist)
// ============================================

// 1. Serve static files (JS, CSS, images)
app.use(express.static(path.join(__dirname, 'dist')));

// 2. SPA fallback (VERY IMPORTANT FIX)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============================================
// GLOBAL ERROR HANDLER (MUST BE LAST)
// ============================================
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});



// ============================================
// DATABASE CONNECTION & SERVER STARTUP
// ============================================
async function seedDatabase(connection) {
    if (!connection || !connection.db) return;

    try {
        const users = connection.db.collection('users');
        const existingAdmin = await users.findOne({ email: 'vertexprimecapitals@gmail.com' });

        if (!existingAdmin) {
            await users.insertOne({
                id: '550e8400-e29b-41d4-a716-446655440000',
                firstName: 'Admin',
                lastName: 'User',
                username: 'admin_cfd',
                email: 'vertexprimecapitals@gmail.com',
                password: 'VPrime@101',
                country: 'USA',
                currency: 'USD',
                accountType: 'individual',
                role: 'admin',
                emailVerified: true,
                balanceUsd: 5000,
                roi: 0,
                darkMode: false,
                notifications: true,
                language: 'en',
                timezone: 'UTC',
                upgradeLevel: 'free',
                withdrawal_min_usd: 500,
                withdrawal_max_usd: 5000,
                createdAt: new Date(),
            });
            console.log('✅ Seeded MongoDB admin user');
        }

        const upgradePlans = connection.db.collection('upgrade_plans');
        const planCount = await upgradePlans.countDocuments();
        if (planCount === 0) {
            await upgradePlans.insertMany([
                {
                    id: '660e8400-e29b-41d4-a716-446655440001',
                    name: 'mini',
                    slug: 'mini',
                    description: 'Mini Plan - Entry Level Trading',
                    priceMonthly: 49.99,
                    priceAnnual: 499.9,
                    currency: 'USD',
                    features: 'Up to $5,000 trading limit,Basic market data,Email support',
                    active: true,
                    popular: false,
                    displayOrder: 1,
                    color: '#10B981',
                    createdAt: new Date(),
                },
                {
                    id: '660e8400-e29b-41d4-a716-446655440002',
                    name: 'standard',
                    slug: 'standard',
                    description: 'Standard Plan - Regular Traders',
                    priceMonthly: 299.99,
                    priceAnnual: 2999.9,
                    currency: 'USD',
                    features: 'Up to $50,000 trading limit,Advanced market data,Priority support,API access',
                    active: true,
                    popular: true,
                    displayOrder: 2,
                    color: '#3B82F6',
                    createdAt: new Date(),
                },
                {
                    id: '660e8400-e29b-41d4-a716-446655440003',
                    name: 'pro',
                    slug: 'pro',
                    description: 'Pro Plan - Professional Traders',
                    priceMonthly: 799.99,
                    priceAnnual: 7999.9,
                    currency: 'USD',
                    features: 'Up to $500,000 trading limit,Real-time data,24/7 support,Unlimited trades,Dedicated manager',
                    active: true,
                    popular: false,
                    displayOrder: 3,
                    color: '#F59E0B',
                    createdAt: new Date(),
                },
                {
                    id: '660e8400-e29b-41d4-a716-446655440004',
                    name: 'premium',
                    slug: 'premium',
                    description: 'Premium Plan - Institutional',
                    priceMonthly: 1999.99,
                    priceAnnual: 19999.9,
                    currency: 'USD',
                    features: 'Unlimited trading limit,Premium data feeds,24/7 dedicated support,Custom integrations',
                    active: true,
                    popular: false,
                    displayOrder: 4,
                    color: '#8B5CF6',
                    createdAt: new Date(),
                }
            ]);
            console.log('✅ Seeded MongoDB upgrade plans');
        }

        const depositSettings = connection.db.collection('deposit_settings');
        const existingSettings = await depositSettings.findOne({ id: 1 });
        if (!existingSettings) {
            await depositSettings.insertOne({
                id: 1,
                bank_account_number: '1234567890',
                bank_account_holder: 'CFD Financial Bank',
                bank_routing_number: '121000248',
                bank_name: 'CFD Financial Bank',
                crypto_address: 'THQYgNzTYo7g5aBhhJLMc2FaA632FwZ4WK',
                updated_at: new Date(),
            });
            console.log('✅ Seeded MongoDB deposit settings');
        }
    } catch (e) {
        console.error('❌ Seed data error:', e.message || e);
    }
}

async function start() {
    const PORT = process.env.PORT || 4000;

    const db = await connectDB();
    console.log('DB connection result:', !!db);

    if (!db) {
        console.error('❌ Failed to connect to MongoDB Atlas. Please check DATABASE_URL in .env.');
        process.exit(1);
        return;
    }

    await seedDatabase(db);
    console.log('✅ Database ready for use');

    app.listen(PORT, () => {
        console.log(`🚀 API listening on http://localhost:${PORT}`);
        console.log(`📱 Frontend URL: ${FRONTEND_ORIGIN}`);
        console.log('\n✨ Server ready for requests!\n');
    });
}

// ============================================
// ERROR HANDLING FOR STARTUP
// ============================================
start().catch((e) => {
    console.error('❌ Failed to start server:', e);
    process.exit(1); // Exit with error code
});
