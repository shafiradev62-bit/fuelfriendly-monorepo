# ⚡ Quick Start - Dual Version System

## 🚀 Jalankan Aplikasi

```bash
# Opsi 1: Jalankan keduanya sekaligus (Windows)
run-both-versions.bat

# Opsi 2: Manual
npm run dev:user          # UK/US Strict - Port 3000
npm run dev:fuelfriendly  # Global - Port 3001
```

## 🌐 Akses Aplikasi

- **UK/US Strict**: http://localhost:3000 (🇬🇧 Badge Biru)
- **Global**: http://localhost:3001 (🌍 Badge Hijau)

## 🔍 Perbedaan Utama

| Validasi | UK/US (3000) | Global (3001) |
|----------|--------------|---------------|
| Phone | ✅ Wajib | ❌ Opsional |
| Payment | ✅ Full | ❌ Disabled |
| Password | 12+ chars + special | 8+ chars |
| Age | 18+ | 16+ |

## 📦 File Penting

- `utils/validationRules.ts` - Aturan validasi (**JANGAN UBAH**)
- `utils/versionConfig.ts` - Config versi (**JANGAN UBAH**)
- `components/IOSInput.tsx` - Input dengan validasi
- `components/IOSButton.tsx` - Button iOS-style
- `styles/ios-animations.css` - Animasi iOS

## 🎨 Yang Ditambahkan

✅ iOS-style smooth animations
✅ Real validation system (berfungsi!)
✅ Version badge indicator
✅ Haptic feedback simulation
✅ Error shake animation
✅ Success bounce animation

## ❌ Yang TIDAK Diubah

❌ Layout (tetap sama)
❌ Design (tetap sama)
❌ Component structure
❌ Routing

## 📖 Dokumentasi Lengkap

Lihat `VALIDATION_SYSTEM.md` untuk dokumentasi lengkap dengan contoh code!
