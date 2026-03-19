import React, { forwardRef, useState, useRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, children, className = '', disabled, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleIdRef = useRef(0);

    const baseClasses = 'relative overflow-hidden inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:scale-[0.97]';

    // Add haptic feedback and ripple on click
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !isLoading) {
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }

        // Create ripple effect
        const button = buttonRef.current || e.currentTarget;
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
      
      props.onClick?.(e);
    };

    const variantClasses = {
      primary: 'bg-[#3AC36C] text-white hover:bg-[#2ea85a] focus:ring-[#3AC36C]/50 disabled:opacity-50 shadow-md hover:shadow-lg',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300 disabled:opacity-50 shadow-sm hover:shadow-md',
      outline: 'border-2 border-[#3AC36C] bg-transparent text-[#3AC36C] hover:bg-[#3AC36C] hover:text-white focus:ring-[#3AC36C]/50 disabled:opacity-50 shadow-sm',
      ghost: 'bg-transparent text-[#3AC36C] hover:bg-[#3AC36C]/10 focus:ring-[#3AC36C]/50 disabled:opacity-50',
      link: 'bg-transparent text-[#3AC36C] underline hover:text-[#2ea85a] focus:ring-[#3AC36C]/50 disabled:opacity-50',
    };

    const sizeClasses = {
      sm: 'text-sm py-2 px-4',
      md: 'text-base py-3 px-6',
      lg: 'text-lg py-4 px-8',
    };

    const disabledState = disabled || isLoading;

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabledState ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        disabled={disabledState}
        onClick={handleClick}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/40 pointer-events-none animate-ripple"
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
            animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;