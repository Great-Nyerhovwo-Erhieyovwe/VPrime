/**
 * Admin Transactions Controller
 *
 * Handles admin operations for viewing transaction history:
 * - List all transactions (completed, pending, failed)
 * - View transaction details
 * - Transaction history and summaries
 */

import { getDb, getClient } from '../utils/db.js';

/**
 * List all transactions
 * Returns: Array of transaction objects with user info, amounts, status
 */
export async function listTransactions(req, res) {
    try {
        const db = getDb();
        const type = String(req.query.type || '').toLowerCase();
        console.log(`ListTransactions: Fetching type=${type}`);

        let query = {};
        if (type === 'deposit' || type === 'withdrawal' || type === 'trade') {
            query.type = type;
        }

        const transactions = await db.collection('transactions').find(query).sort({ createdAt: -1 }).toArray();

        // Get user info for each transaction
        const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
            const user = await db.collection('users').findOne(
                { $or: [{ id: transaction.userId }, { _id: transaction.userId }] },
                { projection: { email: 1, firstName: 1, lastName: 1 } }
            );

            return {
                id: transaction._id || transaction.id,
                userId: transaction.userId,
                userEmail: user?.email || 'Unknown',
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                type: transaction.type,
                referenceId: transaction.referenceId,
                amount: transaction.amount,
                status: transaction.status,
                method: transaction.method,
                createdAt: transaction.createdAt,
                processedAt: transaction.processedAt,
                notes: transaction.notes,
            };
        }));

        console.log(`ListTransactions: Found ${formattedTransactions.length} transactions from database`);
        return res.json(formattedTransactions);
    } catch (e) {
        console.error('List transactions error:', e);
        return res.status(500).json({ message: 'Server error', error: e.message });
    }
}

/**
 * Update transaction status (approve/reject)
 *
 * Request body:
 * {
 *   status: 'pending' | 'approved' | 'rejected',
 *   adminNotes: 'reason or additional notes',
 *   creditUser: true // if deposit and approving, credit balance
 * }
 */
export async function updateTransaction(req, res) {
    try {
        const db = getDb();
        if (!db) {
            console.error('UpdateTransaction: Database not connected');
            return res.status(500).json({ message: 'Database not connected' });
        }

        const { id } = req.params;
        const { status, adminNotes, creditUser } = req.body;

        console.log(`UpdateTransaction: id=${id}, status=${status}, notes=${adminNotes}`);

        // status: 'pending' → 'approved' or 'rejected'
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find transaction in database
        const transaction = await db.collection('transactions').findOne({ $or: [{ _id: id }, { id }] });
        if (!transaction) {
            console.log(`UpdateTransaction: Transaction not found for id=${id}`);
            return res.status(404).json({ message: 'Transaction not found' });
        }

        console.log(`UpdateTransaction: Found transaction:`, transaction);

        // Start MongoDB session for atomicity
        const client = getClient();
        const session = client.startSession();

        try {
            await session.withTransaction(async () => {
                // Update transaction record
                const updates = {
                    status,
                    adminNotes: adminNotes || '',
                    reviewedAt: new Date(),
                    updatedAt: new Date(),
                    reviewedBy: req.user?.email || 'admin',
                };

                await db.collection('transactions').updateOne(
                    { $or: [{ _id: id }, { id }] },
                    { $set: updates },
                    { session }
                );

                // If deposit is approved and creditUser flag is true, add funds to user balance
                if (status === 'approved' && creditUser && transaction.type === 'deposit') {
                    await db.collection('users').updateOne(
                        { $or: [{ id: transaction.userId }, { _id: transaction.userId }] },
                        { $inc: { balanceUsd: transaction.amount } },
                        { session }
                    );
                    console.log(`UpdateTransaction: Credited ${transaction.amount} to user ${transaction.userId}`);
                }

                // If withdrawal is approved, deduct from balance (optional - depends on flow)
                if (status === 'approved' && transaction.type === 'withdrawal') {
                    // Check current balance first
                    const user = await db.collection('users').findOne(
                        { $or: [{ id: transaction.userId }, { _id: transaction.userId }] },
                        { session }
                    );

                    if (!user || user.balanceUsd < transaction.amount) {
                        throw new Error('Insufficient funds for withdrawal');
                    }

                    await db.collection('users').updateOne(
                        { $or: [{ id: transaction.userId }, { _id: transaction.userId }] },
                        { $inc: { balanceUsd: -transaction.amount } },
                        { session }
                    );
                    console.log(`UpdateTransaction: Debited ${transaction.amount} from user ${transaction.userId}`);
                }
            });

            console.log(`UpdateTransaction: Success for id=${id}`);
            return res.json({ success: true });
        } catch (error) {
            console.error('Transaction error:', error);
            return res.status(400).json({ message: error.message || 'Transaction failed' });
        } finally {
            await session.endSession();
        }
    } catch (e) {
        console.error('Update transaction error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
