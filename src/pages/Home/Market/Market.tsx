import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar/Navbar";
import { Footer } from "../../../components/Footer/Footer";
import { AssetCard } from "../../../components/MarketPreview/AssetCard";
import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, AreaSeries, HistogramSeries } from "lightweight-charts";
import { FaChartLine, FaChartBar, FaChartArea, FaExchangeAlt, FaCoins, FaGlobe, FaIndustry, FaGasPump } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// const navigate = useNavigate();

const Markets = () => {

    const navigate = useNavigate();
    
    const [selectedAsset, setSelectedAsset] = useState("EUR/USD");
    const [chartType, setChartType] = useState<"line" | "candle" | "area" | "volume">("candle");
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const volumeChartRef = useRef<HTMLDivElement>(null);

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

    // Extended market data
    const marketOverview = [
        {
            name: "EUR/USD",
            symbol: "Forex",
            price: "1.0834",
            change: 0.12,
            data: [1.08, 1.081, 1.082, 1.083, 1.084, 1.0834],
            icon: <FaExchangeAlt className="text-accent" />
        },
        {
            name: "BTC/USD",
            symbol: "Crypto",
            price: "$27,540",
            change: -1.04,
            data: [27600, 27750, 27800, 27500, 27400, 27540],
            icon: <FaCoins className="text-accent" />
        },
        {
            name: "S&P 500",
            symbol: "Indices",
            price: "4,210.5",
            change: 0.09,
            data: [4190, 4195, 4200, 4210, 4215, 4210.5],
            icon: <FaChartLine className="text-accent" />
        },
        {
            name: "Gold",
            symbol: "Commodities",
            price: "$1,950.30",
            change: 0.8,
            data: [1940, 1945, 1950, 1955, 1950, 1950.3],
            icon: <FaCoins className="text-accent" />
        },
        {
            name: "WTI Crude",
            symbol: "Commodities",
            price: "$78.45",
            change: -0.65,
            data: [79.1, 78.8, 78.5, 78.2, 78.0, 78.45],
            icon: <FaGasPump className="text-accent" />
        },
        {
            name: "Apple Inc.",
            symbol: "Stocks",
            price: "$185.22",
            change: 0.45,
            data: [184, 184.5, 185, 185.2, 185.1, 185.22],
            icon: <FaIndustry className="text-accent" />
        }
    ];

    // Detailed chart data for selected asset
    const getDetailedData = (assetName: string) => {
        const baseData = {
            "EUR/USD": {
                candles: [
                    { time: '2024-01-01', open: 1.0800, high: 1.0850, low: 1.0780, close: 1.0830, volume: 125000 },
                    { time: '2024-01-02', open: 1.0830, high: 1.0870, low: 1.0810, close: 1.0845, volume: 118000 },
                    { time: '2024-01-03', open: 1.0845, high: 1.0890, low: 1.0820, close: 1.0860, volume: 132000 },
                    { time: '2024-01-04', open: 1.0860, high: 1.0880, low: 1.0830, close: 1.0855, volume: 115000 },
                    { time: '2024-01-05', open: 1.0855, high: 1.0870, low: 1.0820, close: 1.0834, volume: 128000 },
                ],
                line: [1.0800, 1.0830, 1.0845, 1.0860, 1.0855, 1.0834],
                volume: [125000, 118000, 132000, 115000, 128000]
            },
            "BTC/USD": {
                candles: [
                    { time: '2024-01-01', open: 27500, high: 27800, low: 27400, close: 27650, volume: 45000 },
                    { time: '2024-01-02', open: 27650, high: 27900, low: 27500, close: 27780, volume: 52000 },
                    { time: '2024-01-03', open: 27780, high: 28100, low: 27600, close: 27950, volume: 48000 },
                    { time: '2024-01-04', open: 27950, high: 28200, low: 27800, close: 27500, volume: 61000 },
                    { time: '2024-01-05', open: 27500, high: 27700, low: 27300, close: 27540, volume: 55000 },
                ],
                line: [27500, 27650, 27780, 27950, 27500, 27540],
                volume: [45000, 52000, 48000, 61000, 55000]
            },
            "S&P 500": {
                candles: [
                    { time: '2024-01-01', open: 4180, high: 4210, low: 4170, close: 4195, volume: 2800000 },
                    { time: '2024-01-02', open: 4195, high: 4220, low: 4185, close: 4205, volume: 3100000 },
                    { time: '2024-01-03', open: 4205, high: 4230, low: 4190, close: 4215, volume: 2950000 },
                    { time: '2024-01-04', open: 4215, high: 4225, low: 4200, close: 4210, volume: 2750000 },
                    { time: '2024-01-05', open: 4210, high: 4220, low: 4195, close: 4210.5, volume: 2900000 },
                ],
                line: [4180, 4195, 4205, 4215, 4210, 4210.5],
                volume: [2800000, 3100000, 2950000, 2750000, 2900000]
            }
        };

        return baseData[assetName as keyof typeof baseData] || baseData["EUR/USD"];
    };

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#ffffff',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            crosshair: {
                mode: 1,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const data = getDetailedData(selectedAsset);

        if (chartType === 'candle') {
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#00d8ff',
                downColor: '#ff4444',
                borderVisible: false,
                wickUpColor: '#00d8ff',
                wickDownColor: '#ff4444',
            });
            candlestickSeries.setData(data.candles);
        } else if (chartType === 'area') {
            const areaSeries = chart.addSeries(AreaSeries, {
                topColor: 'rgba(0, 216, 255, 0.56)',
                bottomColor: 'rgba(0, 216, 255, 0.04)',
                lineColor: '#00d8ff',
                lineWidth: 2,
            });
            areaSeries.setData(data.candles.map(d => ({ time: d.time, value: d.close })));
        } else if (chartType === 'line') {
            const lineSeries = chart.addSeries(AreaSeries, {
                lineColor: '#00d8ff',
                lineWidth: 2,
                topColor: 'rgba(0, 216, 255, 0.0)',
                bottomColor: 'rgba(0, 216, 255, 0.0)',
            });
            lineSeries.setData(data.candles.map(d => ({ time: d.time, value: d.close })));
        }

        // Add volume chart if selected
        if (chartType === 'volume' && volumeChartRef.current) {
            const volumeChart = createChart(volumeChartRef.current, {
                width: volumeChartRef.current.clientWidth,
                height: 150,
                layout: {
                    background: { type: ColorType.Solid, color: 'transparent' },
                    textColor: '#ffffff',
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
                },
            });

            const volumeSeries = volumeChart.addSeries(HistogramSeries, {
                color: '#00d8ff',
                priceFormat: {
                    type: 'volume',
                },
            });
            volumeSeries.setData(data.candles.map(d => ({ time: d.time, value: d.volume })));

            return () => {
                chart.remove();
                volumeChart.remove();
            };
        }

        return () => chart.remove();
    }, [selectedAsset, chartType]);

    const marketNews = [
        {
            title: "Fed Signals Potential Rate Cuts in Q2",
            time: "2 hours ago",
            impact: "positive",
            category: "Economic"
        },
        {
            title: "Bitcoin Surges Past $28,000 Resistance",
            time: "4 hours ago",
            impact: "positive",
            category: "Crypto"
        },
        {
            title: "Oil Prices Drop on Supply Concerns",
            time: "6 hours ago",
            impact: "negative",
            category: "Commodities"
        },
        {
            title: "Tech Stocks Rally on AI Optimism",
            time: "8 hours ago",
            impact: "positive",
            category: "Stocks"
        }
    ];

    const assetCategories = [
        { name: "Forex", icon: <FaExchangeAlt />, count: 45, color: "from-blue-500 to-cyan-500" },
        { name: "Crypto", icon: <FaCoins />, count: 120, color: "from-orange-500 to-yellow-500" },
        { name: "Stocks", icon: <FaIndustry />, count: 8500, color: "from-green-500 to-emerald-500" },
        { name: "Indices", icon: <FaChartLine />, count: 25, color: "from-purple-500 to-pink-500" },
        { name: "Commodities", icon: <FaGasPump />, count: 18, color: "from-red-500 to-orange-500" }
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
                            Live <span className="text-accent">Markets</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
                            Access real-time market data, advanced charts, and comprehensive analysis across all major asset classes.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Market Overview */}
            <section className="py-8 sm:py-12 md:py-16 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-8 sm:mb-12"
                        {...fadeInUp}
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">Market Overview</h2>
                        <p className="text-sm sm:text-base text-white/80 max-w-3xl mx-auto">
                            Real-time prices and performance across major asset classes
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {marketOverview.map((asset, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300 cursor-pointer"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                                onClick={() => setSelectedAsset(asset.name)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {asset.icon}
                                        <div>
                                            <div className="text-white font-semibold">{asset.name}</div>
                                            <div className="text-white/60 text-sm">{asset.symbol}</div>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-medium ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {asset.change > 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="text-xl sm:text-2xl font-bold text-accent mb-2">{asset.price}</div>
                                <AssetCard {...asset} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Asset Categories */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Asset Classes</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Trade across diverse markets with our comprehensive platform
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {assetCategories.map((category, index) => (
                            <motion.div
                                key={index}
                                className={`bg-gradient-to-br ${category.color} p-6 rounded-xl text-white text-center hover:scale-105 transition-transform duration-300`}
                                variants={fadeInUp}
                            >
                                <div className="text-3xl mb-3">{category.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                                <p className="text-white/80">{category.count}+ Assets</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Advanced Chart Section */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Advanced Charts</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Professional-grade charting tools with multiple visualization options
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50"
                        {...fadeInUp}
                    >
                        {/* Chart Controls */}
                        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <select
                                    value={selectedAsset}
                                    onChange={(e) => setSelectedAsset(e.target.value)}
                                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
                                >
                                    {marketOverview.map(asset => (
                                        <option key={asset.name} value={asset.name}>{asset.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                {[
                                    { type: 'line', icon: <FaChartLine />, label: 'Line' },
                                    { type: 'area', icon: <FaChartArea />, label: 'Area' },
                                    { type: 'candle', icon: <FaChartBar />, label: 'Candlestick' },
                                    { type: 'volume', icon: <FaChartBar />, label: 'Volume' }
                                ].map(({ type, icon, label }) => (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type as any)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                            chartType === type
                                                ? 'bg-accent text-white'
                                                : 'bg-slate-700/50 text-white/70 hover:bg-slate-600/50'
                                        }`}
                                    >
                                        {icon}
                                        <span className="hidden sm:inline">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Chart */}
                        <div className="mb-4">
                            <div ref={chartContainerRef} className="w-full h-96 bg-slate-900/50 rounded-lg" />
                        </div>

                        {/* Volume Chart (only for volume type) */}
                        {chartType === 'volume' && (
                            <div>
                                <h4 className="text-white font-semibold mb-2">Volume</h4>
                                <div ref={volumeChartRef} className="w-full h-32 bg-slate-900/50 rounded-lg" />
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Market News */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="mx-auto max-w-7xl">
                    <motion.div
                        className="text-center mb-16"
                        {...fadeInUp}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Market News</h2>
                        <p className="text-lg text-white/80 max-w-3xl mx-auto">
                            Stay informed with the latest market developments and analysis
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {marketNews.map((news, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 hover:border-accent/50 transition-all duration-300"
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        news.impact === 'positive'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {news.category}
                                    </span>
                                    <span className="text-white/60 text-sm">{news.time}</span>
                                </div>
                                <h3 className="text-white font-semibold text-lg mb-2">{news.title}</h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                    news.impact === 'positive'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-red-500/10 text-red-400'
                                }`}>
                                    <span>{news.impact === 'positive' ? '↗' : '↘'}</span>
                                    <span>{news.impact}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Trading Tools CTA */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <motion.div {...fadeInUp}>
                        <FaGlobe className="text-5xl text-accent mx-auto mb-6" />
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Advanced Trading Tools</h2>
                        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            Access professional-grade tools, real-time data, and expert analysis to enhance your trading strategy.
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
                            >
                                View All Tools
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </motion.div>
    );
};

export default Markets;