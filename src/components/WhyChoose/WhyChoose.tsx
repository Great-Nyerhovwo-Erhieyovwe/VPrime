import {
  FaBolt,
  FaChartLine,
  FaRobot,
  FaMoneyBillWave,
  FaGlobeAmericas,
  FaMobileAlt,
  FaShieldAlt,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    Icon: FaBolt,
    title: "Instant Trade Execution",
    description: "Sub‑millisecond order routing for razor‑sharp pricing and minimal slippage.",
  },
  {
    Icon: FaChartLine,
    title: "Advanced Trading Charts",
    description: "Customizable indicators, multi‑timeframe views, drawing tools, and technical analysis.",
  },
  {
    Icon: FaRobot,
    title: "AI‑Powered Signals",
    description: "Machine‑learning models suggest optimal entry/exit points based on market data.",
  },
  {
    Icon: FaMoneyBillWave,
    title: "Fast Deposits & Withdrawals",
    description: "Support for fiat currencies, cryptocurrencies, and major e-wallets with instant processing.",
  },
  {
    Icon: FaGlobeAmericas,
    title: "Multi‑Asset Trading",
    description: "Trade forex, crypto, stocks, indices, commodities – all in one unified platform.",
  },
  {
    Icon: FaMobileAlt,
    title: "Mobile Trading App",
    description: "Full-featured mobile app for trading on-the-go with all desktop features.",
  },
  {
    Icon: FaShieldAlt,
    title: "Bank-Level Security",
    description: "Multi-layer security including 2FA, cold storage, and regulatory compliance.",
  },
  {
    Icon: FaClock,
    title: "24/7 Market Access",
    description: "Round-the-clock trading with global market hours and instant liquidity.",
  },
  {
    Icon: FaUsers,
    title: "Expert Support Team",
    description: "Dedicated account managers and technical support available 24/7.",
  },
];

export const WhyChoose = () => (
  <section className="py-8 sm:py-12 md:py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <h2 className="mb-3 sm:mb-4 md:mb-6 text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
        Why Choose VPrime Capital?
      </h2>
      <p className="mb-8 sm:mb-10 md:mb-12 text-center text-sm sm:text-base text-white/70 max-w-3xl mx-auto leading-relaxed px-2">
        Discover the advantages that make VPrime Capital the preferred choice for traders worldwide. Our platform combines cutting-edge technology with unparalleled service.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </div>
  </section>
);