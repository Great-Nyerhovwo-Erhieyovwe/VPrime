import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTrendingUp,
    FiCheck,
    FiX,
    FiDollarSign,
    FiPercent,
    FiClock,
    FiActivity,
    FiBarChart2,
    FiArrowUpRight,
    FiArrowDownRight,
    FiFilter,
    FiSearch,
    FiCalendar
} from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { Trade, User } from '../../../types/admin';

console.log(FiX, FiClock, FiFilter)

interface TradesSectionProps {
    trades: Trade[];
    users: User[];
    onUpdate: (id: string, updates: Partial<Trade>) => void;
    isLoading?: boolean;
}

type TradeResult = 'win' | 'loss' | 'breakeven' | 'cancelled';

interface TradeStats {
    totalActive: number;
    totalClosed: number;
    totalVolume: number;
    avgProfit: number;
    winRate: number;
}

export const TradesSection = ({ trades, users, onUpdate, isLoading }: TradesSectionProps) => {
    // State
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [exitPrice, setExitPrice] = useState<string>('');
    const [result, setResult] = useState<TradeResult>('win');
    const [adminNotes, setAdminNotes] = useState<string>('');
    const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'profit' | 'volume'>('newest');

    // Get user by ID helper
    const getUser = (userId: string | number): User | undefined => {
        return users?.find(u => String(u.id) === String(userId));
    };

    if (!users) {
        return null;
    }

    // Filter and sort trades
    const filteredTrades = useMemo(() => {
        let filtered = trades.filter(trade => {
            const user = getUser(trade.userId);
            const matchesFilter = filter === 'all' || trade.status === filter;
            const matchesSearch = !searchQuery ||
                trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            return matchesFilter && matchesSearch;
        });

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
                case 'oldest':
                    return new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime();
                case 'profit':
                    return (b.profitLoss || 0) - (a.profitLoss || 0);
                case 'volume':
                    return (b.quantity * b.entryPrice) - (a.quantity * a.entryPrice);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [trades, filter, searchQuery, sortBy, users]);

    // Calculate stats
    const stats: TradeStats = useMemo(() => {
        const active = trades.filter(t => t.status === 'active');
        const closed = trades.filter(t => t.status === 'closed');
        const winners = closed.filter(t => t.result === 'win');

        const totalVolume = trades.reduce((sum, t) => sum + (t.quantity * t.entryPrice), 0);
        const avgProfit = closed.length > 0
            ? closed.reduce((sum, t) => sum + (t.profitLoss || 0), 0) / closed.length
            : 0;

        return {
            totalActive: active.length,
            totalClosed: closed.length,
            totalVolume,
            avgProfit,
            winRate: closed.length > 0 ? (winners.length / closed.length) * 100 : 0,
        };
    }, [trades]);

    // Handlers
    const handleSelectTrade = (trade: Trade) => {
        setSelectedTrade(trade);
        setExitPrice(trade.exitPrice?.toString() || '');
        setResult(trade.result || 'win');
        setAdminNotes('');
    };

    const handleCloseTrade = () => {
        if (!selectedTrade || !exitPrice) return;

        const exitPriceNum = parseFloat(exitPrice);
        if (isNaN(exitPriceNum) || exitPriceNum <= 0) {
            alert('Please enter a valid exit price');
            return;
        }

        onUpdate(selectedTrade.id || '', {
            status: 'closed',
            result,
            exitPrice: exitPriceNum,
            adminNotes,
            closedAt: new Date().toISOString(),
        });

        // Reset
        setSelectedTrade(null);
        setExitPrice('');
        setAdminNotes('');
    };

    const calculatePnL = (trade: Trade, exit: number) => {
        const entryTotal = trade.entryPrice * trade.quantity;
        const exitTotal = exit * trade.quantity;
        const isBuy = trade.type === 'buy';

        const pnl = isBuy ? exitTotal - entryTotal : entryTotal - exitTotal;
        const pnlPercent = (pnl / entryTotal) * 100;

        return { pnl, pnlPercent };
    };

    // Render helpers
    const getTradeIcon = (type: string) => {
        return type === 'buy'
            ? <FiArrowUpRight className="text-emerald-400" />
            : <FiArrowDownRight className="text-rose-400" />;
    };

    const parseCurrencyValue = (value: any, fallback: number = 0) => {
        if (value === null || value === undefined || value === '') return fallback;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const normalized = parseFloat(String(value).replace(/[^0-9.-]+/g, ''));
        return Number.isFinite(normalized) ? normalized : fallback;
    };

    const formatCurrency = (value: any, currencyCode: string = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(parseCurrencyValue(value, 0));
    };


    // Helper to safely get user email or id string

    const getUserDisplay = (userId: string | number): string => {
        const user = getUser(userId);
        if (user && user.email) {
            return user.email;
        }

        // Safely handle the ID String
        const idStr = String(userId);
        return idStr.length > 8 ? idStr.substring(0, 8) + '...' : idStr;
    };

    // Helpers to safely get trade ID substring
    const getTradeIdDisplay = (id: string | undefined): string => {
        if (!id || typeof id !== 'string')
            return 'Unknown';
        return id.length > 8 ? id.substring(0, 8) : id;
    };


    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Active Trades',
                        value: stats.totalActive,
                        icon: <FiActivity />,
                        color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400'
                    },
                    {
                        label: 'Total Volume',
                        value: formatCurrency(stats.totalVolume),
                        icon: <FiBarChart2 />,
                        color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400'
                    },
                    {
                        label: 'Win Rate',
                        value: `${stats.winRate.toFixed(1)}%`,
                        icon: <FiPercent />,
                        color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400'
                    },
                    {
                        label: 'Avg Profit',
                        value: formatCurrency(stats.avgProfit),
                        icon: <FiDollarSign />,
                        color: stats.avgProfit >= 0
                            ? 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400'
                            : 'from-rose-500/20 to-rose-600/5 border-rose-500/30 text-rose-400'
                    },
                ].map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`
              relative p-4 rounded-xl
              bg-gradient-to-br ${stat.color}
              border backdrop-blur-xl
            `}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-white/10">
                                <div className="text-xl">{stat.icon}</div>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trades List */}
                <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by symbol or user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                >
                                    <option value="active" className="bg-slate-900">Active Only</option>
                                    <option value="closed" className="bg-slate-900">Closed Only</option>
                                    <option value="all" className="bg-slate-900">All Trades</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                >
                                    <option value="newest" className="bg-slate-900">Newest First</option>
                                    <option value="oldest" className="bg-slate-900">Oldest First</option>
                                    <option value="profit" className="bg-slate-900">By Profit</option>
                                    <option value="volume" className="bg-slate-900">By Volume</option>
                                </select>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2">
                            {(['active', 'closed', 'all'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
                    ${filter === f
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'}
                  `}
                                >
                                    {f} ({f === 'all' ? trades.length : trades.filter(t => t.status === f).length})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trades Table */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredTrades.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                    <FiTrendingUp className="text-white/30" size={32} />
                                </div>
                                <p className="text-white/50">No trades found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredTrades.map((trade) => {
                                    // const user = getUser(trade.userId);
                                    const positionValue = trade.quantity * trade.entryPrice;
                                    const isActive = trade.status === 'active';
                                    // const userDisplay = getUserDisplayString;
                                    const userDisplay = getUserDisplay(trade.userId);
                                    // Ensure tradeId is string
                                    const tradeIdStr = trade.id || '';

                                    return (
                                        <motion.div
                                            key={trade.id}
                                            onClick={() => handleSelectTrade(trade)}
                                            className={`
                        p-4 cursor-pointer transition-all
                        ${selectedTrade?.id === trade.id
                                                    ? 'bg-purple-500/10 border-l-4 border-purple-500'
                                                    : 'hover:bg-white/5 border-l-4 border-transparent'}
                      `}
                                            whileHover={{ x: 4 }}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Left: Symbol & Type */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            ${trade.type === 'buy' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}
                          `}>
                                                        {getTradeIcon(trade.type)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-white">{trade.symbol}</span>
                                                            <span className={`
                                text-xs px-2 py-0.5 rounded-full font-medium
                                ${trade.type === 'buy'
                                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                                    : 'bg-rose-500/20 text-rose-300'}
                              `}>
                                                                {trade.type.toUpperCase()}
                                                            </span>
                                                        </div>
            
                                                        <p className="text-white/50 text-sm truncate">
                                                            {/* {user?.email || trade.userId.substring(0, 8)}... */}
                                                            {userDisplay}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Center: Position Details */}
                                                <div className="hidden sm:block text-center">
                                                    <p className="text-white/60 text-xs">Qty: {trade.quantity}</p>
                                                    <p className="text-white font-medium">@{trade.entryPrice}</p>
                                                    {trade.leverage > 1 && (
                                                        <p className="text-purple-400 text-xs">{trade.leverage}x</p>
                                                    )}
                                                </div>

                                                {/* Right: Status & P&L */}
                                                <div className="text-right">
                                                    <StatusBadge status={trade.status} variant="small" />
                                                    {!isActive && trade.profitLoss !== undefined && (
                                                        <p className={`
                              text-sm font-medium mt-1
                              ${trade.profitLoss > 0 ? 'text-emerald-400' : trade.profitLoss < 0 ? 'text-rose-400' : 'text-white/60'}
                            `}>
                                                            {trade.profitLoss > 0 ? '+' : ''}{formatCurrency(trade.profitLoss, trade.currency || 'USD')}
                                                            <span className="text-xs ml-1">
                                                                ({trade.profitLossPercent?.toFixed(2)}%)
                                                            </span>
                                                        </p>
                                                    )}
                                                    <p className="text-white/40 text-xs mt-1">
                                                        <FiCalendar className="inline mr-1" size={12} />
                                                        {new Date(trade.openedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress bar for active trades */}
                                            {isActive && (
                                                <div className="mt-3">
                                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-purple-500"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min((positionValue / stats.totalVolume) * 100 * 10, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-white/40 mt-1">
                                                        <span>Value: {formatCurrency(positionValue, trade.currency || 'USD')}</span>
                                                        {/* <span>ID: {trade._id?.substring(0, 8)}...</span> */}
                                                        <span>ID: {getTradeIdDisplay(tradeIdStr)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Trade Detail / Close Panel */}
                <div className="lg:sticky lg:top-24 h-fit">
                    <AnimatePresence mode="wait">
                        {selectedTrade ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <GlassCard className="p-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                {selectedTrade.symbol}
                                                <span className={`
                          text-xs px-2 py-0.5 rounded-full
                          ${selectedTrade.type === 'buy'
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : 'bg-rose-500/20 text-rose-300'}
                        `}>
                                                    {selectedTrade.type.toUpperCase()}
                                                </span>
                                            </h3>
                                            <p className="text-white/50 text-sm">
                                                {/* {getUser(selectedTrade.userId)?.email || selectedTrade.userId} */}
                                                {getUserDisplay(selectedTrade.userId)}
                                            </p>
                                        </div>
                                        <StatusBadge status={selectedTrade.status} />
                                    </div>

                                    {/* Trade Info */}
                                    <div className="space-y-4 mb-6">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-white/50 text-xs mb-1">Entry Price</p>
                                                    <p className="text-white font-medium">{formatCurrency(selectedTrade.entryPrice, selectedTrade.currency || 'USD')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/50 text-xs mb-1">Quantity</p>
                                                    <p className="text-white font-medium">{selectedTrade.quantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/50 text-xs mb-1">Position Value</p>
                                                    <p className="text-white font-medium">
                                                        {formatCurrency(selectedTrade.entryPrice * selectedTrade.quantity, selectedTrade.currency || 'USD')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-white/50 text-xs mb-1">Leverage</p>
                                                    <p className="text-purple-400 font-medium">{selectedTrade.leverage}x</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* If active, show close form */}
                                        {selectedTrade.status === 'active' && (
                                            <div className="space-y-4">
                                                <div className="border-t border-white/10 pt-4">
                                                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                        <FiCheck size={16} />
                                                        Close Trade
                                                    </h4>

                                                    {/* Exit Price */}
                                                    <div className="mb-4">
                                                        <label className="block text-white/60 text-sm mb-2">
                                                            Exit Price
                                                        </label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                                            <input
                                                                type="number"
                                                                value={exitPrice}
                                                                onChange={(e) => setExitPrice(e.target.value)}
                                                                placeholder="0.00"
                                                                step="0.01"
                                                                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                                                            />
                                                        </div>

                                                        {/* P&L Preview */}
                                                        {exitPrice && !isNaN(parseFloat(exitPrice)) && (
                                                            <div className="mt-2 p-3 rounded-lg bg-white/5">
                                                                {(() => {
                                                                    const { pnl, pnlPercent } = calculatePnL(selectedTrade, parseFloat(exitPrice));
                                                                    return (
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-white/60 text-sm">Estimated P&L:</span>
                                                                            <span className={`
                                        font-bold
                                        ${pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-rose-400' : 'text-white/60'}
                                      `}>
                                                                                {pnl > 0 ? '+' : ''}{formatCurrency(pnl, selectedTrade.currency || 'USD')} ({pnlPercent.toFixed(2)}%)
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Result Selection */}
                                                    <div className="mb-4">
                                                        <label className="block text-white/60 text-sm mb-2">
                                                            Trade Result
                                                        </label>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {(['win', 'loss', 'breakeven', 'cancelled'] as TradeResult[]).map((r) => (
                                                                <button
                                                                    key={r}
                                                                    onClick={() => setResult(r)}
                                                                    className={`
                                    px-2 py-2 rounded-lg text-xs font-medium capitalize transition-all
                                    ${result === r
                                                                            ? r === 'win' ? 'bg-emerald-600 text-white'
                                                                                : r === 'loss' ? 'bg-rose-600 text-white'
                                                                                    : r === 'breakeven' ? 'bg-blue-600 text-white'
                                                                                        : 'bg-gray-600 text-white'
                                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'}
                                  `}
                                                                >
                                                                    {r}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Admin Notes */}
                                                    <div className="mb-4">
                                                        <label className="block text-white/60 text-sm mb-2">
                                                            Admin Notes
                                                        </label>
                                                        <textarea
                                                            value={adminNotes}
                                                            onChange={(e) => setAdminNotes(e.target.value)}
                                                            placeholder="Reason for manual closure..."
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
                                                            rows={2}
                                                        />
                                                    </div>

                                                    {/* Close Button */}
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={handleCloseTrade}
                                                        disabled={!exitPrice || isLoading}
                                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/40 rounded-lg text-white font-medium transition-colors"
                                                    >
                                                        <FiCheck size={18} />
                                                        {isLoading ? 'Closing...' : 'Close Trade'}
                                                    </motion.button>
                                                </div>
                                            </div>
                                        )}

                                        {/* If closed, show result */}
                                        {selectedTrade.status === 'closed' && (
                                            <div className="border-t border-white/10 pt-4">
                                                <h4 className="text-white font-medium mb-3">Trade Result</h4>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between">
                                                            <span className="text-white/60">Exit Price</span>
                                                            <span className="text-white font-medium">
                                                                {formatCurrency(selectedTrade.exitPrice || 0, selectedTrade.currency || 'USD')}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-white/60">Result</span>
                                                            <span className={`
                                px-2 py-1 rounded text-xs font-medium capitalize
                                ${selectedTrade.result === 'win' ? 'bg-emerald-500/20 text-emerald-300'
                                                                    : selectedTrade.result === 'loss' ? 'bg-rose-500/20 text-rose-300'
                                                                        : 'bg-gray-500/20 text-gray-300'}
                              `}>
                                                                {selectedTrade.result}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-white/60">P&L</span>
                                                            <span className={`
                                font-bold
                                ${(selectedTrade.profitLoss || 0) > 0 ? 'text-emerald-400'
                                                                    : (selectedTrade.profitLoss || 0) < 0 ? 'text-rose-400'
                                                                        : 'text-white/60'}
                              `}>
                                                                {selectedTrade.profitLoss && selectedTrade.profitLoss > 0 ? '+' : ''}
                                                                {formatCurrency(selectedTrade.profitLoss || 0, selectedTrade.currency || 'USD')}
                                                            </span>
                                                        </div>
                                                        {selectedTrade.adminNotes && (
                                                            <div className="pt-2 border-t border-white/10">
                                                                <p className="text-white/50 text-xs mb-1">Admin Notes:</p>
                                                                <p className="text-white/80 text-sm">{selectedTrade.adminNotes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <GlassCard className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                        <FiTrendingUp className="text-white/30" size={32} />
                                    </div>
                                    <p className="text-white/50 mb-2">Select a trade to view details</p>
                                    <p className="text-white/30 text-sm">
                                        You can close active trades or view closed trade results
                                    </p>
                                </GlassCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};