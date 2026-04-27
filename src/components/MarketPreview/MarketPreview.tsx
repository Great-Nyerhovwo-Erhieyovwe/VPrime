import { useNavigate } from "react-router-dom";
import { AssetCard } from "./AssetCard";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const mockAssets = [
  {
    name: "EUR/USD",
    symbol: "Forex",
    price: "1.0834",
    change: 0.12,
    data: [1.08, 1.081, 1.082, 1.083, 1.084, 1.0834],
  },
  {
    name: "BTC/USD",
    symbol: "Crypto",
    price: "$27,540",
    change: -1.04,
    data: [27600, 27750, 27800, 27500, 27400, 27540],
  },
  {
    name: "Apple Inc.",
    symbol: "Stocks",
    price: "$185.22",
    change: 0.45,
    data: [184, 184.5, 185, 185.2, 185.1, 185.22],
  },
  {
    name: "S&P 500",
    symbol: "Indices",
    price: "4,210.5",
    change: 0.09,
    data: [4190, 4195, 4200, 4210, 4215, 4210.5],
  },
  {
    name: "Gold",
    symbol: "Commodities",
    price: "$1,950.30",
    change: 0.8,
    data: [1940, 1945, 1950, 1955, 1950, 1950.3],
  },
  {
    name: "ETH/USD",
    symbol: "Crypto",
    price: "$1,650",
    change: 2.1,
    data: [1620, 1630, 1640, 1650, 1645, 1650],
  },
];

export const MarketPreview = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState(mockAssets);

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev: any) => {
        const newAssets = [...prev];
        const first = newAssets.shift();
        if (first) newAssets.push(first);
        return newAssets;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  console.log(assets);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Live Market
            <span className="inline-block ml-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Overview
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
            Real-time data across multiple asset classes with instant updates and advanced analytics
          </p>
        </motion.div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {mockAssets.map((a, i) => (
            <AssetCard key={i} {...a} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-5">
            Want to see more markets and real-time data?
          </p>
          <motion.button
            className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 font-bold text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/markets')}
          >
            Explore All Markets
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};
