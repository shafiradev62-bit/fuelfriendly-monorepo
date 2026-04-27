# 🤖 Codex Cloud Agents Setup Guide

## 📋 Overview

This guide covers setting up Fuel Friend for **Codex Cloud Agents** with:
- ✅ Remote agent deployment
- ✅ PiSH (Platform as a Service) integration
- ✅ Multi-platform distribution (iOS, Android, Web)
- ✅ Automated build pipelines
- ✅ Cloud-based testing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Codex Cloud Agents Platform                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Web Agent   │  │  iOS Agent   │  │ Android Agent│ │
│  │  (Vercel)    │  │  (TestFlight)│  │  (Play Store)│ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                             │
│                   ┌────────▼────────┐                   │
│                   │  Remote Agents  │                   │
│                   │  - Build Bots   │                   │
│                   │  - Test Bots    │                   │
│                   │  - Deploy Bots  │                   │
│                   └─────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup

### 1. Install Codex CLI
```bash
npm install -g @codex-cloud/cli
```

### 2. Initialize Project
```bash
cd fuel-user-dev/frontend
codex init
```

### 3. Configure Remote Agents
Create `.codex/config.json`:

```json
{
  "projectId": "fuel-friend-app",
  "agents": {
    "build": {
      "enabled": true,
      "platforms": ["ios", "android", "web"],
      "autoTrigger": true
    },
    "test": {
      "enabled": true,
      "platforms": ["ios", "android"],
      "parallelExecution": true
    },
    "deploy": {
      "enabled": true,
      "web": "vercel",
      "ios": "testflight",
      "android": "playstore"
    }
  },
  "remoteAgents": {
    "macOS": {
      "provider": "codex-cloud",
      "instance": "macos-m1-large",
      "region": "us-east-1"
    },
    "Linux": {
      "provider": "codex-cloud",
      "instance": "ubuntu-22.04",
      "region": "us-east-1"
    }
  }
}
```

---

## 📱 Platform-Specific Setup

### iOS (TestFlight via Remote macOS Agent)

#### 1. Create iOS Agent Configuration
`.codex/agents/ios-agent.yaml`:

```yaml
name: fuel-friend-ios-builder
description: Builds and deploys iOS app to TestFlight
platform: macos
instanceType: macos-m1-large

environment:
  NODE_VERSION: '20'
  XCODE_VERSION: '15.0'
  COCOAPODS_VERSION: '1.14'

steps:
  - name: Checkout Code
    uses: actions/checkout@v4
    
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      
  - name: Install Dependencies
    run: npm ci
    
  - name: Build Web Assets
    run: npm run build
    
  - name: Sync iOS
    run: npx cap sync ios
    
  - name: Install CocoaPods
    workingDirectory: ios/App
    run: pod install
    
  - name: Configure Signing
    script: |
      # Set bundle identifier
      plutil -replace CFBundleIdentifier -string "com.fuelfriend.app" \
        ios/App/App/Info.plist
      
      # Update Google Sign-In
      sed -i '' "s/YOUR_IOS_CLIENT_ID/$GOOGLE_IOS_CLIENT_ID/g" \
        ios/App/App/Info.plist
        
  - name: Archive for TestFlight
    script: |
      xcodebuild -workspace ios/App/App.xcworkspace \
        -scheme App \
        -configuration Release \
        -archivePath build/App.xcarchive \
        archive
        
  - name: Upload to App Store Connect
    script: |
      xcrun altool --upload-app \
        --type ios \
        --file build/App.xcarchive \
        --apiKey $APP_STORE_CONNECT_API_KEY_ID \
        --apiIssuer $APP_STORE_CONNECT_ISSUER_ID
        
triggers:
  - branch: main
    paths:
      - 'src/**'
      - 'capacitor.config.ts'
      - 'package.json'
```

---

### Android (Play Store via Remote Linux Agent)

#### 1. Create Android Agent Configuration
`.codex/agents/android-agent.yaml`:

```yaml
name: fuel-friend-android-builder
description: Builds and deploys Android APK/AAB
platform: ubuntu
instanceType: ubuntu-22.04

environment:
  NODE_VERSION: '20'
  JAVA_VERSION: '17'
  ANDROID_SDK_VERSION: '34'

steps:
  - name: Checkout Code
    uses: actions/checkout@v4
    
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      
  - name: Setup Java
    uses: actions/setup-java@v4
    with:
      java-version: ${{ env.JAVA_VERSION }}
      distribution: 'temurin'
      
  - name: Install Dependencies
    run: npm ci
    
  - name: Build Web Assets
    run: npm run build
    
  - name: Sync Android
    run: npx cap sync android
    
  - name: Build Debug APK
    workingDirectory: android
    run: ./gradlew assembleDebug
    
  - name: Build Release AAB
    workingDirectory: android
    run: ./gradlew bundleRelease
    
  - name: Sign AAB
    uses: r0adkll/sign-android-release@v1
    with:
      releaseDirectory: android/app/build/outputs/bundle/release
      signingKeyBase64: ${{ secrets.ANDROID_SIGNING_KEY }}
      alias: ${{ secrets.ANDROID_KEY_ALIAS }}
      keyStorePassword: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
      
  - name: Upload to Play Store
    uses: r0adkll/upload-google-play@v1
    with:
      serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
      packageName: com.fuelfriend.strict
      releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
      track: internal
      status: draft
```

---

### Web (Vercel Deployment)

#### 1. Create Web Agent Configuration
`.codex/agents/web-agent.yaml`:

```yaml
name: fuel-friend-web-deployer
description: Deploys web app to Vercel
platform: ubuntu
instanceType: ubuntu-22.04

environment:
  NODE_VERSION: '20'
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

steps:
  - name: Checkout Code
    uses: actions/checkout@v4
    
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      
  - name: Install Vercel CLI
    run: npm install -g vercel
    
  - name: Install Dependencies
    run: npm ci
    
  - name: Build Production
    run: npm run build
    
  - name: Deploy to Vercel
    run: |
      vercel --prod \
        --token ${{ secrets.VERCEL_TOKEN }} \
        --confirm
```

---

## 🤖 Remote Agents Configuration

### Master Orchestrator Agent
`.codex/agents/orchestrator.yaml`:

```yaml
name: fuel-friend-orchestrator
description: Coordinates all build and deployment agents
type: orchestrator

agents:
  - name: ios-builder
    config: .codex/agents/ios-agent.yaml
    priority: high
    
  - name: android-builder
    config: .codex/agents/android-agent.yaml
    priority: high
    
  - name: web-deployer
    config: .codex/agents/web-agent.yaml
    priority: medium
    
  - name: test-runner
    config: .codex/agents/test-runner.yaml
    priority: low

workflows:
  onPushToMain:
    steps:
      - trigger: ios-builder
      - trigger: android-builder
      - trigger: web-deployer
      - trigger: test-runner
        condition: all_previous_success
        
  onPullRequest:
    steps:
      - trigger: ios-builder
        options:
          dryRun: true
      - trigger: android-builder
        options:
          dryRun: true
      - trigger: test-runner
```

---

### Test Runner Agent
`.codex/agents/test-runner.yaml`:

```yaml
name: fuel-friend-test-runner
description: Runs automated tests on all platforms
platform: ubuntu
instanceType: ubuntu-22.04-xl

environment:
  NODE_VERSION: '20'
  PLAYWRIGHT_BROWSERS: 'all'

steps:
  - name: Checkout Code
    uses: actions/checkout@v4
    
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
      
  - name: Install Dependencies
    run: npm ci
    
  - name: Install Playwright
    run: npx playwright install --with-deps
    
  - name: Run Unit Tests
    run: npm test
    
  - name: Run E2E Tests
    run: npm run test:e2e
    
  - name: Generate Test Report
    run: npx playwright show-report
    
  - name: Upload Artifacts
    uses: actions/upload-artifact@v4
    with:
      name: test-results
      path: playwright-report/
```

---

## 📊 Monitoring & Notifications

### Slack Integration
`.codex/integrations/slack.yaml`:

```yaml
name: slack-notifications
type: notification
channel: '#fuel-friend-builds'

events:
  - build.started
  - build.success
  - build.failed
  - test.completed
  - deploy.completed
  
templates:
  build.started:
    text: "🚀 Build started for {{commit_sha}}"
    color: "#FFA500"
    
  build.success:
    text: "✅ Build successful! Ready for TestFlight/Play Store"
    color: "#32CD32"
    
  build.failed:
    text: "❌ Build failed: {{error_message}}"
    color: "#DC143C"
    mention: "@ios-team @android-team"
```

---

## 🔐 Secrets Management

### Create `.codex/secrets.json` (DO NOT COMMIT!)
```json
{
  "GOOGLE_IOS_CLIENT_ID": "your-ios-client-id.apps.googleusercontent.com",
  "GOOGLE_ANDROID_CLIENT_ID": "your-android-client-id.apps.googleusercontent.com",
  "APP_STORE_CONNECT_API_KEY_ID": "YOUR_KEY_ID",
  "APP_STORE_CONNECT_ISSUER_ID": "YOUR_ISSUER_ID",
  "APP_STORE_CONNECT_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\n...",
  "ANDROID_SIGNING_KEY": "base64-encoded-keystore",
  "ANDROID_KEY_ALIAS": "your-alias",
  "ANDROID_KEYSTORE_PASSWORD": "your-password",
  "PLAY_STORE_SERVICE_ACCOUNT": "{\"type\":\"service_account\",...}",
  "VERCEL_TOKEN": "your-vercel-token",
  "VERCEL_ORG_ID": "your-org-id",
  "VERCEL_PROJECT_ID": "your-project-id"
}
```

---

## 🎯 Usage Commands

### Local Development
```bash
# Start all agents locally (for testing)
codex agents:start

# Start specific agent
codex agents:start ios-builder

# View agent logs
codex logs --agent ios-builder --follow
```

### Cloud Deployment
```bash
# Deploy configuration to Codex Cloud
codex deploy

# Trigger manual build
codex build --platform ios
codex build --platform android
codex build --platform web

# Trigger tests
codex test --platform all

# View build status
codex status
```

---

## 📈 Dashboard & Analytics

Access your dashboard at: https://cloud.codex.dev/dashboard/fuel-friend

Features:
- ✅ Real-time build status
- ✅ Test results visualization
- ✅ Deployment history
- ✅ Performance metrics
- ✅ Cost tracking
- ✅ Agent utilization

---

## 🆘 Troubleshooting

### Issue: Agent fails to start
**Solution**: Check instance availability in your region
```bash
codex regions:list
codex instances:available --region us-east-1
```

### Issue: Build timeout
**Solution**: Increase timeout in agent config
```yaml
timeout: 3600  # 60 minutes
```

### Issue: Signing errors (iOS)
**Solution**: Verify certificates in Codex vault
```bash
codex vault:certificates:verify --platform ios
```

### Issue: Secrets not accessible
**Solution**: Re-upload secrets
```bash
codex secrets:upload .codex/secrets.json
```

---

## 💰 Cost Optimization

### Recommended Instance Types:
- **iOS builds**: `macos-m1-large` (fastest compilation)
- **Android builds**: `ubuntu-22.04-xl` (parallel Gradle)
- **Web builds**: `ubuntu-22.04` (standard is sufficient)
- **Tests**: `ubuntu-22.04-xl` (parallel browsers)

### Estimated Monthly Costs:
- iOS builds (10/day): ~$150/month
- Android builds (10/day): ~$80/month
- Web builds (on-demand): ~$20/month
- Tests (on PR): ~$50/month
- **Total**: ~$300/month

### Cost Saving Tips:
1. Use spot instances for non-critical builds
2. Cache dependencies between builds
3. Parallelize platform builds
4. Clean old artifacts automatically

---

## 🎉 Next Steps

1. ✅ Install Codex CLI
2. ✅ Create Codex Cloud account
3. ✅ Configure secrets
4. ✅ Deploy agent configurations
5. ✅ Trigger first test build
6. ✅ Monitor dashboard
7. ✅ Set up team notifications

---

📖 **Full Documentation**: https://docs.codex.dev/
💬 **Support**: support@codex.dev
🚀 **Ready to deploy!**
