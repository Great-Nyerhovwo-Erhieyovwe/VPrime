import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  verified: {
    type: Boolean,
    default: false,
  },
});

const VerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['identity', 'address', 'bank', 'phone', 'email', 'advanced'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    documents: [DocumentSchema],
    submittedData: {
      idNumber: String,
      idType: {
        type: String,
        enum: ['passport', 'drivers_license', 'national_id'],
      },
      address: String,
      city: String,
      country: String,
      postalCode: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reason: String, // Rejection reason
    expiresAt: Date,
    verificationLevel: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

VerificationSchema.index({ userId: 1, type: 1 });
VerificationSchema.index({ status: 1, createdAt: -1 });

// Approve verification
VerificationSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  
  // Update user's KYC status
  await mongoose.model('User').findByIdAndUpdate(this.userId, {
    kycVerified: true,
  });
  
  return this.save();
};

// Reject verification
VerificationSchema.methods.reject = async function(adminId, reason) {
  this.status = 'rejected';
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reason = reason;
  return this.save();
};

export default mongoose.model('Verification', VerificationSchema);