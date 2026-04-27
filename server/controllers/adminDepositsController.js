/**
 * Admin Deposits Controller
 *
 * Handles admin operations for managing deposits:
 * - List all deposits (pending, approved, rejected)
 * - Approve/reject deposits
 * - Add admin notes
 * - When a deposit is approved, credit the user's balance
 */

import { Deposit, User } from '../models/index.js';

/**
 * List all deposits
 * Returns: Array of deposit objects with user info, amounts, status
 */
export async function listDeposits(req, res) {
    try {
        const deposits = await Deposit.find({})
            .populate('userId', 'email firstName lastName currency')
            .sort({ createdAt: -1 });

        const formattedDeposits = deposits.map((deposit) => ({
            id: deposit.id,
            userId: deposit.userId.id || deposit.userId,
            userEmail: deposit.userId.email,
            firstName: deposit.userId.firstName,
            lastName: deposit.userId.lastName,
            amount: deposit.amount,
            paymentMethod: deposit.paymentMethod,
            status: deposit.status === 'completed' ? 'approved' : deposit.status === 'failed' ? 'rejected' : deposit.status,
            requestedAt: deposit.requestedAt,
            approvedAt: deposit.approvedAt,
            adminNotes: deposit.adminNotes,
            currency: deposit.userId.currency || 'USD',
            method: deposit.paymentMethod,
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
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = req.user?.id || req.admin?.id; // Assuming admin auth middleware sets this

        console.log(`UpdateDeposit: id=${id}, status=${status}, notes=${adminNotes}`);

        // Validate status
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find deposit
        const deposit = await Deposit.findOne({ id });
        if (!deposit) {
            console.log(`UpdateDeposit: Deposit not found for id=${id}`);
            return res.status(404).json({ message: 'Deposit not found' });
        }

        console.log(`UpdateDeposit: Found deposit:`, deposit);

        // Update deposit status
        if (status === 'approved') {
            await deposit.approve(adminId, adminNotes);

            // Credit user balance
            const user = await User.findOne({ id: deposit.userId });
            if (user) {
                user.balanceUsd = (user.balanceUsd || 0) + deposit.amount;
                await user.save();
                console.log(`UpdateDeposit: Credited ${deposit.amount} to user ${deposit.userId}`);
            }
        } else if (status === 'rejected') {
            await deposit.reject(adminId, adminNotes);
        }

        console.log(`UpdateDeposit: Success for id=${id}`);
        return res.json({ success: true });
    } catch (e) {
        console.error('Update deposit error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}