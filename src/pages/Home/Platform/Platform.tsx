import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import { DashboardMock } from "../../../components/PlatformPreview/DashboardMock";
import { FaShieldAlt, FaRocket, FaUsers, FaGlobe, FaBolt, FaChartLine, FaMobileAlt, FaHeadset, FaCheckCircle, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// const navigate = useNavigate();

const Platform = () => {

    const navigate = useNavigate();

    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const platformFeatures = [
        {
            icon: <FaBolt className="text-3xl text-accent" />,
            title: "Lightning Fast Execution",
            description: "Sub-millisecond trade execution with direct market access and advanced order routing technology."
        },
        {
            icon: <FaChartLine className="text-3xl text-accent" />,
            title: "Advanced Analytics",
            description: "Professional-grade charting tools, technical indicators, and market analysis powered by AI."
        },
        {
            icon: <FaMobileAlt className="text-3xl text-accent" />,
            title: "Mobile Trading",
            description: "Full-featured mobile app with real-time notifications and seamless cross-device synchronization."
        },
        {
            icon: <FaShieldAlt className="text-3xl text-accent" />,
            title: "Bank-Level Security",
            description: "256-bit SSL encryption, two-factor authentication, and segregated client funds protection."
        },
        {
            icon: <FaGlobe className="text-3xl text-accent" />,
            title: "Global Market Access",
            description: "Trade 50+ asset classes across forex, stocks, commodities, indices, and cryptocurrencies."
        },
        {
            icon: <FaHeadset className="text-3xl text-accent" />,
            title: "24/7 Support",
            description: "Round-the-clock customer support with dedicated account managers and technical assistance."
        }
    ];

    const collaborators = [
        {
            name: "Cboe",
            logo: "🇺🇸",
            description: "Chicago Board Options Exchange - World's largest options exchange",
            partnership: "Direct market data and options trading integration"
        },
        {
            name: "Binance",
            logo: "🇸🇬",
            description: "Leading global cryptocurrency exchange",
            partnership: "Crypto trading infrastructure and liquidity provision"
        },
        {
            name: "Quotex Broker",
            logo: "🇨🇾",
            description: "European regulated CFD and forex broker",
            partnership: "Multi-asset trading technology and compliance framework"
        },
        {
            name: "PocketOptions",
            logo: "🇻🇬",
            description: "Advanced binary options and VPrime Capital",
            partnership: "Derivatives trading tools and risk management systems"
        }
    ];

    const technologyStack = [
        {
            category: "Trading Engine",
            technologies: ["C++ Ultra-Low Latency Engine", "FPGA Acceleration", "Direct Market Access", "Co-Location Servers"]
        },
        {
            category: "Data Processing",
            technologies: ["Real-time Stream Processing", "Machine Learning Algorithms", "Big Data Analytics", "AI-Powered Insights"]
        },
        {
            category: "Security",
            technologies: ["Military-Grade Encryption", "Multi-Layer Authentication", "DDoS Protection", "Regular Security Audits"]
        },
        {
            category: "Infrastructure",
            technologies: ["Global CDN Network", "99.99% Uptime SLA", "Auto-Scaling Architecture", "Disaster Recovery"]
        }
    ];

    const performanceMetrics = [
        { label: "Average Execution Speed", value: "< 0.1ms", icon: <FaBolt /> },
        { label: "Platform Uptime", value: "99.99%", icon: <FaCheckCircle /> },
        { label: "Active Traders", value: "50,000+", icon: <FaUsers /> },
        { label: "Daily Trading Volume", value: "$2B+", icon: <FaChartLine /> }
    ];

    const testimonials = [
        {
            name: "Marcus Chen",
            role: "Professional Trader",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            content: "VPrime Capital platform has revolutionized my trading. The execution speed and analytical tools are unmatched.",
            rating: 5
        },
        {
            name: "Sarah Johnson",
            role: "Investment Analyst",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            content: "The integration with major exchanges and the security features give me complete confidence in the platform.",
            rating: 5
        },
        {
            name: "David Rodriguez",
            role: "Hedge Fund Manager",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
            content: "Institutional-grade tools at retail prices. The partnerships with Cboe and Binance provide unparalleled access.",
            rating: 5
        }
    ];

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl text-center">
                    <motion.div {...fadeInUp}>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                            Advanced <span className="text-accent">Trading</span> Platform
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
                            Experience institutional-grade trading technology with lightning-fast execution,
                            advanced analytics, and seamless integration with global markets.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-8 sm:mb-12"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Platform Features</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            Cutting-edge technology designed for modern traders
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {platformFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="mb-3 sm:mb-4 text-3xl sm:text-4xl">{feature.icon}</div>
                                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm sm:text-base text-white/70 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Collaborators Section */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Strategic Partnerships</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Powered by industry leaders and global market infrastructure
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {collaborators.map((partner, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-4xl">{partner.logo}</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{partner.name}</h3>
                                        <p className="text-accent font-medium">{partner.description}</p>
                                    </div>
                                </div>
                                <p className="text-white/70 leading-relaxed">{partner.partnership}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Technology Stack */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Technology Stack</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Built with enterprise-grade technology for maximum performance and reliability
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {technologyStack.map((stack, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                                variants={fadeInUp}
                            >
                                <h3 className="text-xl font-semibold text-accent mb-4">{stack.category}</h3>
                                <ul className="space-y-2">
                                    {stack.technologies.map((tech, techIndex) => (
                                        <li key={techIndex} className="flex items-center gap-3 text-white/80">
                                            <FaCheckCircle className="text-green-400 text-sm" />
                                            <span>{tech}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Performance Metrics */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Performance Metrics</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Industry-leading performance that traders can rely on
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {performanceMetrics.map((metric, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-4xl text-accent mb-4 flex justify-center">{metric.icon}</div>
                                <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                                <div className="text-white/70">{metric.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Platform Demo */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Platform Preview</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Experience the power of our advanced trading dashboard
                        </p>
                    </motion.div>

                    <motion.div {...fadeInUp}>
                        <DashboardMock />
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What Traders Say</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Join thousands of successful traders who trust our platform
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="text-white font-semibold">{testimonial.name}</div>
                                        <div className="text-white/60 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div {...fadeInUp}>
                        <FaRocket className="text-5xl text-accent mx-auto mb-6" />
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Experience the Future of Trading?</h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Join VPrime Capital and access institutional-grade trading technology with our strategic partners.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                className="bg-accent hover:bg-accent/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                            >
                                Start Trading Now
                            </motion.button>
                            <motion.button
                                className="bg-transparent border-2 border-accent hover:bg-accent/10 text-accent px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signup')}
                            >
                                Try Demo Account
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </motion.div>
    );
};

export default Platform;