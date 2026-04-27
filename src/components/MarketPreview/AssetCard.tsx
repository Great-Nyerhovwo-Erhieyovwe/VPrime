import { useEffect, useRef } from "react";
import { createChart, LineStyle, ColorType, LineSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";
import { motion } from "framer-motion";

type AssetCardProps = {
  name: string;
  symbol: string;
  price: string;
  change: number; // percent
  data: number[]; // mock price series
};

export const AssetCard = ({
  name,
  symbol,
  price,
  change,
  data,
}: AssetCardProps) => {
  const chartContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: 150,
      height: 50,
      layout: { background: { type: ColorType.Solid, color: "transparent" } },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
    });

    const lineColor = change >= 0 ? "#4ade80" : "#ef4444";
    const series = chart.addSeries(LineSeries, {
      color: lineColor,
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
    });
    series.setData(data.map((v, i) => ({ time: i as UTCTimestamp, value: v })));

    return () => chart.remove();
  }, [data, change]);

  const changeColor = change >= 0 ? "text-green-400" : "text-red-400";

  return (
    <motion.div
      className="flex flex-col h-full p-4 sm:p-5 rounded-lg bg-gradient-to-br from-white/5 to-white/2 border border-white/10 hover:border-blue-400/30 transition-all duration-300 group"
      whileHover={{ y: -4, borderColor: "rgba(96, 165, 250, 0.3)" }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-white/60 mt-0.5">{symbol}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-2 sm:mb-3">
        <p className="text-lg sm:text-xl font-bold text-white">{price}</p>
      </div>

      {/* Change indicator */}
      <div className={`text-xs sm:text-sm font-semibold mb-3 sm:mb-4 ${changeColor}`}>
        {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
      </div>

      {/* Chart */}
      <div ref={chartContainer} className="flex-1 w-full" />
    </motion.div>
  );
};