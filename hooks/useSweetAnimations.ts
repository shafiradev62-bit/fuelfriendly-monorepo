import { useEffect } from 'react';
import {
  sweetButtonClick,
  sweetFloat,
  sweetPulse,
  sweetShimmer,
  createHeartParticles,
  sweetWiggle,
  sweetGlow,
  sweetBounceIn,
  sweetWave,
  sweetJellyBounce,
} from '../utils/sweetAnimations';

// 🎀 Hook untuk auto-apply sweet animations
export const useSweetAnimations = () => {
  useEffect(() => {
    // 💚 Sweet button clicks
    const buttons = document.querySelectorAll('button, .ios-button, [role="button"]');
    buttons.forEach((button) => {
      const handleClick = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        sweetButtonClick(target);
        
        // Add heart particles on primary buttons
        if (target.classList.contains('bg-green-500') || 
            target.classList.contains('bg-gradient-to-r')) {
          const rect = target.getBoundingClientRect();
          createHeartParticles(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
          );
        }
      };
      
      button.addEventListener('click', handleClick);
    });

    // ✨ Sweet input focus
    const inputs = document.querySelectorAll('input, textarea, .ios-input');
    inputs.forEach((input) => {
      const handleFocus = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        sweetGlow(target, '#3AC36C');
      };
      
      input.addEventListener('focus', handleFocus);
    });

    // 🎈 Sweet float for cards
    const cards = document.querySelectorAll('.ios-card, [class*="card"]');
    cards.forEach((card, index) => {
      setTimeout(() => {
        sweetBounceIn(card as HTMLElement, index * 50);
      }, 100);
    });

    // 🌟 Sweet shimmer on hover for important elements
    const importantElements = document.querySelectorAll('.premium, .featured, [data-sweet="shimmer"]');
    importantElements.forEach((element) => {
      const handleMouseEnter = () => {
        sweetShimmer(element as HTMLElement);
      };
      
      element.addEventListener('mouseenter', handleMouseEnter);
    });

    // 💫 Sweet wiggle on error
    const errorElements = document.querySelectorAll('[class*="error"], [class*="danger"]');
    errorElements.forEach((element) => {
      sweetWiggle(element as HTMLElement);
    });

    // 🎵 Sweet wave for lists
    const listItems = document.querySelectorAll('.ios-list-item, li');
    if (listItems.length > 0) {
      sweetWave(listItems);
    }

    // Cleanup
    return () => {
      buttons.forEach((button) => {
        button.removeEventListener('click', () => {});
      });
      inputs.forEach((input) => {
        input.removeEventListener('focus', () => {});
      });
      importantElements.forEach((element) => {
        element.removeEventListener('mouseenter', () => {});
      });
    };
  }, []);
};

// 🎀 Hook untuk sweet scroll animations
export const useSweetScrollAnimations = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            sweetBounceIn(element);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    // Observe elements with sweet-scroll class
    const elements = document.querySelectorAll('[data-sweet-scroll]');
    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
};

// 💖 Hook untuk sweet success animations
export const useSweetSuccess = () => {
  const triggerSuccess = (element: HTMLElement) => {
    sweetJellyBounce(element);
    sweetGlow(element, '#22C55E');
    
    const rect = element.getBoundingClientRect();
    createHeartParticles(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
  };

  return { triggerSuccess };
};

// 🌸 Hook untuk sweet page transitions
export const useSweetPageTransition = () => {
  useEffect(() => {
    // Animate page entrance
    const mainContent = document.querySelector('main, [role="main"], .main-content');
    if (mainContent) {
      sweetBounceIn(mainContent as HTMLElement);
    }

    // Animate navigation items
    const navItems = document.querySelectorAll('nav a, .nav-item');
    navItems.forEach((item, index) => {
      setTimeout(() => {
        sweetBounceIn(item as HTMLElement);
      }, index * 50);
    });
  }, []);
};
