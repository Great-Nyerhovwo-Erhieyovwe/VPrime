import { motion } from 'framer-motion';
import {
    FiPieChart, FiUsers, FiUser, FiArrowDownCircle, FiArrowUpCircle,
    FiTrendingUp, FiStar, FiCheckCircle, FiMessageSquare, FiSettings
} from 'react-icons/fi';
import type { AdminTab } from '../../../types/admin';

console.log(FiMessageSquare)

interface SidebarProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <FiPieChart /> },
    { id: 'users', label: 'Users', icon: <FiUsers /> },
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'deposits', label: 'Deposits', icon: <FiArrowDownCircle />, badge: 'pending' },
    { id: 'withdrawals', label: 'Withdrawals', icon: <FiArrowUpCircle />, badge: 'pending' },
    { id: 'trades', label: 'Trades', icon: <FiTrendingUp /> },
    { id: 'upgrades', label: 'Upgrades', icon: <FiStar />, badge: 'pending' },
    { id: 'verifications', label: 'Verifications', icon: <FiCheckCircle />, badge: 'pending' },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
    // { id: 'messages', label: 'Messages', icon: <FiMessageSquare /> },
];

export const Sidebar = ({ activeTab, onTabChange, isMobileOpen, onMobileClose }: SidebarProps) => {
    return (
        <>
            {isMobileOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            <motion.aside
                className={`
          fixed lg:sticky top-0 left-0 z-50
          w-72 h-screen
          bg-slate-900/80 backdrop-blur-2xl
          border-r border-white/10
          flex flex-col
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 lg:duration-0
        `}
            >
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">Admin Panel</h1>
                            <p className="text-white/40 text-xs">Management System</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => {
                                onTabChange(tab.id);
                                onMobileClose();
                            }}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 relative
                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }
              `}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className={`text-xl ${activeTab === tab.id ? 'text-blue-400' : ''}`}>
                                {tab.icon}
                            </span>
                            <span className="font-medium">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"
                                />
                            )}
                        </motion.button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white/80 text-sm font-medium">System Online</span>
                        </div>
                        <p className="text-white/40 text-xs">All services operational</p>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};