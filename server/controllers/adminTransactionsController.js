/**
 * Admin Transactions Controller
 *
 * Handles admin operations for viewing transaction history:
 * - List all transactions (completed, pending, failed)
 * - View transaction details
 * - Transaction history and summaries
 */

import { Transaction } from '../models/index.js';

/**
 * List all transactions
 * Returns: Array of transaction objects with user info, amounts, status
 */
export async function listTransactions(req, res) {
    try {
        const type = String(req.query.type || '').toLowerCase();
        console.log(`ListTransactions: Fetching type=${type}`);

        let query = { };
        if (type === 'deposit' || type === 'withdrawal' || type === 'trade') {
            query.type = type;
        }

        const transactions = await Transaction.find(query)
            .populate('userId', 'email firstName lastName')
            .sort({ createdAt: -1 });

        const formattedTransactions = transactions.map((transaction) => ({
            id: transaction.id,
            userId: transaction.userId.id || transaction.userId,
            userEmail: transaction.userId.email,
            firstName: transaction.userId.firstName,
            lastName: transaction.userId.lastName,
            type: transaction.type,
            referenceId: transaction.referenceId,
            amount: transaction.amount,
            status: transaction.status,
            method: transaction.method,
            createdAt: transaction.createdAt,
            processedAt: transaction.processedAt,
            notes: transaction.notes,
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
        const [transactionRows] = await db.query('SELECT * FROM transactions WHERE id = ? LIMIT 1', [id]);
        const transaction = transactionRows[0];
        if (!transaction) {
            console.log(`UpdateTransaction: Transaction not found for id=${id}`);
            return res.status(404).json({ message: 'Transaction not found' });
        }

        console.log(`UpdateTransaction: Found transaction:`, transaction);

        // Start transaction for atomicity
        await db.query('START TRANSACTION');

        try {
            // Update transaction record
            const updates = {
                status,
                adminNotes: adminNotes || '',
                reviewedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
                reviewedBy: req.user?.email || 'admin',
            };

            const updateKeys = Object.keys(updates);
            const updateValues = Object.values(updates);
            const setClause = updateKeys.map(k => `${k} = ?`).join(", ");

            await db.query(
                `UPDATE transactions SET ${setClause} WHERE id = ?`,
                [...updateValues, id]
            );

            // If deposit is approved and creditUser flag is true, add funds to user balance
            if (status === 'approved' && creditUser && transaction.type === 'deposit') {
                await db.query(
                    'UPDATE users SET balanceUsd = balanceUsd + ? WHERE id = ?',
                    [transaction.amount, transaction.userId]
                );
                console.log(`UpdateTransaction: Credited ${transaction.amount} to user ${transaction.userId}`);
            }

            // If withdrawal is approved, deduct from balance (optional - depends on flow)
            if (status === 'approved' && transaction.type === 'withdrawal') {
                // Check current balance first
                const [userRows] = await db.query('SELECT balanceUsd FROM users WHERE id = ? LIMIT 1', [transaction.userId]);
                const user = userRows[0];

                if (!user || user.balanceUsd < transaction.amount) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({ message: 'Insufficient funds for withdrawal' });
                }

                await db.query(
                    'UPDATE users SET balanceUsd = balanceUsd - ? WHERE id = ?',
                    [transaction.amount, transaction.userId]
                );
                console.log(`UpdateTransaction: Debited ${transaction.amount} from user ${transaction.userId}`);
            }

            await db.query('COMMIT');
            console.log(`UpdateTransaction: Success for id=${id}`);
            return res.json({ success: true });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (e) {
        console.error('Update transaction error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
