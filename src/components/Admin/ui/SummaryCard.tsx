import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SummaryCardProps {
    icon: ReactNode;
    title: string;
    value: string | number;
    trend?: { value: number; isPositive: boolean };
    color?: 'blue' | 'purple' | 'green' | 'orange' | 'cyan' | 'pink' | 'red';
}

const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/30 text-pink-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
};

export const SummaryCard = ({ icon, title, value, trend, color = 'blue' }: SummaryCardProps) => {
    return (
        <motion.div
            className={`
        relative p-6 rounded-2xl
        bg-gradient-to-br ${colorClasses[color]}
        border backdrop-blur-xl
        overflow-hidden
      `}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                        <div className="text-2xl">{icon}</div>
                    </div>
                    {trend && (
                        <span className={`text-xs font-medium bg-white/10 px-2 py-1 rounded-full ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-white/60 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
    );
};