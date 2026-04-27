import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Ultra smooth easing curves
export const easings = {
  // iOS-style smooth spring
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  // Bouncy but professional
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  // Super smooth expo
  expo: [0.16, 1, 0.3, 1] as const,
  // Snappy for interactions
  snappy: [0.4, 0, 0.2, 1] as const,
  // Luxurious smooth
  luxurious: [0.6, 0.05, 0.01, 0.99] as const,
};

// Page transition variants - Simplified for better performance
export const pageVariants: Record<string, Variants> = {
  // Smooth slide from right (iOS style)
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.25,
        ease: easings.smooth,
        staggerChildren: 0.05,
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2, ease: easings.smooth }
    },
  },
  
  // Slide from bottom (modal style)
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: easings.smooth,
        staggerChildren: 0.04,
      }
    },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2, ease: easings.snappy }
    },
  },
  
  // Fade with scale (elegant)
  fadeScale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.25,
        ease: easings.smooth,
        staggerChildren: 0.04,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.2, ease: easings.smooth }
    },
  },
  
  // Slide from left (back navigation)
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.25,
        ease: easings.smooth,
        staggerChildren: 0.05,
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2, ease: easings.smooth }
    },
  },
  
  // Zoom with fade - simplified
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.25,
        ease: easings.smooth,
        staggerChildren: 0.04,
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.2, ease: easings.snappy }
    },
  },
};

// Child element variants for staggered animations - simplified
export const childVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.25,
      ease: easings.smooth,
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  },
};

// Card hover/tap variants - subtle
export const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.01,
    y: -2,
    transition: { duration: 0.2, ease: easings.smooth }
  },
  tap: { 
    scale: 0.99,
    transition: { duration: 0.1 }
  },
};

// Button interaction variants - subtle
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.15, ease: easings.smooth }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// Stagger container - reduced delays
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    }
  },
};

interface AnimatedPageProps {
  children: React.ReactNode;
  variant?: keyof typeof pageVariants;
  className?: string;
  mode?: 'wait' | 'sync' | 'popLayout';
  enableStagger?: boolean;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  variant = 'slideRight',
  className = '',
  mode = 'wait',
  enableStagger = true,
}) => {
  const selectedVariant = pageVariants[variant];

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={window.location.pathname}
        variants={enableStagger ? selectedVariant : undefined}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Animated child component for staggered lists
export const AnimatedChild: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = '', delay = 0 }) => (
  <motion.div
    variants={childVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ delay }}
    className={className}
    style={{ willChange: 'transform, opacity' }}
  >
    {children}
  </motion.div>
);

// Animated card component
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => (
  <motion.div
    variants={cardVariants}
    initial="initial"
    whileHover="hover"
    whileTap="tap"
    onClick={onClick}
    className={className}
    style={{ willChange: 'transform' }}
  >
    {children}
  </motion.div>
);

// Animated button component
export const AnimatedButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ children, className = '', onClick, disabled }) => (
  <motion.button
    variants={buttonVariants}
    initial="initial"
    whileHover={disabled ? undefined : "hover"}
    whileTap={disabled ? undefined : "tap"}
    onClick={onClick}
    disabled={disabled}
    className={className}
    style={{ willChange: 'transform' }}
  >
    {children}
  </motion.button>
);

export default AnimatedPage;