import { FaLock, FaShieldAlt, FaUserCheck, FaHeadset, FaCreditCard, FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";

const items = [
    { icon: <FaLock size={24} />, label: "SSL Security", desc: "Bank-level encryption" },
    { icon: <FaShieldAlt size={24} />, label: "Encrypted", desc: "All trades secured" },
    { icon: <FaUserCheck size={24} />, label: "KYC Verified", desc: "Identity secured" },
    { icon: <FaHeadset size={24} />, label: "24/7 Support", desc: "Always available" },
    { icon: <FaCreditCard size={24} />, label: "Multiple Methods", desc: "Fiat & crypto" },
    { icon: <FaGlobe size={24} />, label: "Global Access", desc: "Trade anywhere" },
];

export const TrustStrip = () => (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5" />

        <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            {/* Header */}
            <motion.div
                className="text-center mb-12 sm:mb-16 md:mb-20"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                    Trusted by
                    <span className="inline-block ml-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Traders Worldwide
                    </span>
                </h2>
                <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
                    Bank-level security and professional trading tools trusted by thousands
                </p>
            </motion.div>

            {/* Trust items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        className="group relative p-5 sm:p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-blue-400/30 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08, duration: 0.5 }}
                        whileHover={{ y: -4, borderColor: "rgba(96, 165, 250, 0.3)" }}
                    >
                        {/* Hover background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />

                        {/* Icon */}
                        <motion.div
                            className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300 mb-4 group-hover:scale-110 transition-transform duration-300"
                            whileHover={{ scale: 1.15 }}
                        >
                            {item.icon}
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                            {item.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/70">
                            {item.desc}
                        </p>

                        {/* Border accent on hover */}
                        <motion.div
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full w-0 transition-all duration-300 rounded-full"
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    </section>
);