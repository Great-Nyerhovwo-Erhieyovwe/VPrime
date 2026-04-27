import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaTelegramPlane, FaWhatsapp, FaHeadset, FaPaperPlane } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// const navigate = useNavigate();

const Contact = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

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

    const contactMethods = [
        {
            icon: <FaPhone className="text-3xl text-accent" />,
            title: "Phone Support",
            description: "Speak directly with our trading experts",
            contact: "+1 (555) 123-4567",
            availability: "24/7 Available"
        },
        {
            icon: <FaEnvelope className="text-3xl text-accent" />,
            title: "Email Support",
            description: "Get detailed responses to your inquiries",
            contact: "support@vprime.com",
            availability: "Response within 2 hours"
        },
        {
            icon: <FaTelegramPlane className="text-3xl text-accent" />,
            title: "Live Chat",
            description: "Instant support through our chat system",
            contact: "@vertexprime_support",
            availability: "24/7 Available"
        },
        {
            icon: <FaWhatsapp className="text-3xl text-accent" />,
            title: "WhatsApp",
            description: "Connect with us on WhatsApp",
            contact: "+1 (555) 123-4568",
            availability: "Business Hours"
        }
    ];

    const officeLocations = [
        {
            city: "New York",
            address: "123 Wall Street, Suite 456, New York, NY 10005",
            phone: "+1 (555) 123-4567",
            email: "ny@vprime.com",
            flag: "🇺🇸"
        },
        {
            city: "London",
            address: "45 Curzon Street, Mayfair, London W1J 7UH",
            phone: "+44 20 7123 4567",
            email: "london@vprime.com",
            flag: "🇬🇧"
        },
        {
            city: "Singapore",
            address: "Marina Bay Financial Centre, Tower 1, Singapore 018956",
            phone: "+65 6789 0123",
            email: "singapore@vprime.com",
            flag: "🇸🇬"
        },
        {
            city: "Dubai",
            address: "Dubai International Financial Centre, Gate Village 5, Dubai",
            phone: "+971 4 123 4567",
            email: "dubai@vprime.com",
            flag: "🇦🇪"
        }
    ];

    const faqs = [
        {
            question: "How do I open a trading account?",
            answer: "Opening an account is simple! Click the 'Sign Up' button, complete the registration form, verify your identity, and fund your account. Our team will guide you through each step."
        },
        {
            question: "What are your trading hours?",
            answer: "Our platform operates 24/5, following major market hours. Forex markets are open from Monday 00:00 GMT to Friday 23:59 GMT, with some variations during holidays."
        },
        {
            question: "Do you offer demo accounts?",
            answer: "Yes! We provide free demo accounts with $100,000 virtual funds so you can practice trading strategies without risking real money."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept various payment methods including bank transfers, credit/debit cards, e-wallets (Skrill, Neteller), and cryptocurrencies for instant deposits."
        },
        {
            question: "How secure is my data and funds?",
            answer: "We use bank-level 256-bit SSL encryption, segregated accounts, and comply with strict regulatory standards. Your funds are protected by top-tier security measures."
        },
        {
            question: "Do you provide educational resources?",
            answer: "Absolutely! We offer comprehensive educational materials including video tutorials, webinars, trading guides, and market analysis to help you improve your trading skills."
        }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({ name: '', email: '', subject: '', message: '' });
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
    };

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
                            Contact <span className="text-accent">Us</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
                            Get in touch with our expert team. We're here to help you succeed in your trading journey.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Get In Touch</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            Multiple ways to reach our support team. Choose the method that works best for you.
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {contactMethods.map((method, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300 text-center"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="mb-4 flex justify-center">{method.icon}</div>
                                <h3 className="text-xl font-semibold text-white mb-3">{method.title}</h3>
                                <p className="text-white/70 mb-4 leading-relaxed">{method.description}</p>
                                <div className="text-accent font-medium mb-2">{method.contact}</div>
                                <div className="text-white/60 text-sm">{method.availability}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-8 sm:py-12 md:py-16 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                            {...fadeInUp}
                        >
                            <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white/80 mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none transition-colors"
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/80 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none transition-colors"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white/80 mb-2">Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-accent focus:outline-none transition-colors"
                                        required
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="account">Account Support</option>
                                        <option value="technical">Technical Issues</option>
                                        <option value="trading">Trading Questions</option>
                                        <option value="partnership">Partnership Inquiry</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/80 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-white/50 focus:border-accent focus:outline-none transition-colors resize-none"
                                        placeholder="Tell us how we can help you..."
                                        required
                                    ></textarea>
                                </div>
                                <motion.button
                                    type="submit"
                                    className="w-full bg-accent hover:bg-accent/80 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FaPaperPlane />
                                    Send Message
                                </motion.button>
                            </form>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div
                            className="space-y-8"
                            {...fadeInUp}
                        >
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <FaMapMarkerAlt className="text-accent text-xl mt-1" />
                                        <div>
                                            <div className="text-white font-medium mb-1">Headquarters</div>
                                            <div className="text-white/70">Level 12, Suite 1204 88 Harrington Street, The Rocks<br />Sydney, NSW, 2000<br />Australia</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <FaPhone className="text-accent text-xl" />
                                        <div>
                                            <div className="text-white font-medium">Phone</div>
                                            <div className="text-white/70">+1 (555) 123-4567</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <FaEnvelope className="text-accent text-xl" />
                                        <div>
                                            <div className="text-white font-medium">Email</div>
                                            <div className="text-white/70">support@vprime.com</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <FaClock className="text-accent text-xl" />
                                        <div>
                                            <div className="text-white font-medium">Business Hours</div>
                                            <div className="text-white/70">24/7 Support Available</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50">
                                <h4 className="text-lg font-semibold text-white mb-4">Response Times</h4>
                                <div className="space-y-3 text-white/70">
                                    <div className="flex justify-between">
                                        <span>Live Chat</span>
                                        <span className="text-accent">Instant</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Email Support</span>
                                        <span className="text-accent">Within 2 hours</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phone Support</span>
                                        <span className="text-accent">Immediate</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Office Locations */}
            <section className="py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Our Offices</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            Global presence with local support in key financial hubs worldwide
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {officeLocations.map((office, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-3xl">{office.flag}</span>
                                    <h3 className="text-2xl font-semibold text-white">{office.city}</h3>
                                </div>
                                <div className="space-y-3 text-white/70">
                                    <div className="flex items-start gap-3">
                                        <FaMapMarkerAlt className="text-accent mt-1" />
                                        <span>{office.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaPhone className="text-accent" />
                                        <span>{office.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaEnvelope className="text-accent" />
                                        <span>{office.email}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-8 sm:py-12 md:py-16 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-4xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-sm sm:text-base text-white/80">
                            Quick answers to common questions about our services
                        </p>
                    </motion.div>

                    <motion.div
                        className="space-y-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50"
                                variants={fadeInUp}
                            >
                                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                                <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-r from-accent/10 to-blue-500/10">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div {...fadeInUp}>
                        <FaHeadset className="text-4xl sm:text-5xl text-accent mx-auto mb-4" />
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Need Immediate Help?</h2>
                        <p className="text-sm sm:text-base text-white/80 mb-6 max-w-2xl mx-auto">
                            Our expert support team is available 24/7 to assist you with any questions or concerns.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.button
                                className="bg-accent hover:bg-accent/80 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('https://t.me/vertexprime_support')}
                            >
                                <FaTelegramPlane />
                                Start Live Chat
                            </motion.button>
                            <motion.button
                                className="bg-transparent border-2 border-accent hover:bg-accent/10 text-accent px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaPhone />
                                Call Now
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </motion.div>
    );
};

export default Contact;