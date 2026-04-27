import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const TransactionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            index: true,
            default: () => randomUUID(),
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['trade', 'deposit', 'withdrawal'],
            required: true,
        },
        referenceId: String, // Links to deposit/withdraw/trade ID
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['completed', 'pending', 'failed'],
            default: 'pending',
            index: true,
        },
        method: String, // Payment method used
        createdAt: {
            type: Date,
            default: Date.now,
        },
        processedAt: Date,
        notes: String,

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });

// Static: Get transaction summary for admin dashboard
TransactionSchema.statics.getSummary = async function () {
    const result = await this.aggregate([
        { $match: { status: 'completed' } },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);

    const deposits = result.find(r => r._id === 'deposit') || { total: 0, count: 0 };
    const withdrawals = result.find(r => r._id === 'withdrawal') || { total: 0, count: 0 };
    const trades = result.find(r => r._id === 'trade') || { total: 0, count: 0 };

    return {
        totalDeposits: deposits.total,
        totalWithdrawals: withdrawals.total,
        totalTrades: trades.total,
        depositCount: deposits.count,
        withdrawalCount: withdrawals.count,
        tradeCount: trades.count,
    };
};

// Static: Get pending transactions for admin
TransactionSchema.statics.getPending = function () {
    return this.find({ status: 'pending' })
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 });
};

// Static: Get user transaction history
TransactionSchema.statics.getUserHistory = function (userId, limit = 50) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

export default mongoose.model('Transaction', TransactionSchema);