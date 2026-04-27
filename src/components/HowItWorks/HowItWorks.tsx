import { StepCard } from "./StepCard";

const steps = [
    {
        number: 1,
        title: "Create an Account",
        description: "Sign up with email or Google and set a strong password. Our registration process takes less than 2 minutes.",
    },
    {
        number: 2,
        title: "Verify Your Identity",
        description: "Complete KYC by uploading ID and a selfie. We use advanced AI verification for quick approval.",
    },
    {
        number: 3,
        title: "Fund Your Wallet",
        description: "Deposit fiat or crypto instantly via supported methods. We accept credit cards, bank transfers, and crypto wallets.",
    },
    {
        number: 4,
        title: "Start Trading",
        description: "Choose an asset, set leverage, and execute your trade. Use our advanced platform with real-time data.",
    },
    {
        number: 5,
        title: "Withdraw Profits",
        description: "Request a withdrawal; once approved, funds arrive within minutes. Multiple withdrawal options available.",
    },
    {
        number: 6,
        title: "Grow Your Portfolio",
        description: "Monitor performance, use analytics tools, and scale your trading strategy with our expert resources.",
    },
];

export const HowItWorks = () => (
    <section className="py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h2 className="mb-3 sm:mb-4 md:mb-6 text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
                How It Works
            </h2>
            <p className="mb-8 sm:mb-10 md:mb-12 text-center text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed px-2">
                Getting started with VPrime Capital is simple and secure. Follow these steps to begin your trading journey.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {steps.map((s) => (
                    <StepCard key={s.number} {...s} />
                ))}
            </div>
        </div>
    </section>
);