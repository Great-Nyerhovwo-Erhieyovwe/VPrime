import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const WithdrawSchema = new mongoose.Schema(
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
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        withdrawalMethod: {
            type: String,
            required: true,
        },
        destinationAddress: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
            index: true,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },
        approvedAt: Date,
        processedAt: Date,
        adminNotes: String,

        // Additional fields for payment details
        txHash: String, // For crypto transactions
        bankReference: String,
        cardLast4: String,

        // Admin review fields
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: Date,
        completedAt: Date,

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
WithdrawSchema.index({ status: 1, createdAt: -1 });
WithdrawSchema.index({ userId: 1, createdAt: -1 });
WithdrawSchema.index({ withdrawalMethod: 1, status: 1 });

// Static: Get withdrawal summary for admin dashboard
WithdrawSchema.statics.getSummary = async function () {
    const result = await this.aggregate([
        { $match: { status: 'completed' } },
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);

    return {
        totalWithdrawals: result.length ? result[0].total : 0,
        withdrawalCount: result.length ? result[0].count : 0,
    };
};

// Static: Get pending withdrawals for admin
WithdrawSchema.statics.getPending = function () {
    return this.find({ status: 'pending' })
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 });
};

// Method: Approve withdrawal (admin only)
WithdrawSchema.methods.approve = async function (adminId, notes) {
    this.status = 'completed';
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    this.approvedAt = new Date();
    this.processedAt = new Date();
    this.completedAt = new Date();
    if (notes) this.adminNotes = notes;
    return this.save();
};

// Method: Reject withdrawal (admin only)
WithdrawSchema.methods.reject = async function (adminId, notes) {
    this.status = 'failed';
    this.reviewedBy = adminId;
    this.reviewedAt = new Date();
    if (notes) this.adminNotes = notes;
    return this.save();
};

export default mongoose.model('Withdraw', WithdrawSchema);