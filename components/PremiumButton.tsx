import React, { useEffect, useRef, useState, useCallback } from 'react';
import Lottie from 'lottie-react';

import tapAnimation from '../assets/animations/loading.json';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
  magnetic?: boolean;
  particles?: boolean;
  glow?: boolean;
  shine?: boolean;
  morphing?: boolean;
}

const PremiumButton = ({
  children,
  className = '',
  onClick,
  type,
  disabled,
  variant = 'primary',
  size = 'md',
  magnetic = true,
  particles = true,
  glow = true,
  shine = true,
  morphing = false,
  ...props
}: PremiumButtonProps) => {
  const [ripples, setRipples] = useState<Array<{id: number, x: number, y: number, delay?: number}>>([]);
  const [buttonParticles, setButtonParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, life: number}>>([]);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number>();

  // Simplified haptic feedback
  const triggerHapticFeedback = useCallback(() => {
    if (window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(10);
    }
  }, []);

  // Enhanced ripple system with multiple layers
  const createRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 400);
  }, []);

  // Particle system with physics
  const createParticles = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || !particles) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 3,
      life: 1.0
    }));
    
    setButtonParticles(prev => [...prev, ...newParticles]);
  }, [particles]);

  // Magnetic effect with smooth following
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current || !isHovered) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.2;
    const deltaY = (e.clientY - centerY) * 0.2;
    
    setMagneticOffset({ x: deltaX, y: deltaY });
  }, [magnetic, isHovered]);

  // Particle animation loop
  const animateParticles = useCallback(() => {
    setButtonParticles(prev => prev
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.3, // gravity
        life: particle.life - 0.02
      }))
      .filter(particle => particle.life > 0)
    );
    
    animationFrameRef.current = requestAnimationFrame(animateParticles);
  }, []);

  useEffect(() => {
    if (buttonParticles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [buttonParticles.length, animateParticles]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    triggerHapticFeedback();
    createRipple(e);
    createParticles(e);
    onClick?.(e);
  }, [disabled, triggerHapticFeedback, createRipple, createParticles, onClick]);

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    },
    luxury: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)',
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
    }
  };

  const sizeStyles = {
    sm: 'py-3 px-6 text-sm min-h-[44px]',
    md: 'py-4 px-8 text-base min-h-[52px]',
    lg: 'py-5 px-12 text-lg min-h-[60px]'
  };

  return (
    <button
      ref={buttonRef}
      type={type ?? 'button'}
      className={`
        relative overflow-hidden
        transform transition-all duration-200 ease-out
        active:scale-98
        rounded-2xl
        font-semibold
        text-white
        border-0
        cursor-pointer
        outline-none
        focus:ring-2 focus:ring-opacity-50
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        ...variantStyles[variant],
        transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px) ${isPressed ? 'scale(0.98)' : 'scale(1)'}`,
        transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        if (magnetic) triggerHapticFeedback();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setMagneticOffset({ x: 0, y: 0 });
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Ripple effects - simplified */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            animation: `premium-ripple 0.4s ease-out`,
          }}
        />
      ))}

      {/* Particle system - disabled for performance */}

      {/* Premium shine effect - disabled */}

      {/* Glow overlay - disabled */}

      {/* Morphing border - disabled */}
    </button>
  );
};

// Add premium animations to global styles - simplified
const premiumStyles = document.createElement('style');
premiumStyles.textContent = `
  @keyframes premium-ripple {
    0% {
      width: 20px;
      height: 20px;
      opacity: 0.5;
    }
    100% {
      width: 100px;
      height: 100px;
      opacity: 0;
    }
  }
`;

if (!document.head.querySelector('style[data-premium-button]')) {
  premiumStyles.setAttribute('data-premium-button', 'true');
  document.head.appendChild(premiumStyles);
}

export default PremiumButton;
