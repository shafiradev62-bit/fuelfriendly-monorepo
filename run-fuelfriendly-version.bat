@echo off
echo ========================================
echo Starting FUELFRIENDLY VERSION (Global Mode)
echo Port: 3001
echo ========================================
set VITE_VERSION_MODE=global
set VITE_APP_VERSION=global
npm run dev -- --port 3001
