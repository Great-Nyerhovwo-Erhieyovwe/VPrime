'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters, AiOutlineCheckCircle } from 'react-icons/ai'
import { HiXMark } from 'react-icons/hi2'
// import { Footer } from '../../../components/Footer/Footer'

const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://vprimeapi.onrender.com' : 'http://localhost:4000');

const Signup = () => {
    // Form states
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        country: '',
        currency: '',
        accountType: 'individual',
        dateOfBirth: '',
        password: '',
        confirmPassword: '',
    })

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [otpLoading, setOtpLoading] = useState(false)

    // OTP and modals
    const [otp, setOtp] = useState('')
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showFailureModal, setShowFailureModal] = useState(false)
    const [failureMessage, setFailureMessage] = useState('')
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    const countries = [
        'United States',
        'United Kingdom',
        'England',
        'Scotland',
        'Whales',
        'Canada',
        'Switzerland',
        'Australia',
        'Phillipines',
        'China',
        'Japan',
        'Vietnam',
        'North Korea',
        'South Africa',
        'Nigeria',
        'Papua New Guinea',
        'Fiji',
        'Zimbabwe',
        'Kenya',
        'Sweden',
        'New Zealand',
        'Mexico',
        'Argentina',
        'Columbia',
        'Chile',
        'Russia',
        'Kazakhstan',
        'Brazil',
        'India',
        'Pakistan',
        'Bangladesh',
        'Saudi Arabia',
        'Turkey',
        'Indonesia',
        'Malaysia',
        'Germany',
        'France',
        'Italy',
        'Norway',
        'Poland',
        'Singapore',
        'United Arab Emirates',
        'Kuwait',
        'Bahrain',
        'Other'
    ]
    const currencies = [
        'USD',
        'EUR',
        'GBP',
        'JPY',
        'AUD',
        'CAD',
        'CHF',
        'CNY',
        'VND',
        'PHP',
        'ZAR',
        'NGN',
        'GHS',
        'KSH',
        'KES',
        'NOK',
        'SEK',
        'PLN',
        'RUB',
        'PKR',
        'BDT',
        'SAR',
        'TRY',
        'INR',
        'MYR',
        'SGD',
        'AED',
        'KWD',
        'BHD',
        'BRL',
        'MXN',
        'ARS',
        'CLP',
        'COP',
        'NZD',
        'ZWD',
        'FJD',
        'PGK',
        'IDR',
    ]

    // Calculate password strength
    const calculatePasswordStrength = (pwd: string) => {
        let strength = 0
        if (pwd.length >= 8) strength += 20
        if (pwd.length >= 12) strength += 20
        if (/[a-z]/.test(pwd)) strength += 15
        if (/[A-Z]/.test(pwd)) strength += 15
        if (/[0-9]/.test(pwd)) strength += 15
        if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15
        return Math.min(strength, 100)
    }

    const getPasswordStrengthColor = (strength: number) => {
        if (strength < 30) return 'from-red-500 to-red-600'
        if (strength < 60) return 'from-yellow-500 to-orange-600'
        if (strength < 80) return 'from-green-500 to-emerald-600'
        return 'from-green-400 to-green-600'
    }

    const getPasswordStrengthText = (strength: number) => {
        if (strength < 30) return 'Weak'
        if (strength < 60) return 'Fair'
        if (strength < 80) return 'Good'
        return 'Strong'
    }

    // Validations
    const validateStep = (stepNum: number) => {
        const newErrors: Record<string, string> = {}

        if (stepNum === 1) {
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
            if (!formData.username.trim()) newErrors.username = 'Username is required'
            if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'
        }

        if (stepNum === 2) {
            if (!formData.email.trim()) newErrors.email = 'Email is required'
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
            if (!formData.country) newErrors.country = 'Country is required'
            if (!formData.currency) newErrors.currency = 'Currency is required'
            if (!formData.accountType) newErrors.accountType = 'Account type is required'
        }

        if (stepNum === 3) {
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
            else {
                const birthDate = new Date(formData.dateOfBirth)
                const today = new Date()
                let age = today.getFullYear() - birthDate.getFullYear()
                const monthDiff = today.getMonth() - birthDate.getMonth()
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
                if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old'
            }
        }

        if (stepNum === 4) {
            if (!formData.password) newErrors.password = 'Password is required'
            if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
            if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
            if (!agreedToTerms) newErrors.terms = 'You must agree to the terms and disclaimers'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        setStep(step - 1)
        setErrors({})
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateStep(4)) return

        setIsLoading(true)

        try {
            // Send OTP to backend
            const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            })

            const data = await response.json()

            if (response.ok) {
                // Store dev OTP if provided (for testing in development)
                if (data.devOtp) {
                    console.log(`📧 [DEV] OTP: ${data.devOtp}`)
                    // Auto-fill OTP for testing (comment out in production)
                    setOtp(data.devOtp)
                }
                setOtp(otp => otp)
                setShowOtpModal(true)
            } else {
                setFailureMessage(data.message || 'Failed to send OTP. Please try again.')
                setShowFailureModal(true)
            }
        } catch (error) {
            console.error('Error:', error)
            setFailureMessage('Network error. Please try again.')
            setShowFailureModal(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            setErrors({ otp: 'OTP must be 6 digits' })
            return
        }

        setOtpLoading(true)

        try {
            const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp,
                    userData: formData,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setShowOtpModal(false)
                setShowSuccessModal(true)

                // Reset form after success
                setTimeout(() => {
                    setShowSuccessModal(false)
                    setStep(1)
                    setFormData({
                        firstName: '',
                        lastName: '',
                        username: '',
                        email: '',
                        country: '',
                        currency: '',
                        accountType: 'individual',
                        dateOfBirth: '',
                        password: '',
                        confirmPassword: '',
                    })
                    setAgreedToTerms(false)
                    setOtp('')
                    window.location.href = '/login'
                }, 2000)
            } else {
                setErrors({ otp: data.message || 'Invalid OTP. Please try again.' })
            }
        } catch (error) {
            console.error('Error:', error)
            setErrors({ otp: 'Failed to verify OTP. Please try again.' })
        } finally {
            setOtpLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: 0.1 },
        },
    }

    const inputVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4 },
        },
    }

    const passwordStrength = calculatePasswordStrength(formData.password)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-2xl"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1
                            className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
                        >
                            VPrime Capital
                        </h1>
                        <p className="text-gray-400 text-sm tracking-wider uppercase">Create Your Account</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-4">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className="flex-1">
                                    <motion.div
                                        className={`h-2 rounded-full mx-2 ${
                                            step >= s ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-slate-700'
                                        }`}
                                        initial={false}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <p className="text-xs text-gray-400 text-center mt-2">
                                        {s === 1 && 'Personal'}
                                        {s === 2 && 'Account'}
                                        {s === 3 && 'Verification'}
                                        {s === 4 && 'Security'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Signup Card */}
                    <motion.div
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
                        whileHover={{ boxShadow: '0 0 30px rgba(96, 165, 250, 0.2)' }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-8">
                            {step === 1 && 'Personal Information'}
                            {step === 2 && 'Account Details'}
                            {step === 3 && 'Age Verification'}
                            {step === 4 && 'Create Password'}
                        </h2>

                        <form onSubmit={step === 4 ? handleSubmit : e => { e.preventDefault(); handleNext() }} className="space-y-5">
                            {/* Step 1: Personal Information */}
                            {step === 1 && (
                                <>
                                    <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                                errors.firstName
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                    : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                            }`}
                                            placeholder="John"
                                        />
                                        {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                                    </motion.div>

                                    <motion.div
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                                errors.lastName
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                    : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                            }`}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                                    </motion.div>

                                    <motion.div
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                                errors.username
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                    : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                            }`}
                                            placeholder="johndoe123"
                                        />
                                        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                                    </motion.div>
                                </>
                            )}

                            {/* Step 2: Account Details */}
                            {step === 2 && (
                                <>
                                    <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                                errors.email
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                    : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                            }`}
                                            placeholder="your@email.com"
                                        />
                                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                    </motion.div>

                                    <motion.div
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.2 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white focus:outline-none ${
                                                    errors.country
                                                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                        : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                                }`}
                                            >
                                                <option value="">Select Country</option>
                                                {countries.map(c => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white focus:outline-none ${
                                                    errors.currency
                                                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                        : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                                }`}
                                            >
                                                <option value="">Select Currency</option>
                                                {currencies.map(c => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.currency && <p className="text-red-400 text-xs mt-1">{errors.currency}</p>}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                                        <select
                                            name="accountType"
                                            value={formData.accountType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 text-white focus:outline-none"
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="corporate">Corporate</option>
                                            <option value="partnership">Partnership</option>
                                        </select>
                                    </motion.div>
                                </>
                            )}

                            {/* Step 3: Age Verification */}
                            {step === 3 && (
                                <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                            errors.dateOfBirth
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                        }`}
                                    />
                                    {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}

                                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <p className="text-sm text-blue-300">
                                            <span className="font-semibold">Age Requirement:</span> You must be at least 18 years old to use this platform.
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Create Password */}
                            {step === 4 && (
                                <>
                                    <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none pr-12 ${
                                                    errors.password
                                                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                        : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <AiOutlineEyeInvisible size={20} />
                                                ) : (
                                                    <AiOutlineEye size={20} />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

                                        {/* Password Strength Indicator */}
                                        {formData.password && (
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full bg-gradient-to-r ${getPasswordStrengthColor(passwordStrength)}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${passwordStrength}%` }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-300">
                                                        {getPasswordStrengthText(passwordStrength)}
                                                    </span>
                                                </div>
                                                <ul className="text-xs text-gray-400 space-y-1">
                                                    <li className={formData.password.length >= 8 ? 'text-green-400' : ''}>
                                                        ✓ At least 8 characters
                                                    </li>
                                                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : ''}>
                                                        ✓ One uppercase letter
                                                    </li>
                                                    <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : ''}>
                                                        ✓ One lowercase letter
                                                    </li>
                                                    <li className={/[0-9]/.test(formData.password) ? 'text-green-400' : ''}>
                                                        ✓ One number
                                                    </li>
                                                    <li className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-400' : ''}>
                                                        ✓ One special character
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border transition-all duration-300 text-white placeholder-gray-500 focus:outline-none pr-12 ${
                                                    errors.confirmPassword
                                                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                                        : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                                            >
                                                {showConfirmPassword ? (
                                                    <AiOutlineEyeInvisible size={20} />
                                                ) : (
                                                    <AiOutlineEye size={20} />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.3 }}
                                        className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={agreedToTerms}
                                            onChange={e => {
                                                setAgreedToTerms(e.target.checked)
                                                if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }))
                                            }}
                                            className="mt-1"
                                        />
                                        <div>
                                            <p className="text-sm text-gray-300">
                                                I agree to the{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowTermsModal(true)}
                                                    className="text-blue-400 hover:text-blue-300 font-semibold"
                                                >
                                                    Terms, Conditions & Disclaimers
                                                </button>
                                            </p>
                                            {errors.terms && <p className="text-red-400 text-xs mt-1">{errors.terms}</p>}
                                        </div>
                                    </motion.div>
                                </>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-4 pt-4">
                                {step > 1 && (
                                    <motion.button
                                        variants={inputVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: 0.5 }}
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all duration-300"
                                        style={{ fontFamily: "'Poppins', sans-serif" }}
                                    >
                                        Back
                                    </motion.button>
                                )}
                                <motion.button
                                    variants={inputVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: 0.5 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all duration-300 disabled:opacity-75 ${
                                        step < 4 ? 'flex items-center justify-center' : ''
                                    }`}
                                    style={{ fontFamily: "'Poppins', sans-serif" }}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                                            <span>Processing...</span>
                                        </div>
                                    ) : step === 4 ? (
                                        'Create Account'
                                    ) : (
                                        'Next Step'
                                    )}
                                </motion.button>
                            </div>
                        </form>

                        {/* Login Link */}
                        <p className="text-center text-gray-400 text-sm mt-6">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                                Sign In
                            </a>
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowOtpModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-slate-800 border border-slate-700/50 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                            <h3 className="text-2xl font-bold text-white">
                                Verify Email
                            </h3>
                            <p className="text-blue-100 text-sm mt-2">Enter the OTP sent to {formData.email}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">6-Digit OTP Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    // autoComplete='off'
                                    inputMode='numeric'
                                    pattern='[0-9]*'
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    placeholder="000000"
                                    className={`w-full px-4 py-3 rounded-lg bg-slate-700/50 border text-center text-2xl tracking-widest font-bold transition-all duration-300 text-white placeholder-gray-500 focus:outline-none ${
                                        errors.otp
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/30'
                                            : 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                                    }`}
                                />
                                {errors.otp && <p className="text-red-400 text-xs mt-2">{errors.otp}</p>}
                            </div>

                            <p className="text-xs text-gray-400 text-center">
                                Didn't receive the code?{' '}
                                <button type="button" className="text-blue-400 hover:text-blue-300 font-semibold">
                                    Resend OTP
                                </button>
                            </p>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={otpLoading || otp.length < 6}
                                className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all duration-300 disabled:opacity-50"
                            >
                                {otpLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    'Verify OTP'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
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
                            <AiOutlineCheckCircle className="text-green-400" size={64} />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Account Created!
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Welcome to VPrime Capital. Your email has been verified. Redirecting to login...
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-pulse text-blue-400">
                                <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Failure Modal */}
            {showFailureModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-800 border border-red-500/30 rounded-2xl p-8 text-center max-w-sm shadow-2xl"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 0.5 }}
                            className="mb-4 flex justify-center"
                        >
                            <HiXMark className="text-red-400" size={64} />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Registration Failed
                        </h3>
                        <p className="text-gray-400 mb-6">{failureMessage}</p>
                        <button
                            onClick={() => setShowFailureModal(false)}
                            className="w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold transition-all duration-300"
                        >
                            Try Again
                        </button>
                    </motion.div>
                </motion.div>
            )}

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowTermsModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-slate-800 border border-slate-700/50 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl"
                    >
                        <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6">
                            <h3 className="text-xl font-bold text-white">
                                Terms, Conditions & Disclaimers
                            </h3>
                        </div>

                        <div className="p-6 space-y-4 text-gray-300 text-sm">
                            <div>
                                <h4 className="font-semibold text-white mb-2">1. Risk Disclosure</h4>
                                <p>
                                    Trading and investing involve substantial risk of loss. Past performance does not guarantee future results. VPrime Capital does not guarantee, represent, or warrant that account funds will increase or be profitable on self trading.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">2. Investment Risks</h4>
                                <p>
                                    All investments carry risk, including loss of principal. Market volatility, liquidity risk, counterparty risk, and geopolitical events are inherent in trading. Leverage and margin trading can amplify losses.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">3. Account Security</h4>
                                <p>
                                    You are responsible for maintaining the confidentiality of your login credentials. We use industry-standard encryption and security measures. Do not share your password with anyone.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">4. Age & Legal Requirements</h4>
                                <p>
                                    Users must be 18 years or older and meet all legal requirements in their jurisdiction. VPrime Capital does not provide services to residents of restricted jurisdictions.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">5. Limitation of Liability</h4>
                                <p>
                                    VPrime Capital is not liable for any indirect, incidental, or consequential self damages. Trading involves substantial risk and may not be suitable for all unexperienced investors.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2">6. Terms of Service Agreement</h4>
                                <p>
                                    By registering, you agree to comply with these terms and all applicable laws. VPrime Capital reserves the right to modify terms and conditions at any time.
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700/50 p-4">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Footer */}
             {/* <Footer /> */}
        </div>
    )
}

export default Signup