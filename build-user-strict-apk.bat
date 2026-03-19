@echo off
chcp 65001 >nul
echo ==========================================
echo    USER VERSION STRICT BUILD
echo    Google Login - FAST MODE
echo    US_UK ONLY (NO GLOBAL)
echo ==========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from fuel-user-dev\frontend directory.
    pause
    exit /b 1
)

echo 🚀 Step 1: Verifying strict mode configuration...
findstr /C:"VITE_VERSION_MODE=strict" .env >nul
if errorlevel 1 (
    echo ⚠️ Setting .env to strict mode...
    echo VITE_VERSION_MODE=strict > .env
)
echo ✅ Strict mode confirmed!
echo.

echo 🔨 Step 2: Building web app...
call npm run build
if errorlevel 1 (
    echo ❌ Web build failed!
    pause
    exit /b 1
)
echo ✅ Web build complete!
echo.

echo 🔄 Step 3: Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)
echo ✅ Capacitor sync complete!
echo.

echo 📱 Step 4: Building Debug APK...
cd android
if errorlevel 1 (
    echo ❌ Could not enter android directory!
    pause
    exit /b 1
)

echo 🧹 Cleaning previous builds...
call .\gradlew clean
if errorlevel 1 (
    echo ⚠️ Clean failed, continuing anyway...
)

echo 🔨 Building debug APK...
call .\gradlew assembleDebug
if errorlevel 1 (
    echo ❌ APK build failed!
    pause
    exit /b 1
)

echo ✅ APK built successfully!
echo.
echo 📦 Output location:
echo    app\build\outputs\apk\debug\app-debug.apk
echo.

:: Return to original directory
cd ..

echo.
echo ==========================================
echo    BUILD COMPLETE!
echo ==========================================
echo.
echo ✅ USER VERSION STRICT MODE
echo ✅ Google Login: FAST (5s timeout)
echo ✅ Region: US_UK ONLY
echo ✅ TIN Validation: MANDATORY
echo.
echo Next steps:
echo 1. Copy APK to device
echo 2. Install and test Google login
echo 3. Verify it's FAST now!
echo.
pause
