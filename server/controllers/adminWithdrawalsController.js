/**
 * Admin Withdrawals Controller
 *
 * Handles admin operations for managing withdrawals:
 * - List all withdrawals (pending, approved, rejected)
 * - Approve/reject withdrawals
 * - Add admin notes
 * - When a withdrawal is approved, debit the user's balance
 */

import { getDb } from '../utils/db.js';

/**
 * List all withdrawals
 * Returns: Array of withdrawal objects with user info, amounts, status
 */
export async function listWithdrawals(req, res) {
    try {
        const db = getDb();
        const withdrawals = await db.collection('withdrawals').find({}).sort({ requestedAt: -1 }).toArray();

        // Get user info for each withdrawal
        const formattedWithdrawals = await Promise.all(withdrawals.map(async (withdrawal) => {
            const user = await db.collection('users').findOne(
                { $or: [{ id: withdrawal.userId }, { _id: withdrawal.userId }] },
                { projection: { email: 1, firstName: 1, lastName: 1, currency: 1 } }
            );

            return {
                id: withdrawal._id || withdrawal.id,
                userId: withdrawal.userId,
                userEmail: user?.email || 'Unknown',
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                amount: withdrawal.amount,
                withdrawalMethod: withdrawal.withdrawalMethod,
                destinationAddress: withdrawal.destinationAddress,
                status: withdrawal.status === 'completed' ? 'approved' : withdrawal.status === 'failed' ? 'rejected' : withdrawal.status,
                requestedAt: withdrawal.requestedAt,
                approvedAt: withdrawal.approvedAt,
                processedAt: withdrawal.processedAt,
                adminNotes: withdrawal.adminNotes,
                currency: user?.currency || 'USD',
                method: withdrawal.withdrawalMethod,
            };
        }));

        console.log(`ListWithdrawals: Found ${formattedWithdrawals.length} withdrawals from database`);
        return res.json(formattedWithdrawals);
    } catch (e) {
        console.error('List withdrawals error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

/**
 * Update withdrawal status (approve/reject)
 *
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   adminNotes: 'reason or additional notes'
 * }
 *
 * When approved: debits user balance (if sufficient funds)
 */
export async function updateWithdrawal(req, res) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user?.id || req.admin?.id;

        console.log(`UpdateWithdrawal: id=${id}, status=${status}, notes=${adminNotes}`);

        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find withdrawal
        const withdrawal = await db.collection('withdrawals').findOne({ $or: [{ _id: id }, { id }] });
        if (!withdrawal) {
            console.log(`UpdateWithdrawal: Withdrawal not found for id=${id}`);
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        console.log(`UpdateWithdrawal: Found withdrawal:`, withdrawal);

        // If approving, check sufficient funds
        if (status === 'approved') {
            const user = await db.collection('users').findOne({ $or: [{ id: withdrawal.userId }, { _id: withdrawal.userId }] });
            const amountToDebit = Math.abs(withdrawal.amount);

            if (!user || user.balanceUsd < amountToDebit) {
                return res.status(400).json({ message: 'Insufficient funds for withdrawal' });
            }

            // Approve and debit balance
            const updateData = {
                status: 'completed',
                adminNotes: adminNotes || '',
                approvedAt: new Date(),
                processedAt: new Date(),
                reviewedBy: adminId,
            };

            await db.collection('withdrawals').updateOne(
                { $or: [{ _id: id }, { id }] },
                { $set: updateData }
            );

            await db.collection('users').updateOne(
                { $or: [{ id: withdrawal.userId }, { _id: withdrawal.userId }] },
                { $inc: { balanceUsd: -amountToDebit } }
            );

            console.log(`UpdateWithdrawal: Debited ${amountToDebit} from user ${withdrawal.userId}`);
        } else if (status === 'rejected') {
            await db.collection('withdrawals').updateOne(
                { $or: [{ _id: id }, { id }] },
                { $set: {
                    status: 'failed',
                    adminNotes: adminNotes || '',
                    reviewedBy: adminId,
                }}
            );
        }

        console.log(`UpdateWithdrawal: Success for id=${id}`);
        return res.json({ success: true });
    } catch (e) {
        console.error('Update withdrawal error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}