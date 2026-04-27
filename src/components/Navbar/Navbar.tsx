import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogoWithText } from "../Logo/ProfessionalLogo";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Function to check if a link is active
    const isActiveLink = (path: string) => {
        if (path === '/' && location.pathname === '/') {
            return true;
        }
        if (path !== '/' && location.pathname.startsWith(path)) {
            return true;
        }
        return false;
    };

    // Function to get link styles based on active state
    const getLinkStyles = (path: string, isMobile: boolean = false) => {
        const baseStyles = isMobile
            ? "block px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 w-full text-left"
            : "px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300";

        const activeStyles = isActiveLink(path)
            ? "text-blue-400 bg-blue-400/10 border-l-2 sm:border-l-0 sm:border-b-2 border-blue-400"
            : "text-white/80 hover:text-white hover:bg-white/5";

        return `${baseStyles} ${activeStyles}`;
    };

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Markets', path: '/markets' },
        { label: 'Platform', path: '/platform' },
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/50 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {/* Main navbar */}
                <div className="flex justify-between items-center h-14 sm:h-18">
                    {/* Logo */}
                    <motion.div
                        className="flex-shrink-0 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/')}
                    >
                        <LogoWithText size="sm" animated={false} />
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {navLinks.map((link) => (
                            <motion.a
                                key={link.path}
                                href={link.path}
                                className={getLinkStyles(link.path)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {link.label}
                            </motion.a>
                        ))}
                    </div>

                    {/* CTA Buttons Container */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Desktop Sign In Button */}
                        <motion.button
                            className="hidden sm:block px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </motion.button>

                        {/* Get Started Button */}
                        <motion.button
                            className="hidden sm:block px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                        >
                            Get Started
                        </motion.button>

                        {/* Mobile Get Started Button */}
                        <motion.button
                            className="sm:hidden px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 text-xs font-bold"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                        >
                            Start
                        </motion.button>

                        {/* Mobile menu button */}
                        <motion.button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        className="lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-3 py-3 space-y-1">
                            {navLinks.map((link) => (
                                <motion.a
                                    key={link.path}
                                    href={link.path}
                                    className={getLinkStyles(link.path, true)}
                                    onClick={() => setIsOpen(false)}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                            
                            {/* Mobile menu CTA buttons */}
                            <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
                                <motion.button
                                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        navigate('/login');
                                        setIsOpen(false);
                                    }}
                                >
                                    Sign In
                                </motion.button>
                                <motion.button
                                    className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 text-sm font-bold"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        navigate('/signup');
                                        setIsOpen(false);
                                    }}
                                >
                                    Create Account
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
};