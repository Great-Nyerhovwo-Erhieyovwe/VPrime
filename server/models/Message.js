import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['direct', 'warning', 'notice', 'announcement'],
            required: true,
        },
        subject: String,
        message: {
            type: String,
            required: true,
        },
        sentVia: [{
            type: String,
            enum: ['app', 'email', 'sms'],
        }],
        read: {
            type: Boolean,
            default: false,
        },
        readAt: Date,
        isBroadcast: {
            type: Boolean,
            default: false,
        },
        broadcastFilter: {
            userType: {
                type: String,
                enum: ['all', 'verified', 'unverified', 'premium'],
            },
            minBalance: Number,
            country: [String],
        },
        category: String,
        priority: {
            type: String,
            enum: ['low', 'normal', 'high'],
            default: 'normal',
        },
        recipientCount: Number,
        deliveredCount: Number,
    },
    {
        timestamps: true,
    }
);

MessageSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);