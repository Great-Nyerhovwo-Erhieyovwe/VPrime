import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  from: {
    type: String,
    enum: ['user', 'admin'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  internal: {
    type: Boolean,
    default: false,
  },
});

const TicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['technical', 'billing', 'account', 'trading', 'general', 'complaint'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    replies: [ReplySchema],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    closedAt: Date,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    relatedTrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trade',
    },
  },
  {
    timestamps: true,
  }
);

TicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
TicketSchema.index({ assignedTo: 1, status: 1 });

// Generate ticket ID
TicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Add reply
TicketSchema.methods.addReply = async function(message, from, userId, internal = false) {
  const reply = {
    message,
    from,
    createdAt: new Date(),
    internal,
  };
  
  if (from === 'user') reply.userId = userId;
  if (from === 'admin') reply.adminId = userId;
  
  this.replies.push(reply);
  
  if (from === 'admin' && this.status === 'open') {
    this.status = 'in-progress';
  }
  
  return this.save();
};

export default mongoose.model('Ticket', TicketSchema);