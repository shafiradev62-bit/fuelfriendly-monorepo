import anime from 'animejs';

// iOS-style spring animation configs
export const iosSpring = {
  duration: 400,
  easing: 'spring(1, 80, 10, 0)',
};

export const iosQuick = {
  duration: 250,
  easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)',
};

export const iosBounce = {
  duration: 600,
  easing: 'spring(1, 100, 15, 0)',
};

// iOS-style haptic feedback simulation
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
    };
    navigator.vibrate(patterns[type]);
  }
};

// iOS-style button press animation
export const animateButtonPress = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 0.96, 1],
    duration: 200,
    easing: 'easeOutQuad',
  });
  hapticFeedback('light');
};

// iOS-style success animation
export const animateSuccess = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.05, 1],
    duration: 400,
    easing: 'spring(1, 80, 10, 0)',
  });
  hapticFeedback('medium');
};

// iOS-style error shake
export const animateError = (element: HTMLElement) => {
  anime({
    targets: element,
    translateX: [
      { value: -10, duration: 50 },
      { value: 10, duration: 50 },
      { value: -10, duration: 50 },
      { value: 10, duration: 50 },
      { value: 0, duration: 50 },
    ],
    easing: 'easeOutQuad',
  });
  hapticFeedback('heavy');
};

// iOS-style slide in from bottom
export const animateSlideUp = (element: HTMLElement, delay = 0) => {
  anime({
    targets: element,
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 400,
    delay,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)',
  });
};

// iOS-style fade in with scale
export const animateFadeScale = (element: HTMLElement, delay = 0) => {
  anime({
    targets: element,
    scale: [0.95, 1],
    opacity: [0, 1],
    duration: 350,
    delay,
    easing: 'cubicBezier(0.25, 0.46, 0.45, 0.94)',
  });
};

// Button click animations
export const animateButtonClick = (target: string