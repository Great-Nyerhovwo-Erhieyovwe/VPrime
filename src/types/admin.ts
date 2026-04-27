import type { ReactNode } from "react";

export interface User {
  username: string;
  id: string;
  _id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  balanceUsd: number;
  roi: number;
  banned: boolean;
  frozen: boolean;
  emailVerified: boolean;
  kycVerified: boolean;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  lastLogin?: string;
  bankAccountHolder?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bitcoinAddress?: string;
  ethereumAddress?: string;
  otherCryptoAddresses?: string[];
  withdrawal_min_usd?: number;
  withdrawal_max_usd?: number;
}

export interface AdminProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'superadmin' | 'user';
  createdAt: string;
}

export interface Deposit {
  id: string;
  userId: string | User;
  user?: User;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  method: 'bank_transfer' | 'crypto' | 'card' | 'paypal' | 'other';
  txHash?: string;
  bankReference?: string;
  adminNotes?: string;
  reviewedBy?: string | User;
  reviewedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Withdrawal {
  id: string;
  userId: string | User;
  user?: User;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  method: 'bank_transfer' | 'crypto' | 'card' | 'paypal' | 'other';
  destinationAddress?: string;
  adminNotes?: string;
  reviewedBy?: string | User;
  reviewedAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Trade {
  id: string;
  userId: string;
  user?: User;
  symbol: string;
  type: 'buy' | 'sell';
  status: 'active' | 'closed' | 'cancelled';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  leverage: number;
  profitLoss?: number;
  profitLossPercent?: number;
  result?: 'win' | 'loss' | 'cancelled' | 'breakeven';
  openedAt: string;
  closedAt?: string;
  adminNotes?: string;
  closedBy?: string;
  currency?: string;
}

export interface UpgradeRequest {
  id?: string;
  _id?: string;
  userId: string | User;
  user?: User;
  currentLevel: string;
  targetLevel: string;
  status: 'pending' | 'approved' | 'rejected';
  price: number;
  adminNotes?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export interface Plan {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  features: string[];
  limits: {
    maxTradesPerDay: number;
    maxWithdrawalPerDay: number;
    maxDeposit: number;
    minDeposit: number;
    leverageMax: number;
  };
  active: boolean;
  popular: boolean;
  displayOrder: number;
  color: string;
  createdAt?: string;
}

export interface VerificationRequest {
  id: string;
  submittedData: any;
  type: any;
  _id: string;
  createdAt: string | number | Date;
  verificationLevel: ReactNode;
  documents: any;
  expiresAt: any;
  userId: string;
  user?: User;
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'visa';
  documentNumber: string;
  expiryDate: string;
  fullName: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalDeposits: number;
  pendingDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  activeTrades: number;
  pendingVerifications: number;
  pendingUpgrades: number;
  totalVolume: number;
}

export interface Message {
  id: string;
  _id?: string;
  senderId: string;
  recipientId?: string;
  type: 'direct' | 'warning' | 'notice' | 'announcement';
  subject?: string;
  message?: string;
  content?: string;
  status?: 'pending' | 'completed';
  read: boolean;
  createdAt: string;
}

export type AdminTab = 
  | 'overview' 
  | 'users' 
  | 'deposits' 
  | 'withdrawals' 
  | 'trades' 
  | 'upgrades' 
  | 'verifications' 
  | 'settings'
  | 'profile'
  | 'messages';