import { motion } from 'framer-motion';
import { FiMenu, FiBell, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';

interface TopBarProps {
    onMenuClick: () => void;
    title: string;
    onLogout?: () => void;
}

export const TopBar = ({ onMenuClick, title, onLogout }: TopBarProps) => {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-30 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-6 py-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                    >
                        <FiMenu size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <p className="text-white/50 text-sm">Manage your platform</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                        <FiSearch className="text-white/40" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-white placeholder-white/40 text-sm w-48"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                        <FiBell size={20} />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                            3
                        </span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <FiUser className="text-white" size={16} />
                        </div>
                        <span className="hidden sm:block text-white font-medium text-sm">Admin</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors text-red-400 hover:text-red-300"
                        title="Logout"
                    >
                        <FiLogOut size={18} />
                        <span className="hidden sm:block text-sm font-medium">Logout</span>
                    </motion.button>
                </div>
            </div>
        </motion.header>
    );
};