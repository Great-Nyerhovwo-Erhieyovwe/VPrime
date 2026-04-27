import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowDownCircle, FiCheck, FiX } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { Deposit } from '../../../types/admin';

interface DepositsSectionProps {
    deposits: Deposit[];
    onRefresh: () => void;
    onApprove: (id: string, notes?: string) => Promise<boolean>;
    onReject: (id: string, notes?: string) => Promise<boolean>;
    loading: boolean;
}

export const DepositsSection = ({ deposits, onRefresh, onApprove, onReject, loading }: DepositsSectionProps) => {
    const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        onRefresh();
    }, []);

    const pendingDeposits = deposits.filter(d => d.status === 'pending');
    const displayDeposits = pendingDeposits.length > 0 ? pendingDeposits : deposits;
    const showPendingOnly = pendingDeposits.length > 0;

    const handleApprove = async () => {
        if (!selectedDeposit) return;
        setIsProcessing(true);
        const success = await onApprove(selectedDeposit.id, adminNotes);
        setIsProcessing(false);
        if (success) {
            setSelectedDeposit(null);
            setAdminNotes('');
            onRefresh();
        }
    };

    const handleReject = async () => {
        if (!selectedDeposit) return;
        setIsProcessing(true);
        const success = await onReject(selectedDeposit.id, adminNotes);
        setIsProcessing(false);
        if (success) {
            setSelectedDeposit(null);
            setAdminNotes('');
            onRefresh();
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
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                            <FiArrowDownCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Deposit Requests</h3>
                            <p className="text-white/50 text-sm">{pendingDeposits.length} pending</p>
                        </div>
                    </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/50">Loading...</div>
                    ) : displayDeposits.length === 0 ? (
                        <div className="p-8 text-center text-white/50">No deposits available</div>
                    ) : (
                        <>
                            {!showPendingOnly && deposits.length > 0 && (
                                <div className="p-4 text-sm text-white/50 border-b border-white/5">
                                    Showing all deposits because there are no pending requests.
                                </div>
                            )}
                            <div className="divide-y divide-white/5">
                                {displayDeposits.map((deposit) => (
                                <motion.div
                                    key={deposit.id}
                                    onClick={() => {
                                        setSelectedDeposit(deposit);
                                        setAdminNotes(deposit.adminNotes || '');
                                    }}
                                    className={`
                    p-4 cursor-pointer transition-all
                    ${selectedDeposit?.id === deposit.id
                                            ? 'bg-emerald-500/10 border-l-4 border-emerald-500'
                                            : 'hover:bg-white/5 border-l-4 border-transparent'
                                        }
                  `}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-white text-lg">{deposit.amount.toLocaleString()}</span>
                                                <span className="text-white/60 text-sm uppercase">{deposit.currency}</span>
                                            </div>
                                            <p className="text-white/50 text-sm">User: {getUserDisplay(deposit.userId)}</p>
                                            <p className="text-white/40 text-xs mt-1">Method: {deposit.method}</p>
                                        </div>
                                        <StatusBadge status={deposit.status} />
                                    </div>
                                </motion.div>
                            ))}
                            </div>
                        </>
                    )}
                </div>
            </GlassCard>

            <div className="lg:sticky lg:top-24 h-fit">
                {selectedDeposit ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <GlassCard className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-6">Review Deposit</h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Amount</span>
                                        <span className="text-white font-medium">{selectedDeposit.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Method</span>
                                        <span className="text-white font-medium capitalize">{selectedDeposit.method}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">User</span>
                                        <span className="text-white font-medium text-xs">{getUserDisplay(selectedDeposit.userId)}</span>
                                    </div>
                                    {selectedDeposit.txHash && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">TX Hash</span>
                                            <span className="text-white font-medium text-xs truncate max-w-[150px]">{selectedDeposit.txHash}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Admin Notes</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes..."
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-emerald-500/50 focus:outline-none"
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
                            <FiArrowDownCircle className="text-white/30" size={32} />
                        </div>
                        <p className="text-white/50">Select a deposit to review</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
};