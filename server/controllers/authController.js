import nodemailer from "nodemailer";
import { query } from '../utils/db.js';


// Simple in-memory OTP store (replace with Redis in production)
const otpStore = new Map();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || process.env.VITE_SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.VITE_SMTP_PASS,
    }
});

function generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp);
    return otp;
}

async function sendOTPEmail(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || 'vertexprimecapitals@gmail.com',
        to: email,
        subject: 'VertexPrime Capital - Verification Code',
        text: `Your verification code is: ${otp}`,
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (e) {
        console.error('Failed to send email', e.message || e);
        return false;
    }
}

export async function sendOtp(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Missing email' });
        // check if user exists
        const existing = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

        if (existing && existing[0]) {
            return res.status(400).json({
                message: 'Email already registered'
            });
        }
        const otp = generateOTP();
        console.log(`Generated OTP for ${email}: ${otp}`); // local dev only
        otpStore.set(email, { otp, ts: Date.now() });

        // In development mode, allow proceeding without actually sending email
        // if (process.env.NODE_ENV !== 'production' && process.env.VITE_APP_ENV !== 'production') {
        //     console.log(`📧 [DEV MODE] OTP would be sent to ${email}: ${otp}`);
        //     return res.json({ success: true, devOtp: otp }); // Include OTP for testing/locally
        // } 


        // ===== FOR PRODUCTION =======
        if (process.env.NODE_ENV === 'production' || process.env.VITE_APP_ENV === 'production') {
            await sendOTPEmail(email, otp);
            return res.json({ success: true })
        } else {
            console.log(`📧 [DEV MODE] OTP would be sent to ${email}: ${otp}`);
            return res.json({ success: true, devOtp: otp }); // Include OTP for testing/locally

        }

        const sent = await sendOTPEmail(email, otp);
        if (!sent) return res.status(500).json({ message: 'Failed to send OTP' });
        return res.json({ success: true });
    } catch (e) {
        console.error('❌ SendOtp error:', e.message || e);
        console.error('❌ Stack:', e.stack);
        return res.status(500).json({ message: 'Server error: ' + (e.message || 'Unknown') });
    }
}

export async function verifyOtp(req, res) {
    try {
        const { email, otp, userData } = req.body;
        if (!email || !otp || !userData) return res.status(400).json({ message: 'Missing params' });
        const stored = otpStore.get(email);
        if (!stored) return res.status(400).json({ message: 'OTP not found' });
        if (Date.now() - stored.ts > 10 * 60 * 1000) { otpStore.delete(email); return res.status(400).json({ message: 'OTP expired' }); }
        if (stored.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        // insert new user with plain password (insecure; per user request)
        const result = await query(
            `INSERT INTO users (email, password, firstName, lastName, username, country, currency, accountType, dateOfBirth, role, emailVerified, createdAt, balanceUsd, roi)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            email,
            userData.password,
            userData.firstName || '',
            userData.lastName || '',
            userData.username || '',
            userData.country || '',
            userData.currency || 'USD',
            userData.accountType || 'individual',
            userData.dateOfBirth || null,
            'trader',
            true,
            new Date(),
            0,
            0
        ]
        )

        // insert new created user
        // const insertedId = result.insertId


        otpStore.delete(email);
        return res.json({ success: true, id: result.insertId });
    } catch (e) {
        console.error('❌ VerifyOtp error:', e.message || e);
        console.error('❌ Stack:', e.stack);
        return res.status(500).json({ message: 'Server error: ' + (e.message || 'Unknown') });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        console.log('🔄 User login attempt:', { email, ip: req.ip });
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ message: 'Missing credentials' });
        }

        console.log('🔍 Querying database for user:', email);
        const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];
        console.log('👤 User found:', { id: user.id, email: user.email, role: user.role });

        if (password !== user.password) {
            console.log('❌ Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if user is banned
        if (user.banned) {
            console.log('🚫 User is banned:', email);
            return res.status(403).json({
                success: false,
                message: 'Your account has been banned and you cannot login. Please contact support.'
            });
        }

        console.log('✅ Password match, generating token for user:', email);

        // Generate JWT token for frontend
        const jwt = await import('jsonwebtoken').then(m => m.default);
        const token = jwt.sign(
            { sub: (user._id || user.id)?.toString() || user.email, role: user.role },
            process.env.JWT_SECRET || process.env.VITE_JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || process.env.VITE_JWT_EXPIRES_IN || '24h' }
        );
        console.log('✅ Token generated, returning response');

        return res.json({
            success: true,
            token,
            user: {
                id: user.id?.toString(),
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (e) {
        console.error('❌ Login error:', e.message || e);
        console.error('❌ Full error stack:', e.stack);
        return res.status(500).json({ message: 'Server error: ' + (e.message || 'Unknown error') });
    }
}

export async function me(req, res) {
    try {
        const userId = req.user?.sub;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const users = await query(
            'SELECT id, email, role, balanceUsd, roi, firstName, lastName FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(users[0]);
    } catch (err) {
        console.error('❌ Me error:', err.message || err);
        console.error('❌ Stack:', err.stack);
        return res.status(500).json({ message: 'Server error: ' + (err.message || 'Unknown') });
    }
}

