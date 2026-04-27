# ✅ TestFlight Submission Checklist

## Pre-Setup (Done by AI)
- [x] Capacitor configured with App Store bundle ID (`com.fuelfriend.app`)
- [x] iOS scripts added to `package.json`
- [x] `capacitor.config.ts` updated with iOS settings
- [x] Google Auth placeholder configured
- [x] Documentation created (`TESTFLIGHT_SETUP.md`, `QUICKSTART_IOS.md`)
- [x] Info.plist template created

---

## iOS Programmer Tasks

### Phase 1: Initial Setup ⚙️

#### 1. Install Dependencies
- [ ] Install CocoaPods: `sudo gem install cocoapods`
- [ ] Navigate to iOS folder: `cd ios/App`
- [ ] Install pods: `pod install`
- [ ] Return to root: `cd ../..`

#### 2. Build Web Assets
- [ ] Run build: `npm run testflight:prepare`
- [ ] Verify no errors in console
- [ ] Check that `dist` folder is created

#### 3. Sync to iOS
- [ ] Confirm iOS project synced: `npx cap sync ios`
- [ ] Check for any plugin warnings
- [ ] Verify `ios` folder contains updated files

---

### Phase 2: Xcode Configuration 🍎

#### 4. Open Xcode Project
- [ ] Open workspace: `npm run ios:open`
- [ ] **IMPORTANT**: Open `.xcworkspace` NOT `.xcodeproj`
- [ ] Wait for Xcode to index files

#### 5. Configure Signing
- [ ] Select project in navigator (left sidebar)
- [ ] Select **App** target
- [ ] Go to **Signing & Capabilities** tab
- [ ] Select your **Team** (Apple Developer account)
- [ ] Verify Bundle ID: `com.fuelfriend.app`
- [ ] Enable **Automatically manage signing**
- [ ] Check that provisioning profile is created

#### 6. General Settings
- [ ] Set Display Name: `Fuel Friend`
- [ ] Set Deployment Target: `iOS 15.0` or higher
- [ ] Verify Device Orientation: Portrait only
- [ ] Check Status Bar Style

---

### Phase 3: Google Sign-In Setup 🔑

#### 7. Create Google iOS Client
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Select your Fuel Friend project
- [ ] Navigate to APIs & Services → Credentials
- [ ] Click **Create Credentials** → **OAuth client ID**
- [ ] Application type: **iOS**
- [ ] Bundle ID: `com.fuelfriend.app`
- [ ] Download the `.plist` file
- [ ] Copy the **iOS Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- [ ] Copy the **Reversed Client ID** (looks like: `com.googleusercontent.apps.xxxxx`)

#### 8. Update Configuration Files
- [ ] Open `capacitor.config.ts`
- [ ] Replace `YOUR_IOS_GOOGLE_CLIENT_ID` with actual client ID
- [ ] Save the file

#### 9. Update Info.plist
- [ ] Open `ios/App/App/Info.plist` in Xcode
- [ ] Add or update `GIDClientID` key with your iOS Client ID
- [ ] Add or update `CFBundleURLTypes` with reversed client ID
- [ ] Save the file

**Example:**
```xml
<key>GIDClientID</key>
<string>123456789-abcdefg.apps.googleusercontent.com</string>

<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.123456789-abcdefg</string>
    </array>
  </dict>
</array>
```

---

### Phase 4: Permissions & Capabilities 📱

#### 10. Verify Info.plist Permissions
Open `ios/App/App/Info.plist` and confirm these exist:

- [ ] **Camera Usage** (NSCameraUsageDescription)
  - Value: "Fuel Friend needs camera access to scan QR codes for order completion"
  
- [ ] **Photo Library Usage** (NSPhotoLibraryUsageDescription)
  - Value: "Fuel Friend needs photo library access to upload images for QR scanning"
  
- [ ] **Location Usage** (NSLocationWhenInUseUsageDescription)
  - Value: "Fuel Friend needs your location to track fuel delivery"

#### 11. Add Capabilities (if needed)
- [ ] In Xcode, go to **Signing & Capabilities** → **+ Capability**
- [ ] Add **Background Modes** if location tracking needed in background
- [ ] Check **Location updates** (only if required)

---

### Phase 5: Testing on Device 📲

#### 12. Connect iOS Device
- [ ] Connect iPhone/iPad via USB
- [ ] Trust the computer on your device
- [ ] Device should appear in Xcode device list

#### 13. Build & Run on Device
- [ ] Select your physical device (not simulator)
- [ ] Click **Run** (▶️) in Xcode
- [ ] Wait for build to complete
- [ ] App should launch on device

#### 14. Test Core Features
- [ ] App launches without crashes
- [ ] Home screen displays correctly
- [ ] Navigation works smoothly
- [ ] **Test QR Scanner**: Open camera and scan
- [ ] **Test Maps**: Verify Jawg.io tiles load
- [ ] **Test Google Sign-In**: Try logging in with Google
- [ ] **Test Forms**: Fill out checkout forms
- [ ] **Test Animations**: All transitions smooth

#### 15. Fix Any Issues
- [ ] Address any console errors
- [ ] Fix layout issues
- [ ] Resolve permission prompts
- [ ] Test again after fixes

---

### Phase 6: Archive for TestFlight 📦

#### 16. Prepare for Archive
- [ ] Select **Any iOS Device (arm64)** from device list
- [ ] Go to **Product** → **Clean Build Folder** (Shift+Cmd+K)
- [ ] Close Xcode completely
- [ ] Reopen Xcode project
- [ ] Verify signing is still correct

#### 17. Archive the App
- [ ] Go to **Product** → **Archive**
- [ ] Wait for archive to complete (5-15 minutes)
- [ ] **Organizer** window will open automatically
- [ ] Your archive appears in the list

#### 18. Validate Archive (Optional but Recommended)
- [ ] In Organizer, select your archive
- [ ] Click **Validate App**
- [ ] Follow the wizard
- [ ] Fix any validation errors

#### 19. Distribute to App Store Connect
- [ ] Select archive in Organizer
- [ ] Click **Distribute App**
- [ ] Choose **App Store Connect**
- [ ] Select **Upload** (not Export)
- [ ] Keep default options:
  - ✅ Upload your app's symbols
  - ✅ Include bitcode for content
- [ ] Click **Upload**
- [ ] Wait for upload to complete (10-30 minutes)

---

### Phase 7: App Store Connect 🌐

#### 20. Access App Store Connect
- [ ] Go to [App Store Connect](https://appstoreconnect.apple.com/)
- [ ] Sign in with your Apple Developer account
- [ ] Navigate to **My Apps**
- [ ] Find **Fuel Friend** app (or create if new)

#### 21. Configure App Information
If new app:
- [ ] Click **+** to add new app
- [ ] Platform: **iOS**
- [ ] Name: `Fuel Friend`
- [ ] Primary Language: **English**
- [ ] Bundle ID: Select `com.fuelfriend.app`
- [ ] SKU: `fuel-friend-001` (or any unique identifier)
- [ ] User Access: **Full Access**

#### 22. Wait for Processing
- [ ] Go to **TestFlight** tab
- [ ] Wait for build to appear (10-30 minutes)
- [ ] Status will show "Missing Compliance Encryption" initially

#### 23. Answer Encryption Questions
- [ ] Click on build number
- [ ] Answer encryption compliance questions:
  - **Does your app use encryption?** → **No** (Fuel Friend uses standard HTTPS only)
  - **Is your app designed for China?** → **No**
- [ ] Save answers

---

### Phase 8: TestFlight Testing 🧪

#### 24. Internal Testing (Immediate)
- [ ] In TestFlight tab, click **Internal Testing**
- [ ] Click **+** button to add testers
- [ ] Select team members from iTunes Connect
- [ ] Click **Add**
- [ ] Testers receive email invitation
- [ ] They can download immediately via TestFlight app

#### 25. External Testing (Requires Beta Review)
- [ ] Click **External Testing** section
- [ ] Click **+** to create new group
- [ ] Name it: `Beta Testers` or `Public Beta`
- [ ] Add testers via email
- [ ] Click **Submit for Beta Review**
- [ ] Wait 24-48 hours for approval
- [ ] Once approved, external testers can download

#### 26. Provide Test Information
- [ ] Click **App Information** under TestFlight
- [ ] Add:
  - What to test (features, bugs to look for)
  - Contact information
  - Testing instructions
  - Demo account credentials (if needed)

---

### Phase 9: Post-Submission 📊

#### 27. Monitor TestFlight
- [ ] Check TestFlight dashboard daily
- [ ] Review crash reports
- [ ] Read tester feedback
- [ ] Note any bugs or issues

#### 28. Prepare Updates
- [ ] Increment version number in `capacitor.config.ts`
- [ ] Update build number in Xcode
- [ ] Make code changes
- [ ] Repeat build process
- [ ] Upload new version to TestFlight

#### 29. Document Learnings
- [ ] Note any issues encountered
- [ ] Document solutions
- [ ] Update this checklist if needed
- [ ] Share knowledge with team

---

## 🎉 Success Criteria

Your TestFlight setup is complete when:

✅ Internal testers can download the app via TestFlight app  
✅ App launches without crashes on real devices  
✅ QR scanner works on physical devices  
✅ Google Sign-In authenticates successfully  
✅ Maps display Jawg.io tiles correctly  
✅ All core features function as expected  
✅ No critical bugs reported by testers  

---

## 📞 Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs/ios
- **TestFlight Guide**: https://developer.apple.com/testflight/
- **App Store Connect Help**: https://developer.apple.com/app-store-connect/
- **Google Sign-In iOS**: https://developers.google.com/identity/sign-in/ios

---

## ⚠️ Important Notes

1. **Always test on real devices**, not just simulators
2. **Camera features require physical device** testing
3. **Google Sign-In won't work** until iOS Client ID is configured
4. **First archive takes longer** due to symbol upload
5. **Beta review takes 24-48 hours** for external testing
6. **Keep Xcode updated** to latest version
7. **Backup your provisioning profiles** regularly

---

**Good luck! 🚀**

Mark each checkbox as you complete it. This ensures nothing is missed during TestFlight setup.
