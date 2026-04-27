import { FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane, FaEnvelope, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

export const Footer = () => (
    <footer className="bg-gradient-to-t from-slate-900 to-slate-900/95 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Main footer content */}
            <div className="py-12 sm:py-16 md:py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
                    {/* Brand section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="sm:col-span-2 lg:col-span-1"
                    >
                        <h3 className="text-lg sm:text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            VPrime Capital
                        </h3>
                        <p className="text-xs sm:text-sm text-white/70 mb-4 leading-relaxed">
                            Professional trading platform with lightning-fast execution and bank-level security.
                        </p>
                        <p className="text-xs text-white/60 mb-2">
                            © {new Date().getFullYear()} VPrime Capital. All rights reserved.
                        </p>
                        <p className="text-xs text-white/50 font-medium">
                            Risk Warning: Trading involves significant risk.
                        </p>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                    >
                        <h4 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Quick Links</h4>
                        <ul className="space-y-2.5 sm:space-y-3">
                            <li>
                                <a href="/about" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="/markets" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    Markets
                                </a>
                            </li>
                            <li>
                                <a href="/platform" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    Platform
                                </a>
                            </li>
                            <li>
                                <a href="/support" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Legal</h4>
                        <ul className="space-y-2.5 sm:space-y-3">
                            <li>
                                <a href="#" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    Cookie Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-xs sm:text-sm text-white/70 hover:text-blue-400 transition-colors duration-300">
                                    AML Policy
                                </a>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Contact & Social */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 }}
                    >
                        <h4 className="text-sm sm:text-base font-bold text-white mb-4 sm:mb-5">Contact</h4>
                        <div className="space-y-3 sm:space-y-3.5 mb-5 sm:mb-6">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                                <FaEnvelope className="text-blue-400 flex-shrink-0 text-xs sm:text-sm" />
                                <span>support@vprime.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
                                <FaPhone className="text-blue-400 flex-shrink-0 text-xs sm:text-sm" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <motion.a
                                href="#"
                                className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-blue-400 hover:border-blue-400/30 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Facebook"
                            >
                                <FaFacebookF size={16} />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-blue-400 hover:border-blue-400/30 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Twitter"
                            >
                                <FaTwitter size={16} />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-blue-400 hover:border-blue-400/30 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="LinkedIn"
                            >
                                <FaLinkedinIn size={16} />
                            </motion.a>
                            <motion.a
                                href="#"
                                className="w-10 h-10 sm:w-9 sm:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-blue-400 hover:border-blue-400/30 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="Telegram"
                            >
                                <FaTelegramPlane size={16} />
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom divider and risk warning */}
            <motion.div
                className="py-6 sm:py-8 border-t border-white/10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
            >
                <p className="text-xs sm:text-sm text-white/60 text-center leading-relaxed">
                    <span className="font-medium text-white/70">Risk Disclaimer:</span> VPrime Capital is regulated and licensed. Trading CFDs involves significant risk of loss and may not be suitable for all investors. Ensure you fully understand the risks involved.
                </p>
            </motion.div>
        </div>
    </footer>
);