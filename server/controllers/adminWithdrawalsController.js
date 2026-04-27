/**
 * Admin Withdrawals Controller
 *
 * Handles admin operations for managing withdrawals:
 * - List all withdrawals (pending, approved, rejected)
 * - Approve/reject withdrawals
 * - Add admin notes
 * - When a withdrawal is approved, debit the user's balance
 */

import { Withdraw, User } from '../models/index.js';

/**
 * List all withdrawals
 * Returns: Array of withdrawal objects with user info, amounts, status
 */
export async function listWithdrawals(req, res) {
    try {
        const withdrawals = await Withdraw.find({})
            .populate('userId', 'email firstName lastName currency')
            .sort({ createdAt: -1 });

        const formattedWithdrawals = withdrawals.map((withdrawal) => ({
            id: withdrawal.id,
            userId: withdrawal.userId.id || withdrawal.userId,
            userEmail: withdrawal.userId.email,
            firstName: withdrawal.userId.firstName,
            lastName: withdrawal.userId.lastName,
            amount: withdrawal.amount,
            withdrawalMethod: withdrawal.withdrawalMethod,
            destinationAddress: withdrawal.destinationAddress,
            status: withdrawal.status === 'completed' ? 'approved' : withdrawal.status === 'failed' ? 'rejected' : withdrawal.status,
            requestedAt: withdrawal.requestedAt,
            approvedAt: withdrawal.approvedAt,
            processedAt: withdrawal.processedAt,
            adminNotes: withdrawal.adminNotes,
            currency: withdrawal.userId.currency || 'USD',
            method: withdrawal.withdrawalMethod,
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
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user?.id || req.admin?.id; // Assuming admin auth middleware sets this

        console.log(`UpdateWithdrawal: id=${id}, status=${status}, notes=${adminNotes}`);

        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find withdrawal
        const withdrawal = await Withdraw.findOne({ id });
        if (!withdrawal) {
            console.log(`UpdateWithdrawal: Withdrawal not found for id=${id}`);
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        console.log(`UpdateWithdrawal: Found withdrawal:`, withdrawal);

        // If approving, check sufficient funds
        if (status === 'approved') {
            const user = await User.findOne({ id: withdrawal.userId });
            const amountToDebit = Math.abs(withdrawal.amount);

            if (!user || user.balanceUsd < amountToDebit) {
                return res.status(400).json({ message: 'Insufficient funds for withdrawal' });
            }

            // Approve and debit balance
            await withdrawal.approve(adminId, adminNotes);
            user.balanceUsd -= amountToDebit;
            await user.save();
            console.log(`UpdateWithdrawal: Debited ${amountToDebit} from user ${withdrawal.userId}`);
        } else if (status === 'rejected') {
            await withdrawal.reject(adminId, adminNotes);
        }

        console.log(`UpdateWithdrawal: Success for id=${id}`);
        return res.json({ success: true });
    } catch (e) {
        console.error('Update withdrawal error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}