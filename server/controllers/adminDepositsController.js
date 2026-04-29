/**
 * Admin Deposits Controller
 *
 * Handles admin operations for managing deposits:
 * - List all deposits (pending, approved, rejected)
 * - Approve/reject deposits
 * - Add admin notes
 * - When a deposit is approved, credit the user's balance
 */

import { getDb } from '../utils/db.js';

/**
 * List all deposits
 * Returns: Array of deposit objects with user info, amounts, status
 */
export async function listDeposits(req, res) {
    try {
        const db = getDb();
        const deposits = await db.collection('deposits').find({}).sort({ requestedAt: -1 }).toArray();

        // Get user info for each deposit
        const formattedDeposits = await Promise.all(deposits.map(async (deposit) => {
            const user = await db.collection('users').findOne(
                { $or: [{ id: deposit.userId }, { _id: deposit.userId }] },
                { projection: { email: 1, firstName: 1, lastName: 1, currency: 1 } }
            );

            return {
                id: deposit._id || deposit.id,
                userId: deposit.userId,
                userEmail: user?.email || 'Unknown',
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                amount: deposit.amount,
                paymentMethod: deposit.paymentMethod,
                status: deposit.status === 'completed' ? 'approved' : deposit.status === 'failed' ? 'rejected' : deposit.status,
                requestedAt: deposit.requestedAt,
                approvedAt: deposit.approvedAt,
                adminNotes: deposit.adminNotes,
                currency: user?.currency || 'USD',
                method: deposit.paymentMethod,
            };
        }));

        console.log(`ListDeposits: Found ${formattedDeposits.length} deposits from database`);
        return res.json(formattedDeposits);
    } catch (e) {
        console.error('List deposits error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

/**
 * Update deposit status (approve/reject)
 *
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   adminNotes: 'reason or additional notes'
 * }
 *
 * When approved: credits user balance
 */
export async function updateDeposit(req, res) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user?.id || req.admin?.id;

        console.log(`UpdateDeposit: id=${id}, status=${status}, notes=${adminNotes}`);

        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find deposit
        const deposit = await db.collection('deposits').findOne({ $or: [{ _id: id }, { id }] });
        if (!deposit) {
            console.log(`UpdateDeposit: Deposit not found for id=${id}`);
            return res.status(404).json({ message: 'Deposit not found' });
        }

        console.log(`UpdateDeposit: Found deposit:`, deposit);

        // Update deposit status
        const updateData = {
            status: status === 'approved' ? 'completed' : status === 'rejected' ? 'failed' : status,
            adminNotes: adminNotes || '',
            reviewedBy: adminId,
        };

        if (status === 'approved') {
            updateData.approvedAt = new Date();

            // Credit user balance
            const user = await db.collection('users').findOne({ $or: [{ id: deposit.userId }, { _id: deposit.userId }] });
            if (user) {
                await db.collection('users').updateOne(
                    { $or: [{ id: deposit.userId }, { _id: deposit.userId }] },
                    { $inc: { balanceUsd: deposit.amount } }
                );
                console.log(`UpdateDeposit: Credited ${deposit.amount} to user ${deposit.userId}`);
            }
        }

        await db.collection('deposits').updateOne(
            { $or: [{ _id: id }, { id }] },
            { $set: updateData }
        );

        console.log(`UpdateDeposit: Success for id=${id}`);
        return res.json({ success: true });
    } catch (e) {
        console.error('Update deposit error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}