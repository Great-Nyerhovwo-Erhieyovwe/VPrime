/**
 * Admin Verifications Controller
 *
 * Handles admin operations for KYC and identity verifications:
 * - List pending verifications
 * - Approve or reject with reason
 * - Mark user as verified when approved
 */

import { getDb } from "../utils/db.js";

/**
 * List all verifications (pending, approved, rejected)
 * Returns: Array of verification objects with user info and document details
 */
export async function listVerifications(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('ListVerifications: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const [rows] = await db.query('SELECT * FROM verifications ORDER BY requestedAt DESC');
        return res.json(rows);
    } catch (e) {
        console.error('List verifications error:', e.stack || e);
        return res.status(500).json({ message: e.message || 'Server error' });
    }
}

/**
 * Update verification status (approve/reject)
 *
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   reason: 'rejection reason or approval notes'
 * }
 *
 * When approved:
 * - Sets verification.status = 'approved'
 * - Marks user as emailVerified = true
 * - Records reviewer email and timestamp
 */
export async function updateVerification(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateVerification: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [verificationRows] = await db.query('SELECT * FROM verifications WHERE id = ? LIMIT 1', [id]);
        const verification = verificationRows[0];
        if (!verification) return res.status(404).json({ message: 'Verification not found' });

        const updates = {
            status,
            adminNotes: reason || '',
            reviewedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            reviewedBy: req.user?.email || 'admin',
        };

        const updateKeys = Object.keys(updates);
        const updateValues = Object.values(updates);
        const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

        await db.query(
            `UPDATE verifications SET ${setClause} WHERE id = ?`,
            [...updateValues, id]
        );

        if (status === 'approved' && verification.userId) {
            await db.query(
                'UPDATE users SET emailVerified = 1, verificationApprovedAt = ? WHERE id = ?',
                [new Date().toISOString(), verification.userId]
            );
        }

        return res.json({ success: true });
    } catch (e) {
        console.error('Update verification error:', e.stack || e);
        return res.status(500).json({ message: e.message || 'Server error' });
    }
}
