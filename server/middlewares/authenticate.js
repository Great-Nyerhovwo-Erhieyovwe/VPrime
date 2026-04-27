/**
 * Authentication Middleware
 * =========================
 * 
 * This middleware validates JWT tokens and attaches authenticated user data to requests.
 * 
 * How it works:
 * 1. Extracts JWT token from "Authorization: Bearer <token>" header
 * 2. Verifies token signature using JWT_SECRET from environment
 * 3. Decodes token to get user ID (stored in 'sub' claim)
 * 4. Queries database to fetch full user object
 * 5. Attaches user object to req.user for use in route handlers
 * 
 * If any step fails, returns 401 Unauthorized
 */

import jwt from "jsonwebtoken";
import { query } from "../utils/db.js";

/**
 * Authenticate Middleware Function
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Should be "Bearer <JWT_TOKEN>"
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * On success: Sets req.user = user object and calls next()
 * On failure: Returns 401 status
 * 
 * Usage in routes:
 *   router.get('/protected', authenticate, (req, res) => {
 *     console.log(req.user); // User object is now available
 *   });
 */
export async function authenticate(req, res, next) {
    // ============================================
    // STEP 1: Extract Authorization Header
    // ============================================
    // Expected format: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
    const auth = req.headers.authorization;
    
    // Check if Authorization header exists and starts with "Bearer "
    if (!auth?.startsWith("Bearer ")) {
        console.warn('Missing or invalid Authorization header');
        return res.sendStatus(401); // 401 Unauthorized
    }

    // Extract token from "Bearer <token>" format
    // Split by space and get the second element (index 1)
    const token = auth.split(" ")[1];

    try {
        // ============================================
        // STEP 2: Verify JWT Token Signature
        // ============================================
        // Verify token using JWT_SECRET from environment
        // If signature is invalid or token is expired, this throws an error
        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET || process.env.VITE_JWT_SECRET
        );

        // JWT payload structure (set when token is created in authController.js):
        // {
        //   sub: userId,          // 'sub' = subject (standard JWT claim)
        //   role: userRole,       // User's role (trader, admin, etc.)
        //   iat: issuedAtTime,    // When token was issued
        //   exp: expirationTime   // When token expires
        // }

        // ============================================
        // STEP 3: Fetch User from Database
        // ============================================

        const userId = payload.sub;

        const rows = await query(
            'SELECT * FROM users WHERE id = ? LIMIT 1',
            [userId]
        );

        let user = rows[0];

        if (!user) {
            console.warn(`User with ID ${userId} not found in database`);
            return res.sendStatus(401);
        }

        // ============================================
        // STEP 4: Attach User to Request
        // ============================================
        // Set req.user so route handlers can access authenticated user's data
        // This is the FULL user object from database (all fields)
        req.user = user;

        // Continue to next middleware/route handler
        next();

    } catch (e) {
        // ============================================
        // ERROR HANDLING
        // ============================================
        // JWT verification can fail for multiple reasons:
        // - Invalid signature (token was tampered with)
        // - Expired token (past exp time)
        // - Malformed token (not valid JWT format)
        // - Database error while fetching user
        
        console.error("Authentication error:", e.message || e);
        return res.sendStatus(401); // 401 Unauthorized
    }
}
