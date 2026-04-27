import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const AdminLogSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            unique: true,
            index: true,
            default: () => randomUUID(),
        },
        adminId: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        resourceType: {
            type: String,
            enum: ['user', 'transaction', 'trade', 'verification', 'ticket', 'plan', 'settings'],
            required: true,
        },
        resourceId: String,
        details: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ipAddress: String,
        userAgent: String,
    },
    {
        timestamps: true,
        expireAfterSeconds: 2592000, // 30 days TTL
    }
);

export default mongoose.model('AdminLog', AdminLogSchema);