import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import { FaUsers, FaShieldAlt, FaRocket, FaHandshake, FaAward, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Image Import
import davidKImg from '../../../assets/images/davidk.jpg';
import davidTImg from '../../../assets/images/davidt.jpg';
import jamesAImg from '../../../assets/images/jamesa.jpg';
import michealJImg from '../../../assets/images/michealj.jpg';


const AboutUs = () => {

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

    const teamMembers = [
        {
            name: "James A. Naivalu",
            role: "CEO & Founder",
            // image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            image: jamesAImg,
            bio: "Former hedge fund manager with 15+ years in financial markets. Expert in algorithmic trading and risk management."
        },
        {
            name: "David M. Kapi",
            role: "Manager",
            // image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            // image: "/images/DavidK.JPG",
            image: davidKImg,
            bio: "hedge fund manager with 9+ years in global financial markets. Expert in algorithmic trading and risk management."
        },
        {
            name: "Sarah Johnson",
            role: "CTO",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            bio: "Technology innovator with a background in fintech and AI. Leads our cutting-edge platform development."
        },
        {
            name: "Michael J. Anderson",
            role: "Head of Trading",
            // image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            image: michealJImg,
            bio: "Experienced trader and market analyst specializing in forex and commodities with a proven track record."
        },
        {
            name: "David C. Thompson",
            role: "Assistant Head of Trading",
            // image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            image: davidTImg,
            bio: "Experienced trader and market analyst specializing in forex and commodities with a proven track record."
        },
        {
            name: "Emily Zhang",
            role: "Compliance Officer",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            bio: "Regulatory expert ensuring our operations meet the highest standards of financial compliance and security."
        }
    ];

    const values = [
        {
            icon: <FaShieldAlt className="text-3xl text-accent" />,
            title: "Security First",
            description: "We prioritize the security of your funds and data with bank-level encryption and multi-layer protection systems."
        },
        {
            icon: <FaRocket className="text-3xl text-accent" />,
            title: "Innovation",
            description: "Constantly pushing boundaries with cutting-edge technology and advanced trading algorithms."
        },
        {
            icon: <FaHandshake className="text-3xl text-accent" />,
            title: "Transparency",
            description: "Clear pricing, honest communication, and complete visibility into all our operations and fees."
        },
        {
            icon: <FaUsers className="text-3xl text-accent" />,
            title: "Client-Centric",
            description: "Every decision we make is focused on providing the best possible experience for our traders."
        }
    ];

    const milestones = [
        { year: "2018", event: "Company founded with vision to democratize advanced trading" },
        { year: "2019", event: "Launched proprietary trading platform with AI-powered analytics" },
        { year: "2020", event: "Expanded to serve 10,000+ active traders worldwide" },
        { year: "2021", event: "Introduced mobile trading app and social trading features" },
        { year: "2022", event: "Achieved $1B+ in cumulative trading volume" },
        { year: "2023", event: "Launched institutional-grade tools for professional traders" },
        { year: "2024", event: "Expanded to 50+ countries with localized support" }
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
                            About <span className="text-accent">VPrime Capital</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
                            Pioneering the future of financial trading through innovation, security, and unparalleled user experience.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-8 sm:mb-12"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-4xl mx-auto leading-relaxed">
                            At VertexPrime Capital, we believe that access to sophisticated trading tools should not be limited to institutional investors.
                            Our mission is to democratize advanced trading technology, providing retail traders with institutional-grade platforms,
                            cutting-edge analytics, and unparalleled support to help them achieve their financial goals.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-8 sm:py-12 md:py-16 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Our Values</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="mb-4">{value.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                                <p className="text-white/70 leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Meet Our Team</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            Industry experts dedicated to your trading success
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 text-center"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                                />
                                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                                <p className="text-accent font-medium mb-3">{member.role}</p>
                                <p className="text-white/70 text-sm leading-relaxed">{member.bio}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-8 sm:py-12 md:py-16 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-8 sm:mb-12"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Our Journey</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            Milestones that shaped our path to becoming a leading trading platform
                        </p>
                    </motion.div>

                    <motion.div className="relative space-y-12" variants={staggerContainer} initial="initial" animate="animate">

                        {/* Vertical center line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600 translate-x-1/2"></div>

                        {milestones.map((milestone, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg border border-slate-700/50"
                                variants={fadeInUp}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-primary">{milestone.year}</div>
                                    <div>
                                        <div className="text-white font-semibold mb-1">{milestone.event}</div>
                                        <p className="text-white/70 text-sm">{milestone.event}</p>
                                    </div>
                                </div>
                                {/* </div> */}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                            variants={fadeInUp}
                        >
                            <FaUsers className="text-4xl text-accent mx-auto mb-4" />
                            <div className="text-4xl font-bold text-white mb-2">50,000+</div>
                            <div className="text-white/70">Active Traders</div>
                        </motion.div>

                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                            variants={fadeInUp}
                        >
                            <FaGlobe className="text-4xl text-accent mx-auto mb-4" />
                            <div className="text-4xl font-bold text-white mb-2">50+</div>
                            <div className="text-white/70">Countries Served</div>
                        </motion.div>

                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                            variants={fadeInUp}
                        >
                            <FaAward className="text-4xl text-accent mx-auto mb-4" />
                            <div className="text-4xl font-bold text-white mb-2">$2B+</div>
                            <div className="text-white/70">Trading Volume</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-r from-accent/10 to-blue-500/10">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div {...fadeInUp}>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
                        <p className="text-sm sm:text-base text-white/80 mb-6 max-w-2xl mx-auto">
                            Join thousands of successful traders who trust VPrime Capital with their financial future.
                        </p>
                        <motion.button
                            className="bg-accent hover:bg-accent/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/signup')}
                        >
                            Get Started Today
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </motion.div>
    );
};

export default AboutUs;