@echo off
echo ========================================
echo Starting USER VERSION (Strict Mode)
echo Port: 3000
echo ========================================
set VITE_VERSION_MODE=strict
set VITE_APP_VERSION=uk_us
npm run dev
