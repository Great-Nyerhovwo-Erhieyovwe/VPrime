import { motion } from "framer-motion";
import type { IconType } from "react-icons";

type FeatureCardProps = {
  Icon: IconType;
  title: string;
  description: string;
};

export const FeatureCard = ({ Icon, title, description }: FeatureCardProps) => (
  <motion.div
    className="flex w-full flex-col items-center p-4 sm:p-6 text-center border border-white/20 shadow-lg rounded-lg hover:bg-white/5 transition-colors"
    whileHover={{ y: -5, scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Icon size={32} className="mb-3 sm:mb-4 text-accent sm:text-4xl" />
    <h3 className="mb-2 text-base sm:text-lg font-medium text-white">{title}</h3>
    <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{description}</p>
  </motion.div>
);