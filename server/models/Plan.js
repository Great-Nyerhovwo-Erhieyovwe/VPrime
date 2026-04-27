import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    priceMonthly: {
      type: Number,
      required: true,
      min: 0,
    },
    priceAnnual: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    features: [String],
    limits: {
      maxTradesPerDay: {
        type: Number,
        default: -1,
      },
      maxWithdrawalPerDay: {
        type: Number,
        default: -1,
      },
      maxDeposit: {
        type: Number,
        default: -1,
      },
      minDeposit: {
        type: Number,
        default: 0,
      },
      leverageMax: {
        type: Number,
        default: 1,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    icon: String,
  },
  {
    timestamps: true,
  }
);

PlanSchema.index({ active: 1, displayOrder: 1 });

export default mongoose.model('Plan', PlanSchema);