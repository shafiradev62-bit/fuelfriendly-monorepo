import anime from 'animejs';

// 🎀 Sweet Particle Effects
export const createHeartParticles = (x: number, y: number) => {
  const hearts = ['💚', '💙', '💜', '🤍', '✨'];
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  for (let i = 0; i < 8; i++) {
    const heart = document.createElement('div');
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.position = 'absolute';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.fontSize = '20px';
    heart.style.userSelect = 'none';
    container.appendChild(heart);

    anime({
      targets: heart,
      translateX: anime.random(-100, 100),
      translateY: anime.random(-150, -50),
      opacity: [1, 0],
      scale: [0, 1.5],
      rotate: anime.random(-45, 45),
      duration: 1500,
      easing: 'easeOutCubic',
      complete: () => heart.remove(),
    });
  }

  setTimeout(() => container.remove(), 2000);
};

// 🌟 Sweet Sparkle Effect
export const createSparkles = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const sparkles = ['✨', '⭐', '💫', '🌟'];
  
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
    sparkle.style.position = 'fixed';
    sparkle.style.left = `${rect.left + rect.width / 2}px`;
    sparkle.style.top = `${rect.top + rect.height / 2}px`;
    sparkle.style.fontSize = '16px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    document.body.appendChild(sparkle);

    anime({
      targets: sparkle,
      translateX: anime.random(-80, 80),
      translateY: anime.random(-80, 80),
      opacity: [1, 0],
      scale: [0.5, 1.2],
      rotate: anime.random(0, 360),
      duration: 1200,
      easing: 'easeOutExpo',
      complete: () => sparkle.remove(),
    });
  }
};

// 💝 Sweet Button Click with Bounce
export const sweetButtonClick = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 0.92, 1.08, 1],
    duration: 500,
    easing: 'spring(1, 80, 10, 0)',
  });
  
  // Add sparkles
  createSparkles(element);
  
  // Haptic feedback
  if ('vibrate' in navigator) {
    navigator.vibrate(15);
  }
};

// 🎈 Sweet Float Animation
export const sweetFloat = (element: HTMLElement) => {
  anime({
    targets: element,
    translateY: [
      { value: -8, duration: 1500 },
      { value: 0, duration: 1500 },
    ],
    easing: 'easeInOutSine',
    loop: true,
  });
};

// 🌸 Sweet Pulse Animation
export const sweetPulse = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.05, 1],
    duration: 1500,
    easing: 'easeInOutQuad',
    loop: true,
  });
};

// 💫 Sweet Shimmer Effect
export const sweetShimmer = (element: HTMLElement) => {
  const shimmer = document.createElement('div');
  shimmer.style.position = 'absolute';
  shimmer.style.top = '0';
  shimmer.style.left = '-100%';
  shimmer.style.width = '100%';
  shimmer.style.height = '100%';
  shimmer.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)';
  shimmer.style.pointerEvents = 'none';
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(shimmer);

  anime({
    targets: shimmer,
    left: ['0%', '200%'],
    duration: 1500,
    easing: 'easeInOutQuad',
    complete: () => shimmer.remove(),
  });
};

// 🎊 Sweet Confetti Burst
export const sweetConfetti = (x: number, y: number) => {
  const colors = ['#3AC36C', '#4ADE80', '#22C55E', '#10B981', '#059669'];
  const shapes = ['●', '■', '▲', '★', '♥'];
  
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    confetti.style.position = 'fixed';
    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;
    confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.fontSize = '20px';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    document.body.appendChild(confetti);

    anime({
      targets: confetti,
      translateX: anime.random(-200, 200),
      translateY: [0, anime.random(200, 400)],
      opacity: [1, 0],
      rotate: anime.random(-720, 720),
      scale: [1, 0.5],
      duration: anime.random(1500, 2500),
      easing: 'easeOutCubic',
      complete: () => confetti.remove(),
    });
  }
};

// 🌈 Sweet Rainbow Trail
export const sweetRainbowTrail = (element: HTMLElement) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  let colorIndex = 0;

  const trail = document.createElement('div');
  trail.style.position = 'absolute';
  trail.style.width = '100%';
  trail.style.height = '100%';
  trail.style.top = '0';
  trail.style.left = '0';
  trail.style.borderRadius = 'inherit';
  trail.style.pointerEvents = 'none';
  trail.style.zIndex = '-1';
  
  element.style.position = 'relative';
  element.appendChild(trail);

  anime({
    targets: trail,
    backgroundColor: colors,
    duration: 3000,
    easing: 'linear',
    loop: true,
    update: () => {
      colorIndex = (colorIndex + 1) % colors.length;
    },
  });
};

// 🎀 Sweet Wiggle
export const sweetWiggle = (element: HTMLElement) => {
  anime({
    targets: element,
    rotate: [0, -5, 5, -5, 5, 0],
    duration: 500,
    easing: 'easeInOutSine',
  });
};

// 💖 Sweet Heart Beat
export const sweetHeartBeat = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [1, 1.15, 1, 1.15, 1],
    duration: 800,
    easing: 'easeInOutQuad',
  });
};

// ✨ Sweet Glow Effect
export const sweetGlow = (element: HTMLElement, color: string = '#3AC36C') => {
  anime({
    targets: element,
    boxShadow: [
      `0 0 0px ${color}`,
      `0 0 20px ${color}`,
      `0 0 0px ${color}`,
    ],
    duration: 1500,
    easing: 'easeInOutQuad',
  });
};

// 🌺 Sweet Bloom Animation
export const sweetBloom = (element: HTMLElement) => {
  anime({
    targets: element,
    scale: [0, 1.2, 1],
    rotate: [0, 360],
    opacity: [0, 1],
    duration: 800,
    easing: 'spring(1, 80, 10, 0)',
  });
};

// 🎵 Sweet Wave Animation
export const sweetWave = (elements: NodeListOf<Element> | Element[]) => {
  anime({
    targets: elements,
    translateY: [
      { value: -15, duration: 300 },
      { value: 0, duration: 300 },
    ],
    delay: anime.stagger(100),
    easing: 'easeInOutSine',
  });
};

// 🍭 Sweet Candy Pop
export const sweetCandyPop = (element: HTMLElement) => {
  const originalTransform = element.style.transform;
  
  anime.timeline()
    .add({
      targets: element,
      scale: [1, 0.8],
      duration: 100,
      easing: 'easeInQuad',
    })
    .add({
      targets: element,
      scale: [0.8, 1.3],
      duration: 200,
      easing: 'easeOutElastic(1, .5)',
    })
    .add({
      targets: element,
      scale: [1.3, 1],
      duration: 300,
      easing: 'easeOutElastic(1, .8)',
    });
  
  createSparkles(element);
};

// 🌙 Sweet Moonlight Glow
export const sweetMoonlightGlow = (element: HTMLElement) => {
  const glow = document.createElement('div');
  glow.style.position = 'absolute';
  glow.style.top = '-50%';
  glow.style.left = '-50%';
  glow.style.width = '200%';
  glow.style.height = '200%';
  glow.style.background = 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)';
  glow.style.pointerEvents = 'none';
  glow.style.opacity = '0';
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(glow);

  anime({
    targets: glow,
    opacity: [0, 1, 0],
    scale: [0.5, 1.5],
    duration: 2000,
    easing: 'easeInOutQuad',
    complete: () => glow.remove(),
  });
};

// 🎪 Sweet Bounce In
export const sweetBounceIn = (element: HTMLElement, delay: number = 0) => {
  anime({
    targets: element,
    scale: [0, 1.1, 0.9, 1.05, 1],
    opacity: [0, 1],
    duration: 800,
    delay,
    easing: 'easeOutElastic(1, .6)',
  });
};

// 🌟 Sweet Star Burst
export const sweetStarBurst = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  for (let i = 0; i < 12; i++) {
    const star = document.createElement('div');
    star.textContent = '⭐';
    star.style.position = 'fixed';
    star.style.left = `${centerX}px`;
    star.style.top = `${centerY}px`;
    star.style.fontSize = '24px';
    star.style.pointerEvents = 'none';
    star.style.zIndex = '9999';
    document.body.appendChild(star);

    const angle = (i / 12) * Math.PI * 2;
    const distance = 150;

    anime({
      targets: star,
      translateX: Math.cos(angle) * distance,
      translateY: Math.sin(angle) * distance,
      opacity: [1, 0],
      scale: [0.5, 1.5],
      rotate: 360,
      duration: 1000,
      easing: 'easeOutExpo',
      complete: () => star.remove(),
    });
  }
};

// 🎨 Sweet Color Morph
export const sweetColorMorph = (element: HTMLElement) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#3AC36C'];
  
  anime({
    targets: element,
    backgroundColor: colors,
    duration: 5000,
    easing: 'linear',
    loop: true,
  });
};

// 🦋 Sweet Butterfly Effect
export const sweetButterflyEffect = (element: HTMLElement) => {
  anime({
    targets: element,
    translateX: [
      { value: 10, duration: 200 },
      { value: -10, duration: 200 },
      { value: 10, duration: 200 },
      { value: 0, duration: 200 },
    ],
    translateY: [
      { value: -5, duration: 200 },
      { value: -10, duration: 200 },
      { value: -5, duration: 200 },
      { value: 0, duration: 200 },
    ],
    rotate: [
      { value: 5, duration: 200 },
      { value: -5, duration: 200 },
      { value: 5, duration: 200 },
      { value: 0, duration: 200 },
    ],
    easing: 'easeInOutSine',
  });
};

// 🎁 Sweet Gift Unwrap
export const sweetGiftUnwrap = (element: HTMLElement, callback?: () => void) => {
  anime.timeline()
    .add({
      targets: element,
      rotateY: [0, 180],
      duration: 400,
      easing: 'easeInOutQuad',
    })
    .add({
      targets: element,
      scale: [1, 1.2, 1],
      duration: 400,
      easing: 'easeOutElastic(1, .5)',
      complete: () => {
        sweetConfetti(
          element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2,
          element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2
        );
        callback?.();
      },
    });
};

// 🌸 Sweet Petal Fall
export const sweetPetalFall = () => {
  const petals = ['🌸', '🌺', '🌼', '🌻', '🌷'];
  
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const petal = document.createElement('div');
      petal.textContent = petals[Math.floor(Math.random() * petals.length)];
      petal.style.position = 'fixed';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.top = '-50px';
      petal.style.fontSize = '30px';
      petal.style.pointerEvents = 'none';
      petal.style.zIndex = '9999';
      document.body.appendChild(petal);

      anime({
        targets: petal,
        translateY: window.innerHeight + 100,
        translateX: anime.random(-100, 100),
        rotate: anime.random(-360, 360),
        opacity: [1, 0.8, 0],
        duration: anime.random(3000, 5000),
        easing: 'easeInOutSine',
        complete: () => petal.remove(),
      });
    }, i * 300);
  }
};

// 💝 Sweet Love Pulse
export const sweetLovePulse = (element: HTMLElement) => {
  const heart = document.createElement('div');
  heart.textContent = '💚';
  heart.style.position = 'absolute';
  heart.style.top = '50%';
  heart.style.left = '50%';
  heart.style.transform = 'translate(-50%, -50%)';
  heart.style.fontSize = '40px';
  heart.style.pointerEvents = 'none';
  heart.style.zIndex = '10';
  
  element.style.position = 'relative';
  element.appendChild(heart);

  anime({
    targets: heart,
    scale: [0, 1.5],
    opacity: [1, 0],
    duration: 1000,
    easing: 'easeOutExpo',
    complete: () => heart.remove(),
  });
};

// 🎪 Sweet Jelly Bounce
export const sweetJellyBounce = (element: HTMLElement) => {
  anime({
    targets: element,
    scaleX: [1, 1.25, 0.75, 1.15, 1],
    scaleY: [1, 0.75, 1.25, 0.85, 1],
    duration: 600,
    easing: 'easeOutElastic(1, .5)',
  });
};
