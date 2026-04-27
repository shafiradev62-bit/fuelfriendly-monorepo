import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../utils/animations';

interface IOSButtonProps {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const IOSButton: React.FC<IOSButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;
    
    hapticFeedback('medium');
    setIsPressed(true);
    
    try {
      await onClick?.();
    } finally {
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  const variants = {
    primary: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'bg-transparent border-2 border-green-500 text-green-600 hover:bg-green-50',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative rounded-xl font-semibold
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-200
        ios-button ios-ripple
        flex items-center justify-center gap-2
        ${className}
      `}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      animate={{
        scale: isPressed ? 0.96 : 1,
      }}
      transition={{
        duration: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
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
          {icon && iconPosition === 'left' && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.span>
          )}
          
          <span>{children}</span>
          
          {icon && iconPosition === 'right' && (
            <motion.span
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.span>
          )}
        </>
      )}
    </motion.button>
  );
};

export default IOSButton;
