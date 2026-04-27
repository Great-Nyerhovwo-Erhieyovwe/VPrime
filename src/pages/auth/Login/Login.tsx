'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { HiCheckCircle } from 'react-icons/hi'
// import { Footer } from '../../../components/Footer/Footer'

const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://vprimeapi.onrender.com' : 'http://localhost:4000');

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [successModal, setSuccessModal] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
    const [chartBars, setChartBars] = useState(Array(30).fill(0).map(() => Math.random() * 80 + 20))

    console.log(chartBars);

    // Form validation
    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {}

        if (!email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        
        // Animate chart bars during loading
        const animationInterval = setInterval(() => {
            setChartBars(prev => prev.map(() => Math.random() * 80 + 20))
        }, 100)

        try {
            // Call actual API
            // Note: backendUrl already includes /api, so we only add /auth/login
            console.log('🔄 User login attempt with email:', email);
            console.log('🔗 API endpoint:', `${backendUrl}/api/auth/login`);
            const response = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            
            const data = await response.json()
            
            clearInterval(animationInterval)
            console.log('📡 Login response status:', response.status);
            console.log('📡 Login response data:', data);
            
            if (response.ok && data.token) {
                // Save token and user info
                console.log('✅ Login successful, saving token and redirecting...');
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                setSuccessModal(true)
                
                // Redirect to dashboard after showing success message
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 2000)
            } else {
                setIsLoading(false)
                setErrors({ email: data.message || 'Invalid credentials' })
            }
        } catch (error) {
            clearInterval(animationInterval)
            setIsLoading(false)
            setErrors({ email: 'Network error. Please try again.' })
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: 0.1 }
        }
    }

    const inputVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4 }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            VPrime Capital
                        </h1>
                        <p className="text-gray-400 text-sm tracking-wider uppercase">Investment Platform</p>
                    </div>

                    {/* Login Card */}
                    <motion.div
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                        whileHover={{ boxShadow: '0 0 30px rgba(96, 165, 250, 0.2)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Welcome Back
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (errors.email) setErrors({ ...errors, email: undefined })
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                        errors.email
                                            ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/30'
                                            : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                    }`}
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-xs mt-1"
                                    >
                                        {errors.email}
                                    </motion.p>
                                )}
                            </motion.div>

                            {/* Password Field */}
                            <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value)
                                            if (errors.password) setErrors({ ...errors, password: undefined })
                                        }}
                                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none pr-12 ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/30'
                                                : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                        }`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <AiOutlineEyeInvisible size={20} />
                                        ) : (
                                            <AiOutlineEye size={20} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-xs mt-1"
                                    >
                                        {errors.password}
                                    </motion.p>
                                )}
                            </motion.div>

                            {/* Remember & Forgot */}
                            <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="flex items-center justify-between text-sm">
                                <label className="flex items-center text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                                    <input type="checkbox" className="mr-2 rounded" />
                                    Remember me
                                </label>
                                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    Forgot password?
                                </a>
                            </motion.div>

                            {/* Submit Button */}
                            <motion.button
                                variants={inputVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.4 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all duration-300 disabled:opacity-75 relative overflow-hidden group"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </motion.button>

                            {/* Disclaimer Button */}
                            <motion.button
                                variants={inputVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: 0.5 }}
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="w-full py-2 text-xs text-gray-400 hover:text-gray-300 transition-colors border-t border-slate-700/50 pt-4"
                            >
                                View Terms & Disclaimer
                            </motion.button>
                        </form>

                        {/* Signup Link */}
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Don't have an account?{' '}
                            <a href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                Sign Up
                            </a>
                        </p>
                    </motion.div>

                    {/* Chart Animation Loader */}
                    {/* {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
                        >
                            <p className="text-gray-400 text-xs text-center mb-4 uppercase tracking-wider">Processing Your Request</p>
                            <div className="flex items-end justify-center gap-1 h-16">
                                {chartBars.map((height, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 0.1, ease: 'linear' }}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-500 text-xs text-center mt-4">Secure authentication in progress...</p>
                        </motion.div>
                    )} */}
                </motion.div>
            </div>

            {/* Modal - Terms & Disclaimer */}
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-800 border border-slate-700/50 rounded-2xl max-w-md w-full max-h-96 overflow-y-auto shadow-2xl"
                    >
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6">
                            <h3 className="text-xl font-bold text-white">
                                Terms & Disclaimers
                            </h3>
                        </div>

                        <div className="p-6 space-y-4 text-gray-300 text-sm">
                            <div>
                                <h4 className="font-semibold text-white mb-2">Risk Disclosure</h4>
                                <p>
                                    Trading and investing involve substantial risk. Past performance is not indicative of future results. VPrime Capital does not guarantee past returns.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">Investment Risks</h4>
                                <p>
                                    All investments carry risk, including loss of principal. Market volatility, liquidity risk, and counterparty risk are inherent in trading activities.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">Account Security</h4>
                                <p>
                                    You are responsible for maintaining the confidentiality of your login credentials. We use industry-standard encryption to protect your data.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">Terms of Service</h4>
                                <p>
                                    By using this platform, you agree to our complete Terms of Service and Privacy Policy. Users must be 18 or older.
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-4 flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                            >
                                I Agree
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Success Modal */}
            {successModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 text-center max-w-sm shadow-2xl"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                            className="mb-4 flex justify-center"
                        >
                            <HiCheckCircle className="text-green-400" size={64} />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Login Successful!
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Welcome back to VPrime Capital. Redirecting to your dashboard...
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-pulse text-blue-400">
                                <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Footer */}
            {/* <Footer /> */}
        </div>
    )
}

export default Login