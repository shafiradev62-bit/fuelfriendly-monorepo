import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  sweetButtonClick, 
  createHeartParticles, 
  sweetConfetti,
  createSparkles,
  sweetJellyBounce 
} from '../utils/sweetAnimations';

interface SweetButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'cute' | 'love' | 'sparkle';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  emoji?: string;
  sweetEffect?: 'hearts' | 'confetti' | 'sparkles' | 'all';
  className?: string;
}

const SweetButton: React.FC<SweetButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  emoji,
  sweetEffect = 'hearts',
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Sweet animations based on effect type
    if (sweetEffect === 'hearts' || sweetEffect === 'all') {
      createHeartParticles(x, y);
    }
    if (sweetEffect === 'confetti' || sweetEffect === 'all') {
      sweetConfetti(x, y);
    }
    if (sweetEffect === 'sparkles' || sweetEffect === 'all') {
      createSparkles(e.currentTarget);
    }

    // Button animation
    if (buttonRef.current) {
      sweetButtonClick(buttonRef.current);
    }

    setIsPressed(true);
    
    try {
      await onClick?.();
    } finally {
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const variants = {
    primary: 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-lg shadow-green-500/40',
    secondary: 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/40',
    cute: 'bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/40',
    love: 'bg-gradient-to-r from-red-400 via-pink-500 to-red-600 text-white shadow-lg shadow-red-500/40',
    sparkle: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative rounded-2xl font-semibold
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-300
        sweet-hover-lift
        flex items-center justify-center gap-2
        overflow-hidden
        ${className}
      `}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      whileHover={disabled || loading ? {} : { 
        scale: 1.03,
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
      }}
      animate={{
        scale: isPressed ? 0.95 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
    >
      {/* Sweet shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'linear',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {emoji && (
              <motion.span
                className="text-xl"
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                {emoji}
              </motion.span>
            )}
            
            {icon && (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.span>
            )}
            
            <span className="font-bold">{children}</span>
          </>
        )}
      </div>

      {/* Sweet glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0"
        whileHover={{ opacity: 1 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
        }}
      />
    </motion.button>
  );
};

export default SweetButton;
