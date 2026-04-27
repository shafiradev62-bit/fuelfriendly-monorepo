# Menjalankan Versi User dan FuelFriendly Secara Terpisah

Proyek ini memiliki 2 versi yang dapat dijalankan secara bersamaan di localhost:

## 🎯 Versi Aplikasi

### 1. **User Version (Strict Mode)**
- Port: `3000`
- URL: `http://localhost:3000`
- Mode: `strict` / `uk_us`
- Fitur:
  - ✅ Validasi ketat
  - ✅ Verifikasi email wajib
  - ✅ Verifikasi telepon wajib
  - ✅ Validasi pembayaran
  - 💷 Currency: GBP
  - 🌍 Timezone: Europe/London

### 2. **FuelFriendly Version (Global Mode)**
- Port: `3001`
- URL: `http://localhost:3001`
- Mode: `global`
- Fitur:
  - ❌ Validasi longgar
  - ✅ Verifikasi email wajib
  - ❌ Verifikasi telepon opsional
  - ❌ Validasi pembayaran opsional
  - 💵 Currency: USD
  - 🌍 Timezone: UTC

---

## 🚀 Cara Menjalankan

### Opsi 1: Menjalankan Kedua Versi Sekaligus (Recommended)

**Windows:**
```bash
# Double-click file ini atau jalankan di terminal
run-both-versions.bat
```

Ini akan membuka 2 terminal window:
- Window 1: User Version di port 3000
- Window 2: FuelFriendly Version di port 3001

**Linux/Mac:**
```bash
npm run dev:both
```

---

### Opsi 2: Menjalankan Satu per Satu

#### User Version (Strict)
```bash
# Windows
run-user-version.bat

# Linux/Mac
npm run dev:user
```

#### FuelFriendly Version (Global)
```bash
# Windows
run-fuelfriendly-version.bat

# Linux/Mac
npm run dev:fuelfriendly
```

---

## 📝 NPM Scripts Tersedia

```json
{
  "dev": "vite",                          // Default (port 3000)
  "dev:user": "vite --mode strict --port 3000",      // User version
  "dev:fuelfriendly": "vite --mode global --port 3001", // FuelFriendly version
  "dev:both": "concurrently \"npm run dev:user\" \"npm run dev:fuelfriendly\"" // Kedua versi
}
```

---

## 🔧 Environment Variables

### User Version (.env.strict)
```env
VITE_VERSION_MODE=strict
VITE_APP_VERSION=uk_us
```

### FuelFriendly Version (.env.global)
```env
VITE_VERSION_MODE=global
VITE_APP_VERSION=global
```

---

## 🧪 Testing Kedua Versi

1. Buka browser
2. Tab 1: `http://localhost:3000` (User Version)
3. Tab 2: `http://localhost:3001` (FuelFriendly Version)
4. Bandingkan perbedaan validasi dan fitur

---

## 🛑 Menghentikan Server

- **Windows**: Tekan `Ctrl+C` di setiap terminal window
- **Linux/Mac**: Tekan `Ctrl+C` di terminal

---

## 📦 Build untuk Production

### Build User Version
```bash
npm run build:strict
```

### Build FuelFriendly Version
```bash
npm run build:global
```

### Build Kedua Versi
```bash
npm run deploy:all
```

---

## 🐛 Troubleshooting

### Port sudah digunakan
Jika port 3000 atau 3001 sudah digunakan:
1. Tutup aplikasi yang menggunakan port tersebut
2. Atau edit file `vite.config.ts` untuk menggunakan port lain

### Environment variables tidak terbaca
1. Pastikan file `.env.strict` dan `.env.global` ada
2. Restart development server
3. Clear cache: `rm -rf node_modules/.vite`

---

## 📚 Dokumentasi Terkait

- [Vite Configuration](./vite.config.ts)
- [Version Config](./utils/versionConfig.ts)
- [Package.json](./package.json)
