import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const GlassCard = ({ children, className = '', hover = true, onClick }: GlassCardProps) => {
    return (
        <motion.div
            onClick={onClick}
            className={`
        relative overflow-hidden
        bg-white/5 backdrop-blur-xl 
        border border-white/10 
        rounded-2xl
        ${hover ? 'hover:bg-white/10 hover:border-white/20' : ''}
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            whileHover={hover ? { y: -2, scale: 1.01 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            {children}
        </motion.div>
    );
};