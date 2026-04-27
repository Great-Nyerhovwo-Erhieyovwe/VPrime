import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpCircle, FiCheck, FiX } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { User, Withdrawal } from '../../../types/admin';

interface WithdrawalsSectionProps {
    withdrawals: Withdrawal[];
    user: User[];
    onRefresh: () => void;
    onApprove: (id: string, notes?: string) => Promise<boolean>;
    onReject: (id: string, notes?: string) => Promise<boolean>;
    loading: boolean;
}

export const WithdrawalsSection = ({ withdrawals, onRefresh, onApprove, onReject, loading }: WithdrawalsSectionProps) => {
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        onRefresh();
    }, []);

    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
    const displayWithdrawals = pendingWithdrawals.length > 0 ? pendingWithdrawals : withdrawals;
    const showPendingOnly = pendingWithdrawals.length > 0;

    const handleApprove = async () => {
        if (!selectedWithdrawal) return;
        setIsProcessing(true);
        const success = await onApprove(selectedWithdrawal.id, adminNotes);
        setIsProcessing(false);
        if (success) {
            setSelectedWithdrawal(null);
            setAdminNotes('');
            onRefresh();
        } else {
            alert('Unable to approve withdrawal. Check the console for details.');
        }
    };

    const handleReject = async () => {
        if (!selectedWithdrawal) return;
        setIsProcessing(true);
        const success = await onReject(selectedWithdrawal.id, adminNotes);
        setIsProcessing(false);
        if (success) {
            setSelectedWithdrawal(null);
            setAdminNotes('');
            onRefresh();
        } else {
            alert('Unable to reject withdrawal. Check the console for details.');
        }
    };

    const getUserDisplay = (user: any) => {
        if (!user) return 'Unknown';
        if (typeof user === 'string') return user;
        return user.email || `${user.firstName} ${user.lastName}`.trim() || 'Unknown';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                            <FiArrowUpCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Withdrawal Requests</h3>
                            <p className="text-white/50 text-sm">{pendingWithdrawals.length} pending</p>
                        </div>
                    </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/50">Loading...</div>
                    ) : displayWithdrawals.length === 0 ? (
                        <div className="p-8 text-center text-white/50">No withdrawals available</div>
                    ) : (
                        <>
                            {!showPendingOnly && withdrawals.length > 0 && (
                                <div className="p-4 text-sm text-white/50 border-b border-white/5">
                                    Showing all withdrawals because there are no pending requests.
                                </div>
                            )}
                            <div className="divide-y divide-white/5">
                                {displayWithdrawals.map((withdrawal) => (
                                <motion.div
                                    key={withdrawal.id}
                                    onClick={() => {
                                        setSelectedWithdrawal(withdrawal);
                                        setAdminNotes(withdrawal.adminNotes || '');
                                    }}
                                    className={`
                    p-4 cursor-pointer transition-all
                    ${selectedWithdrawal?.id === withdrawal.id
                                            ? 'bg-orange-500/10 border-l-4 border-orange-500'
                                            : 'hover:bg-white/5 border-l-4 border-transparent'
                                        }
                  `}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white text-lg">{withdrawal.amount.toLocaleString()}</span>
                                                <span className="text-white/60 text-sm uppercase">{withdrawal.currency}</span>
                                            </div>
                                            <p className="text-white/50 text-sm">User: {getUserDisplay(withdrawal.userId)}</p>
                                            <p className="text-white/40 text-xs mt-1">Method: {withdrawal.method}</p>
                                        </div>
                                        <StatusBadge status={withdrawal.status} />
                                    </div>
                                </motion.div>
                            ))}
                            </div>
                        </>
                    )}
                </div>
            </GlassCard>

            <div className="lg:sticky lg:top-24 h-fit">
                {selectedWithdrawal ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-6">Review Withdrawal</h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Amount</span>
                                        <span className="text-white font-medium">{selectedWithdrawal.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Method</span>
                                        <span className="text-white font-medium capitalize">{selectedWithdrawal.method}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">User</span>
                                        <span className="text-white font-medium text-xs">{getUserDisplay(selectedWithdrawal.userId)}</span>
                                    </div>
                                    {selectedWithdrawal.destinationAddress && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Destination</span>
                                            <span className="text-white font-medium text-xs truncate max-w-[150px]">{selectedWithdrawal.destinationAddress}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Admin Notes</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes..."
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-orange-500/50 focus:outline-none"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleApprove}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                                    >
                                        <FiCheck size={16} />
                                        {isProcessing ? 'Processing...' : 'Approve'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleReject}
                                        disabled={isProcessing}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                                    >
                                        <FiX size={16} />
                                        Reject
                                    </motion.button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                ) : (
                    <GlassCard className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <FiArrowUpCircle className="text-white/30" size={32} />
                        </div>
                        <p className="text-white/50">Select a withdrawal to review</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};