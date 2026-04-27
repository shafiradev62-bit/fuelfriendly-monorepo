# 🔒 Sistem Validasi Dual Version - FuelFriendly

## 📋 Overview

Sistem ini mengimplementasikan **2 versi aplikasi yang berbeda** dengan validasi yang benar-benar berfungsi:

### 1. **UK/US Strict Version** (Port 3000)
- Mode: `strict` / `uk_us`
- Validasi ketat untuk pasar UK dan US
- Compliance dengan regulasi GDPR dan data protection

### 2. **Global Version** (Port 3001)
- Mode: `global`
- Validasi lebih longgar untuk pasar global
- Fleksibilitas lebih tinggi untuk user experience

---

## 🎯 Perbedaan Validasi

| Fitur | UK/US Strict | Global |
|-------|--------------|--------|
| **Email Verification** | ✅ Wajib | ✅ Wajib |
| **Phone Verification** | ✅ Wajib | ❌ Opsional |
| **Payment Validation** | ✅ Full (Luhn Algorithm) | ❌ Disabled |
| **Password Length** | 12+ karakter | 8+ karakter |
| **Special Characters** | ✅ Wajib (@$!%*?&) | ❌ Opsional |
| **Postcode Format** | UK/US Format | Any format (3+ chars) |
| **Phone Format** | UK/US Format | International |
| **Name Validation** | Letters only | Flexible |
| **Minimum Age** | 18+ tahun | 16+ tahun |
| **Currency** | GBP (£) | USD ($) |

---

## 📁 File Structure

```
fuelfriendly-monorepo-main/
├── utils/
│   ├── versionConfig.ts          # Konfigurasi versi (JANGAN UBAH)
│   ├── validationRules.ts        # Aturan validasi (JANGAN UBAH)
│   └── animations.ts              # iOS-style animations
├── components/
│   ├── IOSInput.tsx               # Input dengan animasi iOS
│   ├── IOSButton.tsx              # Button dengan animasi iOS
│   └── VersionBadge.tsx           # Badge penanda versi aktif
├── styles/
│   ├── ios-animations.css         # CSS animasi iOS-style
│   └── mobile-animations.css      # Animasi mobile existing
├── .env.strict                    # Environment untuk UK/US
├── .env.global                    # Environment untuk Global
└── VALIDATION_SYSTEM.md           # Dokumentasi ini
```

---

## 🚀 Cara Menggunakan

### Menjalankan Kedua Versi

```bash
# Terminal 1 - UK/US Strict Version
npm run dev:user

# Terminal 2 - Global Version  
npm run dev:fuelfriendly

# Atau jalankan keduanya sekaligus (Windows)
run-both-versions.bat
```

### Mengakses Aplikasi

- **UK/US Strict**: http://localhost:3000
- **Global**: http://localhost:3001

---

## 💻 Implementasi di Code

### 1. Menggunakan Validasi

```typescript
import { 
  validateEmail, 
  validatePhone, 
  validatePassword,
  validatePostcode,
  validatePaymentCard,
  validateForm 
} from '../utils/validationRules';

// Validasi individual
const emailResult = validateEmail('user@example.com');
if (!emailResult.valid) {
  console.error(emailResult.error);
}

// Validasi form lengkap
const formResult = validateForm({
  email: 'user@example.com',
  phone: '+447123456789',
  password: 'SecurePass123!',
  name: 'John Doe',
  postcode: 'SW1A 1AA'
});

if (!formResult.valid) {
  console.error(formResult.errors);
}
```

### 2. Menggunakan IOSInput Component

```typescript
import IOSInput from '../components/IOSInput';
import { validateEmail } from '../utils/validationRules';

const [email, setEmail] = useState('');
const [error, setError] = useState('');

const handleEmailChange = (value: string) => {
  setEmail(value);
  const result = validateEmail(value);
  setError(result.valid ? '' : result.error);
};

<IOSInput
  type="email"
  value={email}
  onChange={handleEmailChange}
  label="Email Address"
  placeholder="Enter your email"
  error={error}
  required
  icon={<MailIcon />}
/>
```

### 3. Menggunakan IOSButton Component

```typescript
import IOSButton from '../components/IOSButton';

<IOSButton
  variant="primary"
  size="lg"
  fullWidth
  loading={isLoading}
  onClick={handleSubmit}
  icon={<CheckIcon />}
>
  Submit
</IOSButton>
```

### 4. Cek Versi Aktif

```typescript
import { getAppVersion, APP_VERSION, VERSION_CONFIG } from '../utils/versionConfig';
import { getValidationRequirements } from '../utils/validationRules';

const version = getAppVersion();
const config = VERSION_CONFIG[version];
const requirements = getValidationRequirements();

if (version === APP_VERSION.UK_US) {
  console.log('Running UK/US Strict version');
  console.log('Password min length:', requirements.passwordMinLength); // 12
} else {
  console.log('Running Global version');
  console.log('Password min length:', requirements.passwordMinLength); // 8
}
```

---

## 🎨 iOS-Style Animations

### Animasi yang Tersedia

1. **Button Press** - Scale down saat ditekan
2. **Input Focus** - Scale up + shadow saat focus
3. **Error Shake** - Shake animation untuk error
4. **Success Bounce** - Bounce animation untuk success
5. **Slide Up** - Modal slide dari bawah
6. **Fade Scale** - Fade in dengan scale
7. **List Stagger** - Staggered animation untuk list items

### Cara Menggunakan

```typescript
import { 
  animateButtonPress, 
  animateError, 
  animateSuccess,
  hapticFeedback 
} from '../utils/animations';

// Button press dengan haptic
const handleClick = (e) => {
  animateButtonPress(e.currentTarget);
  hapticFeedback('medium');
};

// Error shake
const showError = (element) => {
  animateError(element);
};

// Success bounce
const showSuccess = (element) => {
  animateSuccess(element);
};
```

### CSS Classes

```html
<!-- iOS Button -->
<button className="ios-button ios-ripple">
  Click Me
</button>

<!-- iOS Card -->
<div className="ios-card">
  Card Content
</div>

<!-- iOS Input -->
<input className="ios-input" />

<!-- iOS List Item dengan Stagger -->
<div className="ios-list-item">Item 1</div>
<div className="ios-list-item">Item 2</div>
<div className="ios-list-item">Item 3</div>

<!-- iOS Blur Background -->
<div className="ios-blur">
  Blurred Background
</div>
```

---

## ⚠️ PENTING - JANGAN DIUBAH!

### File yang TIDAK BOLEH diubah:

1. **`utils/versionConfig.ts`** - Konfigurasi versi
2. **`utils/validationRules.ts`** - Aturan validasi
3. **`.env.strict`** - Environment UK/US
4. **`.env.global`** - Environment Global
5. **`vite.config.ts`** - Konfigurasi build

### Yang BOLEH diubah:

1. **Layout dan Design** - Bebas diubah sesuai kebutuhan
2. **Warna dan Typography** - Sesuaikan dengan brand
3. **Animasi timing** - Adjust speed di `styles/ios-animations.css`
4. **Component styling** - Tambahkan class CSS custom

---

## 🧪 Testing Validasi

### Test UK/US Strict Version (Port 3000)

```bash
# Email - Harus valid format
✅ user@example.com
❌ invalid-email

# Phone - Harus UK/US format
✅ +447123456789 (UK)
✅ +12025551234 (US)
❌ +628123456789 (Indonesia)

# Password - Min 12 chars + special
✅ SecurePass123!
❌ Short123! (terlalu pendek)
❌ NoSpecialChar123 (tidak ada special char)

# Postcode
✅ SW1A 1AA (UK)
✅ 12345 (US)
❌ 123 (terlalu pendek)

# Age
✅ 18+ tahun
❌ 17 tahun
```

### Test Global Version (Port 3001)

```bash
# Email - Harus valid format
✅ user@example.com
❌ invalid-email

# Phone - Opsional, format bebas
✅ +628123456789
✅ 08123456789
✅ (kosong juga OK)

# Password - Min 8 chars, no special required
✅ Password123
✅ SecurePass123!
❌ Short1 (terlalu pendek)

# Postcode - Opsional, format bebas
✅ 12345
✅ ABC123
✅ (kosong juga OK)

# Age
✅ 16+ tahun
❌ 15 tahun
```

---

## 🔍 Debugging

### Cek Versi yang Aktif

Buka browser console:

```javascript
// Cek environment variable
console.log(import.meta.env.VITE_VERSION_MODE);
console.log(import.meta.env.VITE_APP_VERSION);

// Cek versi dari config
import { getAppVersion } from './utils/versionConfig';
console.log(getAppVersion()); // 'uk_us' atau 'global'
```

### Lihat Badge Versi

Badge versi akan muncul di pojok kanan atas:
- 🇬🇧 **UK/US Strict** (biru) - Port 3000
- 🌍 **Global** (hijau) - Port 3001

Hover badge untuk melihat detail validasi yang aktif.

---

## 📝 Changelog

### Version 1.0.0 (Current)

✅ **Implemented:**
- Dual version system (UK/US Strict + Global)
- Real validation rules yang berfungsi
- iOS-style smooth animations
- Version badge indicator
- IOSInput component dengan real-time validation
- IOSButton component dengan haptic feedback
- Comprehensive validation system
- Environment-based configuration

❌ **NOT Changed:**
- Layout dan design (tetap sama)
- Component structure (tidak diubah)
- Routing (tidak diubah)
- API integration (tidak diubah)

---

## 🎯 Next Steps

Untuk menggunakan sistem validasi ini di form existing:

1. Import `IOSInput` dan `IOSButton` components
2. Import validation functions dari `validationRules.ts`
3. Tambahkan state untuk error handling
4. Implement real-time validation
5. Test di kedua versi (port 3000 dan 3001)

**Contoh lengkap ada di file ini, scroll ke atas untuk melihat implementasi!**

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Cek dokumentasi ini terlebih dahulu
2. Lihat contoh implementasi di section "Implementasi di Code"
3. Test di kedua versi untuk memastikan perbedaan validasi

**INGAT: JANGAN UBAH LAYOUT DAN DESIGN! Hanya animasi dan validasi yang ditambahkan.**
