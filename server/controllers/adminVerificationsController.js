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

        const rows = await db.collection('verifications').find({}).sort({ requestedAt: -1 }).toArray();
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

        const verification = await db.collection('verifications').findOne({ _id: id });
        if (!verification) return res.status(404).json({ message: 'Verification not found' });

        const updates = {
            status,
            adminNotes: reason || '',
            reviewedAt: new Date(),
            reviewedBy: req.user?.email || 'admin',
        };

        await db.collection('verifications').updateOne(
            { _id: id },
            { $set: updates }
        );

        if (status === 'approved' && verification.userId) {
            await db.collection('users').updateOne(
                { $or: [{ id: verification.userId }, { _id: verification.userId }] },
                { $set: { emailVerified: true, verificationApprovedAt: new Date() } }
            );
        }

        return res.json({ success: true });
    } catch (e) {
        console.error('Update verification error:', e.stack || e);
        return res.status(500).json({ message: e.message || 'Server error' });
    }
}
