@echo off
chcp 65001 >nul
echo ==========================================
echo    FuelFriendly APK Builder
echo    Logo: ff logo 1.png ✅
echo ==========================================
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from the fuel-user-dev\frontend directory.
    pause
    exit /b 1
)

echo 🚀 Step 1: Building web app...
call npm run build
if errorlevel 1 (
    echo ❌ Web build failed!
    pause
    exit /b 1
)
echo ✅ Web build complete!
echo.

echo 🔄 Step 2: Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)
echo ✅ Capacitor sync complete!
echo.

echo 📱 Step 3: Building Android APK...
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

echo 🔨 Building release APK...
call .\gradlew assembleRelease
if errorlevel 1 (
    echo ❌ APK build failed!
    pause
    exit /b 1
)

echo ✅ APK built successfully!
echo.
echo 📦 Output location:
echo    app\build\outputs\apk\release\app-release-unsigned.apk
echo.
echo 📝 Next steps:
echo    1. Sign the APK or use app-debug.apk for testing
echo    2. Install on your device with:
echo       adb install app\build\outputs\apk\release\app-release-unsigned.apk
echo.

:: Return to original directory
cd ..

echo 🎉 All done! Press any key to exit.
pause
