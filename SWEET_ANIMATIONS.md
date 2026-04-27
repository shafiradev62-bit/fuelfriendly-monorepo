# 🎀 Sweet Animations Guide

## ✨ Overview

Sweet animations yang cute dan smooth untuk membuat aplikasi lebih menarik dan menyenangkan! Semua animasi ini **TIDAK mengubah layout**, hanya menambahkan efek visual yang manis.

---

## 🎨 Available Sweet Animations

### 1. **Heart Particles** 💚
Partikel hati yang muncul saat klik button
```typescript
import { createHeartParticles } from '../utils/sweetAnimations';

// Trigger on click
createHeartParticles(x, y);
```

### 2. **Sparkles** ✨
Efek sparkle yang berkilauan
```typescript
import { createSparkles } from '../utils/sweetAnimations';

createSparkles(element);
```

### 3. **Confetti Burst** 🎊
Confetti meledak untuk celebrate
```typescript
import { sweetConfetti } from '../utils/sweetAnimations';

sweetConfetti(x, y);
```

### 4. **Sweet Button Click** 🎀
Button bounce dengan sparkles
```typescript
import { sweetButtonClick } from '../utils/sweetAnimations';

sweetButtonClick(element);
```

### 5. **Sweet Float** 🎈
Floating animation smooth
```typescript
import { sweetFloat } from '../utils/sweetAnimations';

sweetFloat(element);
```

### 6. **Sweet Pulse** 💓
Pulse animation seperti heartbeat
```typescript
import { sweetPulse } from '../utils/sweetAnimations';

sweetPulse(element);
```

### 7. **Sweet Shimmer** 💫
Shimmer effect yang berkilau
```typescript
import { sweetShimmer } from '../utils/sweetAnimations';

sweetShimmer(element);
```

### 8. **Sweet Wiggle** 🌸
Wiggle animation cute
```typescript
import { sweetWiggle } from '../utils/sweetAnimations';

sweetWiggle(element);
```

### 9. **Sweet Glow** 🌟
Glow effect dengan warna custom
```typescript
import { sweetGlow } from '../utils/sweetAnimations';

sweetGlow(element, '#3AC36C');
```

### 10. **Sweet Bounce In** 🎪
Bounce in animation saat element muncul
```typescript
import { sweetBounceIn } from '../utils/sweetAnimations';

sweetBounceIn(element, delay);
```

### 11. **Sweet Jelly Bounce** 🍮
Jelly-like bounce animation
```typescript
import { sweetJellyBounce } from '../utils/sweetAnimations';

sweetJellyBounce(element);
```

### 12. **Sweet Star Burst** ⭐
Bintang meledak dari center
```typescript
import { sweetStarBurst } from '../utils/sweetAnimations';

sweetStarBurst(element);
```

### 13. **Sweet Petal Fall** 🌸
Bunga jatuh dari atas
```typescript
import { sweetPetalFall } from '../utils/sweetAnimations';

sweetPetalFall();
```

### 14. **Sweet Gift Unwrap** 🎁
Animasi buka hadiah
```typescript
import { sweetGiftUnwrap } from '../utils/sweetAnimations';

sweetGiftUnwrap(element, callback);
```

---

## 🎯 Using Sweet Components

### SweetButton Component

```typescript
import SweetButton from '../components/SweetButton';

<SweetButton
  variant="primary"      // primary | secondary | cute | love | sparkle
  size="lg"              // sm | md | lg
  emoji="💚"
  sweetEffect="all"      // hearts | confetti | sparkles | all
  onClick={handleClick}
>
  Click Me!
</SweetButton>
```

**Variants:**
- `primary` - Green gradient 💚
- `secondary` - Purple gradient 💜
- `cute` - Pink gradient 💗
- `love` - Red/Pink gradient ❤️
- `sparkle` - Yellow/Orange gradient ✨

**Sweet Effects:**
- `hearts` - Heart particles
- `confetti` - Confetti burst
- `sparkles` - Sparkle effect
- `all` - Semua efek sekaligus!

---

## 🎨 CSS Classes

### Animation Classes

```html
<!-- Float Animation -->
<div class="sweet-float">Floating element</div>

<!-- Pulse Animation -->
<div class="sweet-pulse">Pulsing element</div>

<!-- Glow Effect -->
<div class="sweet-glow">Glowing element</div>

<!-- Bounce Animation -->
<div class="sweet-bounce">Bouncing element</div>

<!-- Wiggle Animation -->
<div class="sweet-wiggle">Wiggling element</div>

<!-- Heartbeat Animation -->
<div class="sweet-heartbeat">Heartbeat element</div>

<!-- Shimmer Effect -->
<div class="sweet-shimmer">Shimmering element</div>

<!-- Jelly Animation -->
<div class="sweet-jelly">Jelly element</div>

<!-- Tada Animation -->
<div class="sweet-tada">Tada element</div>

<!-- Rubber Band -->
<div class="sweet-rubber-band">Rubber band element</div>
```

### Hover Effects

```html
<!-- Lift on Hover -->
<div class="sweet-hover-lift">Hover me</div>

<!-- Grow on Hover -->
<div class="sweet-hover-grow">Hover me</div>

<!-- Glow on Hover -->
<div class="sweet-hover-glow">Hover me</div>
```

### Gradient Backgrounds

```html
<div class="sweet-gradient-1">Purple gradient</div>
<div class="sweet-gradient-2">Pink gradient</div>
<div class="sweet-gradient-3">Blue gradient</div>
<div class="sweet-gradient-4">Green gradient</div>
<div class="sweet-gradient-5">Orange gradient</div>
```

### Glass Effect

```html
<div class="sweet-glass">
  Glass morphism effect
</div>
```

### Neon Glow Text

```html
<h1 class="sweet-neon">Neon Text</h1>
```

---

## 🎀 React Hooks

### useSweetAnimations

Auto-apply sweet animations ke semua element

```typescript
import { useSweetAnimations } from '../hooks/useSweetAnimations';

function MyComponent() {
  useSweetAnimations(); // Auto-apply ke buttons, inputs, cards
  
  return <div>...</div>;
}
```

**Auto-applies to:**
- ✅ Buttons - Sweet click animation + heart particles
- ✅ Inputs - Sweet glow on focus
- ✅ Cards - Sweet bounce in
- ✅ Lists - Sweet wave animation
- ✅ Errors - Sweet wiggle

### useSweetScrollAnimations

Animate elements saat scroll into view

```typescript
import { useSweetScrollAnimations } from '../hooks/useSweetAnimations';

function MyComponent() {
  useSweetScrollAnimations();
  
  return (
    <div data-sweet-scroll>
      This will animate when scrolled into view
    </div>
  );
}
```

### useSweetSuccess

Trigger success animation

```typescript
import { useSweetSuccess } from '../hooks/useSweetAnimations';

function MyComponent() {
  const { triggerSuccess } = useSweetSuccess();
  
  const handleSuccess = () => {
    const element = document.getElementById('my-element');
    if (element) {
      triggerSuccess(element);
    }
  };
  
  return <button onClick={handleSuccess}>Success!</button>;
}
```

---

## 🎪 Examples

### Example 1: Sweet Button with Hearts

```typescript
<SweetButton
  variant="love"
  emoji="💚"
  sweetEffect="hearts"
  onClick={() => console.log('Clicked!')}
>
  Love This!
</SweetButton>
```

### Example 2: Sweet Card with Float

```typescript
<div className="sweet-float sweet-hover-lift p-6 rounded-xl bg-white shadow-lg">
  <h3>Floating Card</h3>
  <p>This card floats smoothly!</p>
</div>
```

### Example 3: Sweet Input with Glow

```typescript
<input
  className="sweet-hover-glow px-4 py-2 rounded-lg border-2"
  placeholder="Type something..."
  onFocus={(e) => sweetGlow(e.currentTarget)}
/>
```

### Example 4: Sweet Success Message

```typescript
const showSuccess = () => {
  const message = document.getElementById('success-message');
  if (message) {
    sweetBounceIn(message);
    sweetGlow(message, '#22C55E');
    createSparkles(message);
  }
};
```

### Example 5: Sweet Celebration

```typescript
const celebrate = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  sweetConfetti(x, y);
  createHeartParticles(x, y);
  sweetPetalFall();
};
```

---

## 🎨 Customization

### Custom Colors

```typescript
// Custom glow color
sweetGlow(element, '#FF69B4'); // Pink glow

// Custom gradient
<div className="bg-gradient-to-r from-purple-400 to-pink-600">
  Custom gradient
</div>
```

### Custom Timing

```typescript
// Adjust animation speed in CSS
.my-custom-animation {
  animation-duration: 2s; /* Slower */
  animation-timing-function: ease-in-out;
}
```

---

## ⚠️ Important Notes

### ✅ DO:
- Use sweet animations untuk enhance user experience
- Combine multiple animations untuk efek yang lebih wow
- Test di mobile untuk memastikan smooth
- Use sparingly - jangan terlalu banyak animasi sekaligus

### ❌ DON'T:
- Jangan ubah layout atau structure
- Jangan overuse - bisa bikin dizzy
- Jangan animate terlalu banyak element sekaligus
- Jangan lupa test performance

---

## 🎯 Performance Tips

1. **Use CSS animations** untuk simple animations
2. **Use JavaScript animations** untuk complex interactions
3. **Debounce** animations yang trigger sering
4. **Remove elements** setelah animation selesai
5. **Use `will-change`** untuk smooth animations

```css
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* Hardware acceleration */
}
```

---

## 🌟 Best Practices

### 1. Button Clicks
```typescript
// Good - Sweet and responsive
<SweetButton sweetEffect="hearts">Click Me</SweetButton>

// Better - With emoji
<SweetButton emoji="💚" sweetEffect="all">Love It!</SweetButton>
```

### 2. Success Messages
```typescript
// Good - Clear feedback
sweetBounceIn(element);
sweetGlow(element, '#22C55E');

// Better - With particles
sweetBounceIn(element);
sweetGlow(element, '#22C55E');
createSparkles(element);
```

### 3. Page Transitions
```typescript
// Good - Smooth entrance
useSweetPageTransition();

// Better - With scroll animations
useSweetPageTransition();
useSweetScrollAnimations();
```

---

## 🎊 Special Effects

### Celebration Mode

```typescript
const celebrationMode = () => {
  sweetPetalFall();
  
  setTimeout(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      setTimeout(() => {
        sweetStarBurst(btn as HTMLElement);
      }, i * 200);
    });
  }, 500);
};
```

### Rainbow Mode

```typescript
const rainbowMode = (element: HTMLElement) => {
  sweetColorMorph(element);
  sweetRainbowTrail(element);
};
```

---

## 📱 Mobile Optimization

Sweet animations sudah optimized untuk mobile:
- ✅ Touch-friendly
- ✅ Haptic feedback support
- ✅ Smooth 60fps
- ✅ Battery efficient

---

## 🎀 Summary

Sweet animations membuat aplikasi lebih:
- 💚 **Engaging** - User lebih enjoy
- ✨ **Delightful** - Pengalaman yang menyenangkan
- 🎨 **Beautiful** - Visual yang menarik
- 🚀 **Modern** - Feel yang up-to-date

**Remember: Layout TIDAK berubah, hanya animasi yang ditambahkan!**

---

## 📞 Quick Reference

```typescript
// Import animations
import {
  createHeartParticles,
  createSparkles,
  sweetConfetti,
  sweetButtonClick,
  sweetGlow,
  sweetBounceIn,
} from '../utils/sweetAnimations';

// Import components
import SweetButton from '../components/SweetButton';

// Import hooks
import { useSweetAnimations } from '../hooks/useSweetAnimations';

// Use in component
function MyComponent() {
  useSweetAnimations();
  
  return (
    <SweetButton
      variant="primary"
      emoji="💚"
      sweetEffect="all"
    >
      Sweet!
    </SweetButton>
  );
}
```

**Enjoy your sweet animations! 🎀✨💚**
