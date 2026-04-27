# 🚀 Quick Start - TestFlight Setup

## ⚡ Fast Track (5 Minutes)

### 1. Build & Sync
```bash
npm run testflight:prepare
```

### 2. Install Pods
```bash
cd ios/App && pod install && cd ../..
```

### 3. Open Xcode
```bash
npm run ios:open
```

### 4. In Xcode
- Select **Team** (Signing & Capabilities)
- Select **Any iOS Device**
- **Product** → **Archive**
- **Distribute App** → **App Store Connect** → **Upload**

---

## 🔑 Required Configurations

### Google Sign-In (MUST DO!)
1. Create iOS Client ID at [Google Cloud Console](https://console.cloud.google.com/)
   - Bundle ID: `com.fuelfriend.app`
2. Update `capacitor.config.ts`:
   ```typescript
   GoogleAuth: {
     iosClientId: 'YOUR_ID.apps.googleusercontent.com'
   }
   ```
3. Add to `ios/App/App/Info.plist`:
   ```xml
   <key>GIDClientID</key>
   <string>YOUR_ID.apps.googleusercontent.com</string>
   
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR_REVERSED_ID</string>
       </array>
     </dict>
   </array>
   ```

### Permissions (Already Added - Just Verify)
Check `ios/App/App/Info.plist` has:
- ✅ NSCameraUsageDescription (QR Scanner)
- ✅ NSPhotoLibraryUsageDescription (Image Upload)
- ✅ NSLocationWhenInUseUsageDescription (Maps)

---

## 📱 npm Commands

| Command | Description |
|---------|-------------|
| `npm run ios:build` | Build + sync iOS |
| `npm run ios:open` | Open Xcode |
| `npm run ios:run` | Run on device/simulator |
| `npm run ios:clean` | Clean build |
| `npm run testflight:prepare` | Prepare for TestFlight |

---

## ✅ Checklist Before Archive

- [ ] `pod install` completed
- [ ] Team selected in Xcode
- [ ] Bundle ID: `com.fuelfriend.app`
- [ ] Google Sign-In configured
- [ ] Permissions in Info.plist
- [ ] Tested on real device

---

## 🎯 TestFlight Submission Flow

```
Build Web App → Sync iOS → pod install → Open Xcode 
→ Select Team → Archive → Distribute → Upload to App Store Connect
→ Wait for Processing → Add Testers → Send Invites
```

---

## 🆘 Common Issues

**No provisioning profile?**
→ Enable "Automatically manage signing" in Xcode

**Google Sign-In fails?**
→ Check reversed client ID in Info.plist

**Camera not working?**
→ Test on real device, grant permission

**Build fails?**
```bash
cd ios/App && pod deintegrate && pod install && cd ../..
npm run ios:sync
```

---

📖 **Full guide**: See `TESTFLIGHT_SETUP.md`
