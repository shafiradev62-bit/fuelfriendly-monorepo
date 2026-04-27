import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertTriangle, 
  Sparkles,
  Zap,
  Gift,
  Trophy,
  Heart,
  Star,
  Bell,
  Rocket,
  Flame,
  Crown,
  Music,
  PartyPopper,
  ThumbsUp,
  Coffee,
  Crown as CrownIcon,
  type LucideIcon
} from 'lucide-react';

type SnackType = 'success' | 'error' | 'info' | 'warning' | 'achievement' | 'reward' | 'love' | 'celebration' | 'premium' | 'energy';
type SnackVariant = 'default' | 'gradient' | 'glass' | 'neon' | 'minimal' | 'floating' | 'pill' | 'banner';
type SnackPosition = 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left' | 'center';

interface Snack {
  id: string;
  message: string;
  title?: string;
  type: SnackType;
  variant: SnackVariant;
  position: SnackPosition;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: LucideIcon;
  progress?: boolean;
}

interface SnackContextType {
  showSnack: (options: {
    message: string;
    title?: string;
    type?: SnackType;
    variant?: SnackVariant;
    position?: SnackPosition;
    duration?: number;
    action?: { label: string; onClick: () => void };
    icon?: LucideIcon;
    progress?: boolean;
  }) => void;
  removeSnack: (id: string) => void;
  // Quick helpers
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  achievement: (message: string, title?: string) => void;
  reward: (message: string, title?: string) => void;
  celebration: (message: string, title?: string) => void;
  premium: (message: string, title?: string) => void;
  energy: (message: string, title?: string) => void;
}

const SnackContext = createContext<SnackContextType | null>(null);

export const useSnack = () => {
  const context = useContext(SnackContext);
  if (!context) {
    throw new Error('useSnack must be used within SnackProvider');
  }
  return context;
};

interface SnackProviderProps {
  children: ReactNode;
}

// Snack type configurations with diverse icons
const snackTypeConfig: Record<SnackType, { icon: LucideIcon; colors: string; gradient: string; sound?: string }> = {
  success: { 
    icon: CheckCircle, 
    colors: 'bg-emerald-500 text-white border-emerald-400',
    gradient: 'from-emerald-400 to-green-500',
  },
  error: { 
    icon: XCircle, 
    colors: 'bg-red-500 text-white border-red-400',
    gradient: 'from-red-400 to-rose-500',
  },
  info: { 
    icon: Info, 
    colors: 'bg-blue-500 text-white border-blue-400',
    gradient: 'from-blue-400 to-cyan-500',
  },
  warning: { 
    icon: AlertTriangle, 
    colors: 'bg-amber-500 text-white border-amber-400',
    gradient: 'from-amber-400 to-orange-500',
  },
  achievement: { 
    icon: Trophy, 
    colors: 'bg-yellow-500 text-white border-yellow-400',
    gradient: 'from-yellow-400 to-amber-500',
  },
  reward: { 
    icon: Gift, 
    colors: 'bg-purple-500 text-white border-purple-400',
    gradient: 'from-purple-400 to-pink-500',
  },
  love: { 
    icon: Heart, 
    colors: 'bg-pink-500 text-white border-pink-400',
    gradient: 'from-pink-400 to-rose-500',
  },
  celebration: { 
    icon: PartyPopper, 
    colors: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white',
    gradient: 'from-purple-400 via-pink-500 to-red-500',
  },
  premium: { 
    icon: Crown, 
    colors: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-white',
    gradient: 'from-amber-300 via-yellow-400 to-amber-500',
  },
  energy: { 
    icon: Zap, 
    colors: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
    gradient: 'from-cyan-400 to-blue-500',
  },
};

// Animation variants based on position
const getAnimationVariants = (position: SnackPosition) => {
  const isTop = position.includes('top');
  const isBottom = position.includes('bottom');
  const isLeft = position.includes('left');
  const isRight = position.includes('right');
  const isCenter = position === 'center';

  let initial: any = { opacity: 0, scale: 0.8 };
  let animate: any = { opacity: 1, scale: 1 };
  let exit: any = { opacity: 0, scale: 0.9 };

  if (isTop) {
    initial = { ...initial, y: -50 };
    animate = { ...animate, y: 0 };
    exit = { ...exit, y: -30 };
  } else if (isBottom) {
    initial = { ...initial, y: 50 };
    animate = { ...animate, y: 0 };
    exit = { ...exit, y: 30 };
  }

  if (isLeft) {
    initial = { ...initial, x: -50 };
    animate = { ...animate, x: 0 };
    exit = { ...exit, x: -30 };
  } else if (isRight) {
    initial = { ...initial, x: 50 };
    animate = { ...animate, x: 0 };
    exit = { ...exit, x: 30 };
  }

  if (isCenter) {
    initial = { opacity: 0, scale: 0.5, y: 20 };
    animate = { opacity: 1, scale: 1, y: 0 };
    exit = { opacity: 0, scale: 0.9, y: -20 };
  }

  return { initial, animate, exit };
};

// Get position styles
const getPositionStyles = (position: SnackPosition): string => {
  const base = 'fixed z-[9999] flex flex-col gap-2 pointer-events-none';
  
  switch (position) {
    case 'top':
      return `${base} top-4 left-1/2 -translate-x-1/2 items-center`;
    case 'top-right':
      return `${base} top-4 right-4 items-end`;
    case 'top-left':
      return `${base} top-4 left-4 items-start`;
    case 'bottom':
      return `${base} bottom-20 left-1/2 -translate-x-1/2 items-center`;
    case 'bottom-right':
      return `${base} bottom-20 right-4 items-end`;
    case 'bottom-left':
      return `${base} bottom-20 left-4 items-start`;
    case 'center':
      return `${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center`;
    default:
      return `${base} top-4 left-1/2 -translate-x-1/2 items-center`;
  }
};

// Get variant styles
const getVariantStyles = (variant: SnackVariant, type: SnackType): string => {
  const config = snackTypeConfig[type];
  
  switch (variant) {
    case 'gradient':
      return `bg-gradient-to-r ${config.gradient} text-white shadow-lg shadow-${type === 'success' ? 'emerald' : type === 'error' ? 'red' : 'blue'}-500/30`;
    case 'glass':
      return `bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-xl`;
    case 'neon':
      return `bg-gray-900 text-white border-2 border-${type === 'success' ? 'emerald' : type === 'error' ? 'red' : 'blue'}-500 shadow-[0_0_20px_rgba(var(--tw-shadow-color),0.5)]`;
    case 'minimal':
      return 'bg-transparent text-current';
    case 'floating':
      return `bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-2xl shadow-black/10 border border-gray-100 dark:border-gray-700`;
    case 'pill':
      return `bg-gray-900 text-white rounded-full px-6 py-3 shadow-lg`;
    case 'banner':
      return `w-full max-w-md ${config.colors} rounded-none sm:rounded-lg shadow-xl`;
    default:
      return `bg-white dark:bg-gray-800 border-l-4 border-${type === 'success' ? 'emerald' : type === 'error' ? 'red' : type === 'warning' ? 'amber' : 'blue'}-500 text-gray-900 dark:text-white shadow-lg`;
  }
};

// Single Snack Component
const SnackItem: React.FC<{ snack: Snack; onRemove: () => void }> = ({ snack, onRemove }) => {
  const config = snackTypeConfig[snack.type];
  const Icon = snack.icon || config.icon;
  const variants = getAnimationVariants(snack.position);
  const variantStyles = getVariantStyles(snack.variant, snack.type);

  return (
    <motion.div
      layout
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        mass: 0.8
      }}
      className={`pointer-events-auto ${variantStyles} ${
        snack.variant === 'minimal' ? '' : 'rounded-xl p-4'
      } min-w-[300px] max-w-md overflow-hidden relative`}
    >
      {/* Progress bar */}
      {snack.progress && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/50"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: snack.duration / 1000, ease: 'linear' }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className={`flex-shrink-0 ${snack.variant === 'gradient' || snack.variant === 'glass' ? 'text-white' : ''}`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          {snack.title && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`font-semibold text-sm ${
                snack.variant === 'minimal' ? 'text-gray-900 dark:text-white' : ''
              }`}
            >
              {snack.title}
            </motion.p>
          )}
          
          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-sm ${snack.title ? 'mt-0.5' : ''} ${
              snack.variant === 'gradient' || snack.variant === 'glass' 
                ? 'text-white/90' 
                : snack.variant === 'minimal'
                ? 'text-gray-600 dark:text-gray-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {snack.message}
          </motion.p>

          {/* Action button */}
          {snack.action && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                snack.action?.onClick();
                onRemove();
              }}
              className={`mt-2 text-sm font-medium ${
                snack.variant === 'gradient' || snack.variant === 'glass'
                  ? 'text-white underline underline-offset-2'
                  : 'text-blue-500 hover:text-blue-600'
              }`}
            >
              {snack.action.label}
            </motion.button>
          )}
        </div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRemove}
          className={`flex-shrink-0 p-1 rounded-full transition-colors ${
            snack.variant === 'gradient' || snack.variant === 'glass'
              ? 'hover:bg-white/20 text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600'
          }`}
        >
          <XCircle className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Decorative elements for special variants */}
      {snack.variant === 'gradient' && (
        <>
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        </>
      )}
      
      {snack.type === 'celebration' && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'][i],
                left: `${15 + i * 15}%`,
                bottom: '20%',
              }}
              animate={{
                y: [0, -60, 0],
                x: [0, (i % 2 === 0 ? 20 : -20), 0],
                opacity: [1, 0, 1],
                scale: [1, 1.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export function SnackProvider({ children }: SnackProviderProps) {
  const [snacks, setSnacks] = useState<Snack[]>([]);

  const removeSnack = useCallback((id: string) => {
    setSnacks(prev => prev.filter(s => s.id !== id));
  }, []);

  const showSnack = useCallback(({
    message,
    title,
    type = 'info',
    variant = 'default',
    position = 'top',
    duration = 4000,
    action,
    icon,
    progress = true,
  }: Parameters<SnackContextType['showSnack']>[0]) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSnack: Snack = {
      id,
      message,
      title,
      type,
      variant,
      position,
      duration,
      action,
      icon,
      progress,
    };

    setSnacks(prev => [...prev, newSnack]);

    setTimeout(() => {
      removeSnack(id);
    }, duration);
  }, [removeSnack]);

  // Quick helper functions
  const success = useCallback((message: string, title?: string) => {
    showSnack({ message, title, type: 'success', variant: 'gradient', position: 'top' });
  }, [showSnack]);

  const error = useCallback((message: string, title?: string) => {
    showSnack({ message, title, type: 'error', variant: 'default', position: 'top' });
  }, [showSnack]);

  const info = useCallback((message: string, title?: string) => {
    showSnack({ message, title, type: 'info', variant: 'floating', position: 'top' });
  }, [showSnack]);

  const warning = useCallback((message: string, title?: string) => {
    showSnack({ message, title, type: 'warning', variant: 'glass', position: 'top' });
  }, [showSnack]);

  const achievement = useCallback((message: string, title?: string) => {
    showSnack({ 
      message, 
      title: title || '🏆 Achievement Unlocked!', 
      type: 'achievement', 
      variant: 'gradient', 
      position: 'top',
      duration: 5000,
    });
  }, [showSnack]);

  const reward = useCallback((message: string, title?: string) => {
    showSnack({ 
      message, 
      title: title || '🎁 Reward!', 
      type: 'reward', 
      variant: 'gradient', 
      position: 'top',
      duration: 5000,
    });
  }, [showSnack]);

  const celebration = useCallback((message: string, title?: string) => {
    showSnack({ 
      message, 
      title: title || '🎉 Celebration!', 
      type: 'celebration', 
      variant: 'gradient', 
      position: 'center',
      duration: 6000,
    });
  }, [showSnack]);

  const premium = useCallback((message: string, title?: string) => {
    showSnack({ 
      message, 
      title: title || '👑 Premium', 
      type: 'premium', 
      variant: 'glass', 
      position: 'top',
      duration: 5000,
    });
  }, [showSnack]);

  const energy = useCallback((message: string, title?: string) => {
    showSnack({ 
      message, 
      title: title || '⚡ Energy Boost!', 
      type: 'energy', 
      variant: 'gradient', 
      position: 'bottom',
      duration: 4000,
    });
  }, [showSnack]);

  const value: SnackContextType = {
    showSnack,
    removeSnack,
    success,
    error,
    info,
    warning,
    achievement,
    reward,
    celebration,
    premium,
    energy,
  };

  // Group snacks by position
  const snacksByPosition = snacks.reduce((acc, snack) => {
    if (!acc[snack.position]) {
      acc[snack.position] = [];
    }
    acc[snack.position].push(snack);
    return acc;
  }, {} as Record<SnackPosition, Snack[]>);

  return (
    <SnackContext.Provider value={value}>
      {children}

      {/* Render snacks by position */}
      {Object.entries(snacksByPosition).map(([position, positionSnacks]) => (
        <div key={position} className={getPositionStyles(position as SnackPosition)}>
          <AnimatePresence mode="popLayout">
            {positionSnacks.map(snack => (
              <SnackItem
                key={snack.id}
                snack={snack}
                onRemove={() => removeSnack(snack.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </SnackContext.Provider>
  );
}

export default SnackProvider;
