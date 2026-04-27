import React, { useState, useRef, useEffect } from 'react';

interface TapEffectProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  haptic?: boolean;
  scaleEffect?: boolean;
}

const TapEffect: React.FC<TapEffectProps> = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  style,
  haptic = true,
  scaleEffect = true,
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const triggerHaptic = () => {
    if (haptic && window.navigator && 'vibrate' in window.navigator) {
      window.navigator.vibrate(10);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Haptic feedback
    triggerHaptic();

    // Create ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;

      setRipples((prev) => [...prev, { x, y, id }]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
      }, 600);
    }

    // Call original onClick
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      className={`relative overflow-hidden ${scaleEffect ? 'active:scale-95' : ''} transition-transform duration-150 ${className}`}
      onClick={handleClick}
      disabled={disabled}
      style={style}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      <style>{`
        @keyframes ripple {
          to {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </button>
  );
};

export default TapEffect;
