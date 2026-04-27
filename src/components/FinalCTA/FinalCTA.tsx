import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


// const navigate = useNavigate();

export const FinalCTA = () => {

    const navigate = useNavigate();
    
    return (
            <section className="py-20">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="text-center">
                        <h2 className="mb-6 text-4xl font-bold text-white">
                            Ready to Trade with Confidence?
                        </h2>
                        <p className="mb-8 text-xl text-white/80 max-w-3xl mx-auto">
                            Join thousands of traders who trust VPrime Capital for fast, secure, and profitable trading. Start your journey today with our advanced platform.
                        </p>

                        <div className="mb-12 flex flex-col sm:flex-row justify-center gap-6">
                            <motion.button
                                className="rounded-lg bg-accent px-10 py-4 font-semibold text-primary shadow-lg hover:shadow-xl transition-shadow"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                            >
                                Start Trading Now
                            </motion.button>

                            <motion.button
                                className="rounded-lg border-2 border-accent px-10 py-4 font-semibold text-accent hover:bg-accent hover:text-primary transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/signup')}
                            >
                                Create Free Account
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <div className="text-3xl mb-2">🚀</div>
                                <h3 className="text-lg font-semibold text-accent mb-1">Quick Setup</h3>
                                <p className="text-white/70">Get started in under 5 minutes</p>
                            </div>
                            <div>
                                <div className="text-3xl mb-2">💰</div>
                                <h3 className="text-lg font-semibold text-accent mb-1">No Hidden Fees</h3>
                                <p className="text-white/70">Transparent pricing, no surprises</p>
                            </div>
                            <div>
                                <div className="text-3xl mb-2">🛡️</div>
                                <h3 className="text-lg font-semibold text-accent mb-1">24/7 Support</h3>
                                <p className="text-white/70">Always here when you need us</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
    )
};