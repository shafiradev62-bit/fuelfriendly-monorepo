import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fuelfriend.app', // App Store bundle identifier
  appName: 'Fuel Friend',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // For development: use local IP to access from mobile devices
    // url: 'http://192.168.0.160:5173', // Uncomment for mobile testing
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'splash',
      showSpinner: false
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '361936469399-t2o5h62466mk8gcuvqt62erj7oekt0ar.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      // iOS specific Google Auth configuration
      iosClientId: 'YOUR_IOS_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with actual iOS client ID from Google Console
    },
    Camera: {
      // Camera plugin configuration for QR scanning
      allowEditing: false,
      source: 'camera', // Always use camera, not gallery
      saveToGallery: false,
      promptLabelHeader: 'Camera Access',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'Use Camera',
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    loggingBehavior: 'debug'
  },
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    scheme: 'https',
  },
  // App Store and TestFlight configuration
  cordova: {}
};

export default config;
