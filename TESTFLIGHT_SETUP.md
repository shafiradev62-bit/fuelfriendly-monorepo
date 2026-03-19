# 📱 TestFlight Setup Guide - Fuel Friend iOS App

## ✅ Setup Completed by AI

The following configurations have been set up for TestFlight distribution:

### 1. **Capacitor Configuration** (`capacitor.config.ts`)
- ✅ App ID: `com.fuelfriend.app` (Bundle Identifier for App Store)
- ✅ App Name: `Fuel Friend`
- ✅ iOS scheme configured to `https`
- ✅ Google Auth placeholder for iOS client ID
- ✅ SplashScreen configured for iOS
- ✅ Minimum iOS version: 15.0 (TestFlight requirement)

### 2. **Package.json Scripts**
Added iOS-specific build commands:
```bash
# Build web assets and sync to iOS
npm run ios:build

# Open Xcode project
npm run ios:open

# Run on iOS simulator/device
npm run ios:run

# Sync iOS project
npm run ios:sync

# Clean iOS build
npm run ios:clean

# Prepare for TestFlight (build + sync)
npm run testflight:prepare
```

---

## 🔧 Next Steps for iOS Programmer

### Step 1: Install iOS Dependencies
```bash
# Make sure you have CocoaPods installed
sudo gem install cocoapods

# Navigate to iOS directory
cd ios/App

# Install CocoaPods dependencies
pod install

# Return to root
cd ../..
```

### Step 2: Build and Sync iOS Project
```bash
# Build web assets and sync to iOS
npm run testflight:prepare

# This will:
# 1. Build the Vite web app to 'dist' folder
# 2. Sync all Capacitor plugins to iOS project
# 3. Update iOS configuration
```

### Step 3: Open in Xcode
```bash
# Open Xcode workspace (NOT .xcodeproj)
npm run ios:open

# Or manually open: ios/App/App.xcworkspace
```

### Step 4: Configure Xcode for TestFlight

#### A. Signing & Capabilities
1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account required)
4. Ensure **Bundle Identifier** is: `com.fuelfriend.app`
5. Enable **Automatic signing** or configure manual signing

#### B. General Settings
1. **Display Name**: `Fuel Friend`
2. **Deployment Target**: Set to `iOS 15.0` or higher
3. **Device Orientation**: 
   - ✅ Portrait
   - ❌ Landscape (unless needed)

#### C. Required Permissions (Info.plist)
Add these keys to `ios/App/App/Info.plist`:

```xml
<!-- Camera Permission (for QR Scanner) -->
<key>NSCameraUsageDescription</key>
<string>Fuel Friend needs camera access to scan QR codes for order completion</string>

<!-- Photo Library Permission (optional, for image upload) -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Fuel Friend needs photo library access to upload images for QR scanning</string>

<!-- Location Permission (for delivery tracking) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Fuel Friend needs your location to track fuel delivery</string>

<!-- Google Sign-In URL Scheme -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <!-- Replace with your actual reversed iOS client ID -->
      <string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
    </array>
  </dict>
</array>

<!-- Google Client ID -->
<key>GIDClientID</key>
<string>YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com</string>
```

#### D. Google Sign-In Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new **iOS Client ID**:
   - Bundle ID: `com.fuelfriend.app`
   - App Store ID: (leave blank for TestFlight)
3. Download the `.plist` file
4. Copy the **reversed client ID** (e.g., `com.googleusercontent.apps.xxxxx`)
5. Update `capacitor.config.ts`:
   ```typescript
   GoogleAuth: {
     iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
     // ...
   }
   ```
6. Add the reversed client ID to `Info.plist` as shown above

### Step 5: Build for TestFlight

#### A. Select Generic iOS Device
1. In Xcode, select **Any iOS Device (arm64)** from device list
2. Do NOT select a simulator

#### B. Archive the App
1. Go to **Product** → **Archive**
2. Wait for the archive process to complete (5-15 minutes)
3. **Organizer** window will open automatically

#### C. Distribute to TestFlight
1. In Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Choose **Upload** (not Export)
5. Keep default options:
   - ✅ Upload your app's symbols
   - ✅ Include bitcode (if enabled)
6. Click **Upload**
7. Wait for upload to complete

### Step 6: TestFlight Configuration (App Store Connect)

#### A. App Store Connect Setup
1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **My Apps** → **Fuel Friend**
3. Go to **TestFlight** tab

#### B. Add Build Information
1. Wait for Apple to process the upload (10-30 minutes)
2. Status will change from "Missing Compliance" to ready
3. If asked about encryption:
   - Select **No** (Fuel Friend doesn't use encryption beyond HTTPS)

#### C. Add Internal Testers
1. Click **Internal Testing** section
2. Click **+** button to add testers
3. Select users from your iTunes Connect team
4. They will receive an email invitation

#### D. External Testing (Optional)
1. Requires **Beta App Review** (24-48 hours)
2. Create a new group under **External Testing**
3. Add testers via email
4. Submit for beta review
5. Once approved, external testers can download via TestFlight app

---

## 🚨 Important Notes

### For Google Sign-In to Work:
1. ✅ Server Client ID already configured in `capacitor.config.ts`
2. ⚠️ **YOU MUST** create iOS Client ID in Google Cloud Console
3. ⚠️ **YOU MUST** update both:
   - `capacitor.config.ts` (iosClientId)
   - `Info.plist` (GIDClientID and CFBundleURLSchemes)

### For Camera/QR Scanner:
1. ✅ Camera permission description added to Info.plist
2. ✅ Capacitor Camera plugin should be available
3. ⚠️ Test on real device (simulator camera is limited)

### For Maps/Location:
1. ✅ Location permission description added to Info.plist
2. ✅ Jawg.io map tiles configured
3. ⚠️ Test location services on real device

---

## 📋 Pre-Submission Checklist

Before submitting to TestFlight, ensure:

- [ ] Web build completed successfully (`npm run build`)
- [ ] iOS project synced (`npx cap sync ios`)
- [ ] CocoaPods installed (`pod install` in `ios/App/`)
- [ ] Xcode project opens without errors
- [ ] Bundle ID matches: `com.fuelfriend.app`
- [ ] Team/Signing configured correctly
- [ ] Google Sign-In iOS client ID configured
- [ ] Info.plist permissions added
- [ ] App builds successfully on device
- [ ] Camera/QR scanner works
- [ ] Maps display correctly
- [ ] All screens render properly

---

## 🔗 Useful Links

- [Capacitor iOS Configuration](https://capacitorjs.com/docs/ios/configuration)
- [TestFlight Beta Testing Guide](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios)

---

## 🆘 Troubleshooting

### Issue: "No profiles found" in Xcode
**Solution**: 
1. Go to Xcode Preferences → Accounts
2. Select your Apple ID
3. Click "Download Manual Profiles"
4. Or enable "Automatically manage signing"

### Issue: Google Sign-In not working
**Solution**:
1. Verify iOS Client ID is created in Google Cloud Console
2. Check Bundle ID matches exactly: `com.fuelfriend.app`
3. Verify reversed client ID in Info.plist
4. Rebuild the app after any changes

### Issue: Camera not opening
**Solution**:
1. Check NSCameraUsageDescription in Info.plist
2. Test on real device (not simulator)
3. Grant camera permission when prompted

### Issue: Build fails with "Command PhaseScriptExecution failed"
**Solution**:
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npm run ios:sync
```

---

## 📞 Contact

If you encounter any issues during the TestFlight setup, please refer to:
- This guide first
- Capacitor documentation
- Xcode error messages
- Apple Developer documentation

**Good luck with TestFlight! 🎉**
