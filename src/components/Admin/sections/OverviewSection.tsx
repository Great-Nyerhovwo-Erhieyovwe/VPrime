import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiUsers, FiDollarSign, FiTrendingUp, FiCheckCircle,
    FiClock, FiStar, FiActivity
} from 'react-icons/fi';
import { SummaryCard } from '../ui/SummaryCard';
import { GlassCard } from '../ui/GlassCard';
import type { AdminStats } from '../../../types/admin';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal';
    symbol: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    formattedAmount?: string;
}

interface OverviewSectionProps {
    stats: AdminStats | null;
    onRefresh: () => void;
    loading?: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const OverviewSection = ({ stats, onRefresh, loading }: OverviewSectionProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [txLoading, setTxLoading] = useState(false);

    console.log(loading);

    useEffect(() => {
        onRefresh();
        fetchTransactions();
    }, [onRefresh]);

    const fetchTransactions = async () => {
        try {
            setTxLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const [depositsRes, withdrawalsRes] = await Promise.all([
                fetch(`${backendUrl}/api/admin/transactions/deposits`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${backendUrl}/api/admin/transactions/withdrawals`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const depositsData = await depositsRes.json();
            const withdrawalsData = await withdrawalsRes.json();

            const deposits = (depositsData.deposits || []).map((d: any) => ({
                id: d.id,
                type: 'deposit' as const,
                symbol: d.paymentMethod || d.payment_method || 'Bank Transfer',
                amount: parseFloat(String(d.amount).replace(/[^0-9.-]+/g, '')),
                date: d.requestedAt || d.createdAt,
                status:
                    d.status === 'approved'
                        ? 'completed'
                        : d.status === 'pending'
                        ? 'pending'
                        : 'failed',
                formattedAmount: d.amount
            }));

            const withdrawals = (withdrawalsData.withdrawals || []).map((w: any) => ({
                id: w.id,
                type: 'withdrawal' as const,
                symbol: w.withdrawalMethod || w.withdrawal_method || 'Bank Transfer',
                amount: parseFloat(String(w.amount).replace(/[^0-9.-]+/g, '')),
                date: w.requestedAt || w.createdAt,
                status:
                    w.status === 'approved'
                        ? 'completed'
                        : w.status === 'pending'
                        ? 'pending'
                        : 'failed',
                formattedAmount: w.amount
            }));

            const allTransactions = [...deposits, ...withdrawals]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10);

            setTransactions(allTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setTxLoading(false);
        }
    };

    const formatCurrency = (val: number) =>
        `$${(val || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;

    const statCards = [
        { icon: <FiUsers />, title: 'Total Users', value: stats?.totalUsers || 0, color: 'blue' as const },
        { icon: <FiDollarSign />, title: 'Total Deposits', value: formatCurrency(stats?.totalDeposits || 0), color: 'green' as const },
        { icon: <FiDollarSign />, title: 'Total Withdrawals', value: formatCurrency(stats?.totalWithdrawals || 0), color: 'orange' as const },
        { icon: <FiTrendingUp />, title: 'Active Trades', value: stats?.activeTrades || 0, color: 'purple' as const },
        { icon: <FiCheckCircle />, title: 'Verified Users', value: stats?.verifiedUsers || 0, color: 'cyan' as const },
        { icon: <FiActivity />, title: 'Total Volume', value: formatCurrency(stats?.totalVolume || 0), color: 'pink' as const },
    ];

    const pendingItems = [
        { label: 'Pending Deposits', value: stats?.pendingDeposits || 0, icon: <FiClock />, color: 'text-yellow-400' },
        { label: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: <FiClock />, color: 'text-orange-400' },
        { label: 'Pending Verifications', value: stats?.pendingVerifications || 0, icon: <FiCheckCircle />, color: 'text-blue-400' },
        { label: 'Pending Upgrades', value: stats?.pendingUpgrades || 0, icon: <FiStar />, color: 'text-purple-400' },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((stat) => (
                    <motion.div key={stat.title} variants={itemVariants}>
                        <SummaryCard {...stat} />
                    </motion.div>
                ))}
            </div>

            {/* Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <GlassCard className="p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-6">Pending Actions</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {pendingItems.map((item) => (
                                <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className={`text-2xl mb-2 ${item.color}`}>{item.icon}</div>
                                    <p className="text-2xl font-bold text-white">{item.value}</p>
                                    <p className="text-white/50 text-sm">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <GlassCard className="p-6 h-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            {['Review Pending Deposits', 'Approve Verifications', 'Check Support Tickets', 'Send Announcement'].map((action) => (
                                <motion.button
                                    key={action}
                                    whileHover={{ x: 4 }}
                                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 text-sm"
                                >
                                    {action}
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Transactions */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>

                    {txLoading ? (
                        <p className="text-white/50 text-center py-8">Loading...</p>
                    ) : transactions.length === 0 ? (
                        <p className="text-white/50 text-center py-8">No transactions</p>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.type}</td>
                                        <td>{tx.symbol}</td>
                                        <td>{tx.formattedAmount}</td>
                                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                                        <td>{tx.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </GlassCard>
            </motion.div>

            {/* System Status */}
            <motion.div variants={itemVariants}>
                <GlassCard className="p-6">
                    <p className="text-white">System Healthy</p>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
};