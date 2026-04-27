import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import anime from 'animejs';

import tapAnimation from '../assets/animations/loading.json';

interface TapEffectButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  hapticFeedback?: boolean;
  scaleEffect?: boolean;
  rippleColor?: string;
}

const TapEffectButton = ({
  children,
  className = '',
  onClick,
  type,
  disabled,
  hapticFeedback = true,
  scaleEffect = true,
  rippleColor = 'rgba(58, 195, 108, 0.3)',
  ...props
}: TapEffectButtonProps) => {
  const [tapId, setTapId] = useState(0);
  const [showTap, setShowTap] = useState(false);
  const [ripples, setRipples] = useState<Array<{id: number, x: number, y: number}>>([]);
  const hideTimerRef = useRef<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  const triggerHapticFeedback = () => {
    if (hapticFeedback && window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(10); // Very light vibration
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 400);
  };

  const triggerTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    setTapId((v) => v + 1);
    setShowTap(true);
    triggerHapticFeedback();
    createRipple(e);
    
    // Subtle scale effect
    if (buttonRef.current && scaleEffect) {
      anime({
        targets: buttonRef.current,
        scale: [
          { value: 0.97, duration: 80, easing: 'easeInQuad' },
          { value: 1, duration: 120, easing: 'easeOutQuad' }
        ]
      });
    }
    
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setShowTap(false);
    }, 400);
  };

  const baseClasses = `
    relative overflow-hidden
    ${scaleEffect ? 'transform transition-all duration-100 ease-out active:scale-98' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <button
      ref={buttonRef}
      type={type ?? 'button'}
      className={`${baseClasses} ${className}`}
      disabled={disabled}
      onClick={(e) => {
        triggerTap(e);
        onClick?.(e);
      }}
      style={{
        touchAction: 'manipulation',
        userSelect: 'none',
      }}
      {...props}
    >
      <span className="relative inline-block">
        {/* Lottie Animation Overlay - Disabled for cleaner UX */}
        
        {/* Ripple Effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              backgroundColor: rippleColor,
              borderRadius: '50%',
              animation: 'ripple 0.4s ease-out',
            }}
          />
        ))}
        
        {children}
      </span>
    </button>
  );
};

// Add ripple animation to global styles - simplified
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    0% {
      width: 20px;
      height: 20px;
      opacity: 0.4;
    }
    100% {
      width: 80px;
      height: 80px;
      opacity: 0;
    }
  }
`;
if (!document.head.querySelector('style[data-ripple-animation]')) {
  style.setAttribute('data-ripple-animation', 'true');
  document.head.appendChild(style);
}

export default TapEffectButton;
