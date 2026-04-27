import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const TradeSchema = new mongoose.Schema(
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
        asset: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'closed', 'cancelled', 'reported'],
            default: 'active',
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        requestedAt: {
            type: Date,
            default: Date.now,
        },

        // Pricing
        entryPrice: {
            type: Number,
            min: 0,
        },
        exitPrice: {
            type: Number,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        leverage: {
            type: Number,
            default: 1,
            min: 1,
            max: 100,
        },

        // P&L Calculated fields
        profitLoss: Number,
        profitLossPercent: Number,
        resultAmount: {
            type: Number,
            default: 0,
        },
        result: {
            type: String,
            enum: ['win', 'loss', 'cancelled', 'breakeven', 'gain'],
        },

        // Timestamps
        openedAt: {
            type: Date,
            default: Date.now,
        },
        closedAt: Date,

        // Admin fields
        adminNotes: String,
        closedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },

        // Risk management
        stopLoss: Number,
        takeProfit: Number,

        // Asset info
        assetType: {
            type: String,
            enum: ['crypto', 'stock', 'forex', 'commodity'],
            default: 'crypto',
        },
        exchange: String,
    },
    {
        timestamps: true,
    }
);

TradeSchema.index({ status: 1, openedAt: -1 });
TradeSchema.index({ userId: 1, status: 1 });

// Pre-save: Calculate P&L
TradeSchema.pre('save', function (next) {
    if (this.isModified('exitPrice') && this.exitPrice && this.status === 'closed') {
        const totalEntry = this.entryPrice * this.quantity;
        const totalExit = this.exitPrice * this.quantity;

        this.profitLoss = this.type === 'buy'
            ? totalExit - totalEntry
            : totalEntry - totalExit;

        this.profitLossPercent = (this.profitLoss / totalEntry) * 100;

        if (this.profitLoss > 0) this.result = 'win';
        else if (this.profitLoss < 0) this.result = 'loss';
        else this.result = 'breakeven';
    }
    next();
});

// Method: Close trade manually (admin)
TradeSchema.methods.closeManually = async function (exitPrice, result, adminId, notes) {
    this.exitPrice = exitPrice;
    this.status = 'closed';
    this.result = result;
    this.closedAt = new Date();
    this.closedBy = adminId;
    if (notes) this.adminNotes = notes;
    return this.save();
};

export default mongoose.model('Trade', TradeSchema);