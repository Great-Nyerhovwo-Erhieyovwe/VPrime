import { motion, useMotionValue, animate } from "framer-motion";
import { FaUsers, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";
import { heroCounters } from "../../utils/mockData";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Counter = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const count = useMotionValue(0);

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 5.5,
            ease: "easeOut",
            delay: 0.3,
            onUpdate: (latest) => setDisplayValue(Math.round(latest))
        });

        return controls.stop;
    }, [count, value]);

    return (
        <motion.div
            className="text-center flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
        >
            <motion.div
                className="text-2xl sm:text-3xl md:text-4xl mb-2 text-blue-400 flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
            >
                {icon}
            </motion.div>
            <motion.div
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            >
                {value >= 1000000 ? `${(displayValue / 1000000).toFixed(1)}M` :
                 value >= 1000 ? `${(displayValue / 1000).toFixed(0)}K` :
                 displayValue.toLocaleString()}
            </motion.div>
            <div className="text-xs sm:text-sm text-white/70">{label}</div>
        </motion.div>
    );
};

export const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative w-full min-h-screen pt-20 pb-16 sm:pb-20 md:pb-24 flex items-center justify-center overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" />
            
            {/* Animated gradient orbs */}
            <motion.div
                className="absolute top-10 sm:top-20 left-5 sm:left-10 w-24 sm:w-40 h-24 sm:h-40 bg-blue-500/20 rounded-full blur-3xl"
                animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
                className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-28 sm:w-48 h-28 sm:h-48 bg-cyan-500/15 rounded-full blur-3xl"
                animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
            />
            
            {/* Border decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 pointer-events-none" />

            {/* Main content */}
            <motion.div
                className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-6 sm:mb-8 md:mb-10 text-center"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-tight md:leading-snug mb-4 sm:mb-6">
                        <span className="text-white">Master Trading with</span>
                        <br className="hidden sm:block" />
                        <span className="inline-block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">VPrime</span>
                    </h1>
                    
                    <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed px-2">
                        Professional trading platform with lightning-fast execution, advanced tools, and bank-level security. Start with zero fees and trade with confidence.
                    </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    className="mb-12 sm:mb-16 md:mb-20 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <motion.button
                        className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/login")}
                    >
                        Start Trading Now
                    </motion.button>

                    <motion.button
                        className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg border border-white/30 text-white font-bold text-sm sm:text-base hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/signup')}
                    >
                        Create Free Account
                    </motion.button>
                </motion.div>

                {/* Feature highlights */}
                <motion.div
                    className="mb-16 sm:mb-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    {[
                        { icon: "⚡", title: "Fast Execution", desc: "Millisecond trade execution" },
                        { icon: "🔒", title: "Secure Trading", desc: "Military-grade encryption" },
                        { icon: "📊", title: "Pro Tools", desc: "Advanced analytics & charts" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className="bg-white/5 rounded-lg p-4 sm:p-5 border border-white/10 hover:border-blue-400/30 transition-all duration-300"
                            whileHover={{ scale: 1.02, borderColor: "rgba(96, 165, 250, 0.3)" }}
                        >
                            <div className="text-2xl mb-2">{item.icon}</div>
                            <h3 className="text-sm sm:text-base font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-white/70">{item.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Stats section */}
                <motion.div
                    className="bg-gradient-to-r from-blue-500/10 to-cyan-400/10 rounded-xl border border-white/10 p-8 sm:p-12 md:p-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <div className="grid grid-cols-3 gap-4 sm:gap-8">
                        <Counter label="Active Users" value={heroCounters.users} icon={<FaUsers />} />
                        <Counter label="Executed Trades" value={heroCounters.trades} icon={<FaExchangeAlt />} />
                        <Counter label="Total Payouts" value={heroCounters.payouts} icon={<FaMoneyBillWave />} />
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};