import React from 'react';
import { motion } from 'framer-motion';

interface ProfessionalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProfessionalLogo: React.FC<ProfessionalLogoProps> = ({
  size = 'md',
  animated = true,
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', text: 'text-lg', icon: 'text-2xl' },
    md: { container: 'w-10 h-10', text: 'text-2xl', icon: 'text-3xl' },
    lg: { container: 'w-12 h-12', text: 'text-3xl', icon: 'text-4xl' },
  };

  const current = sizeMap[size];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  console.log(item);

  return (
    <motion.div
      className={`${current.container} relative flex items-center justify-center`}
      variants={animated ? container : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      {/* Outer gradient ring */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00D9FF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00A8E8', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          filter="url(#glow)"
        />

        {/* Inner design: upward arrow for growth */}
        <g filter="url(#glow)">
          {/* Vertical line */}
          <line
            x1="50"
            y1="65"
            x2="50"
            y2="35"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Arrow head - top point */}
          <polygon
            points="50,28 45,40 55,40"
            fill="url(#logoGradient)"
          />

          {/* Side accent lines for professional look */}
          <line
            x1="38"
            y1="50"
            x2="45"
            y2="50"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <line
            x1="55"
            y1="50"
            x2="62"
            y2="50"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
      </svg>

      {/* Animated background pulse */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
};

export const LogoWithText: React.FC<{ size?: 'sm' | 'md' | 'lg'; animated?: boolean }> = ({
  size = 'md',
  animated = true,
}) => {
  const textSizeMap = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={animated ? { opacity: 0 } : undefined}
      animate={animated ? { opacity: 1 } : undefined}
      transition={{ duration: 0.6 }}
    >
      <ProfessionalLogo size={size} animated={animated} />
      <div className="flex flex-col">
        <motion.span
          className={`${textSizeMap[size]} font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight`}
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          VPrime
        </motion.span>
        <motion.span
          className="text-xs text-blue-300 font-medium tracking-wider"
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Capital
        </motion.span>
      </div>
    </motion.div>
  );
};
