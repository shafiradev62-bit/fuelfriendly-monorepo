# 🚀 Codex Cloud Agents - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Codex CLI
```bash
npm install -g @codex-cloud/cli
```

### Step 2: Login to Codex Cloud
```bash
codex login
```
This will open your browser for authentication.

### Step 3: Initialize Project
```bash
cd fuel-user-dev/frontend
codex init
```

### Step 4: Configure Secrets
Create `.codex/secrets.json`:
```json
{
  "GOOGLE_IOS_CLIENT_ID": "your-ios-client-id.apps.googleusercontent.com",
  "GOOGLE_ANDROID_CLIENT_ID": "your-android-client-id.apps.googleusercontent.com",
  "APPLE_TEAM_ID": "YOUR_TEAM_ID",
  "APP_STORE_CONNECT_API_KEY_ID": "YOUR_KEY_ID",
  "APP_STORE_CONNECT_ISSUER_ID": "YOUR_ISSUER_ID",
  "APP_STORE_CONNECT_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\n...",
  "IOS_PROVISIONING_PROFILE": "profile-name",
  "ANDROID_SIGNING_KEY": "base64-encoded-keystore",
  "ANDROID_KEY_ALIAS": "your-alias",
  "ANDROID_KEYSTORE_PASSWORD": "your-password",
  "PLAY_STORE_SERVICE_ACCOUNT": "{\"type\":\"service_account\",...}",
  "SLACK_WEBHOOK_URL": "https://hooks.slack.com/...",
  "VERCEL_TOKEN": "your-vercel-token",
  "VERCEL_ORG_ID": "your-org-id",
  "VERCEL_PROJECT_ID": "your-project-id"
}
```

⚠️ **IMPORTANT**: Add `.codex/secrets.json` to `.gitignore`!

### Step 5: Deploy Configuration
```bash
codex deploy
```

### Step 6: Trigger First Build
```bash
# Build all platforms
codex build --all

# Or build specific platform
codex build ios
codex build android
codex build web
```

---

## 📱 Platform-Specific Commands

### iOS (TestFlight)
```bash
# Trigger iOS build
codex build ios

# View build logs
codex logs ios --follow

# Check TestFlight status
codex status ios
```

**What happens:**
1. ✅ Remote macOS agent spins up
2. ✅ Builds web assets
3. ✅ Syncs to iOS
4. ✅ Installs CocoaPods
5. ✅ Configures signing
6. ✅ Archives for TestFlight
7. ✅ Uploads to App Store Connect
8. ✅ Notifies on Slack

**Time**: ~30-45 minutes

---

### Android (Play Store)
```bash
# Trigger Android build
codex build android

# Download debug APK
codex artifacts download android-debug-apk

# View build logs
codex logs android --follow
```

**What happens:**
1. ✅ Remote Linux agent spins up
2. ✅ Builds web assets
3. ✅ Syncs to Android
4. ✅ Builds APK and AAB
5. ✅ Signs release
6. ✅ Uploads to Play Store Internal Testing
7. ✅ Notifies on Slack

**Time**: ~20-30 minutes

---

### Web (Vercel)
```bash
# Trigger web deployment
codex build web

# Get deployment URL
codex status web

# View Lighthouse score
codex lighthouse web
```

**What happens:**
1. ✅ Remote Linux agent spins up
2. ✅ Builds web assets
3. ✅ Runs Lighthouse audit
4. ✅ Deploys to Vercel
5. ✅ CDN distribution
6. ✅ Notifies on Slack

**Time**: ~5-10 minutes

---

## 🤖 Managing Remote Agents

### View Available Agents
```bash
codex agents:list
```

### Start Agent Locally (for testing)
```bash
codex agents:start ios-builder
```

### View Agent Logs
```bash
# Follow logs in real-time
codex logs --agent ios-builder --follow

# Last 50 lines
codex logs --agent ios-builder --lines 50

# Export logs to file
codex logs --agent ios-builder --output ios-build.log
```

### Stop Agent
```bash
codex agents:stop ios-builder
```

### Scale Agents
```bash
# Set max instances
codex agents:scale ios-builder --max 3

# Enable auto-scaling
codex agents:autoscale ios-builder --enable
```

---

## 📊 Monitoring & Dashboards

### Real-Time Dashboard
Access at: https://cloud.codex.dev/dashboard/fuel-friend

**Features:**
- Live build status
- Test results
- Deployment history
- Performance metrics
- Cost tracking
- Agent utilization

### CLI Status Commands
```bash
# Overall project status
codex status

# Detailed status per platform
codex status ios
codex status android
codex status web

# Recent builds
codex builds:list --limit 10

# Test coverage report
codex test:coverage
```

---

## 🔧 Common Operations

### Manual Build Trigger
```bash
# With custom message
codex build ios --message "Manual trigger for hotfix"
```

### Cancel Running Build
```bash
codex build:cancel ios
```

### Re-run Failed Build
```bash
codex build:rerun ios
```

### Download Artifacts
```bash
# List available artifacts
codex artifacts:list

# Download specific artifact
codex artifacts:download ios-xcarchive --output ./builds/
```

### Environment Variables
```bash
# Set environment variable
codex env:set NODE_ENV production

# List all env vars
codex env:list

# Delete env var
codex env:delete NODE_ENV
```

---

## 🆘 Troubleshooting

### Issue: Build fails with "No provisioning profile"
**Solution:**
```bash
codex vault:certificates:upload ios \
  --file ./certificates/ios_distribution.p12 \
  --password "your-p12-password"
```

### Issue: Google Sign-In not working
**Solution:**
```bash
# Verify client ID is set
codex secrets:get GOOGLE_IOS_CLIENT_ID

# Update if needed
codex secrets:set GOOGLE_IOS_CLIENT_ID "new-client-id.apps.googleusercontent.com"
```

### Issue: Build timeout
**Solution:**
```bash
# Increase timeout in agent config
codex agents:update ios-builder --timeout 7200
```

### Issue: CocoaPods installation fails
**Solution:**
```bash
# Clear CocoaPods cache
codex agents:cache:clear ios-builder --cache cocoapods

# Re-run build
codex build:rerun ios
```

### Issue: Gradle build fails
**Solution:**
```bash
# Clear Gradle cache
codex agents:cache:clear android-builder --cache gradle

# Re-run build
codex build:rerun android
```

---

## 💰 Cost Management

### View Current Costs
```bash
codex costs:view
```

### Cost Breakdown by Platform
```bash
codex costs:breakdown
```

### Set Budget Alerts
```bash
codex costs:alert --monthly-limit 500 --email dev@fuelfriend.com
```

### Optimize Costs
```bash
# Use spot instances for non-critical builds
codex agents:update android-builder --instance-type ubuntu-22.04-spot

# Enable caching
codex cache:enable --all

# Schedule builds during off-peak hours
codex schedules:create nightly-build --cron "0 2 * * *" --platforms ios,android
```

---

## 🎯 Best Practices

### 1. Always Cache Dependencies
```yaml
# In agent config
cache:
  enabled: true
  paths:
    - node_modules
    - ios/App/Pods
    - ~/.gradle/caches
```

### 2. Use Parallel Builds
```bash
# Build all platforms simultaneously
codex build --parallel --all
```

### 3. Automate Everything
```yaml
# In .codex/config.json
triggers:
  - event: push
    branch: main
    actions: [build, test, deploy]
```

### 4. Monitor Costs Daily
```bash
# Add to team routine
codex costs:daily-report --slack "#fuel-friend-builds"
```

### 5. Clean Old Artifacts
```bash
# Weekly cleanup
codex artifacts:cleanup --older-than 30d
```

---

## 📈 Team Collaboration

### Invite Team Members
```bash
codex team:invite developer@fuelfriend.com --role builder
```

### Team Roles
- **Admin**: Full access
- **Builder**: Can trigger builds
- **Viewer**: Read-only access

### Slack Integration
All build notifications automatically sent to `#fuel-friend-builds`

### Email Notifications
Critical failures sent to configured recipients

---

## 🎉 Success Checklist

After setup, verify:
- [ ] All agents configured correctly
- [ ] Secrets uploaded securely
- [ ] First iOS build completed
- [ ] First Android build completed  
- [ ] Web deployment successful
- [ ] Slack notifications working
- [ ] Team members have access
- [ ] Cost alerts configured

---

## 📞 Support

- **Documentation**: https://docs.codex.dev/
- **Status Page**: https://status.codex.dev/
- **Support Email**: support@codex.dev
- **Slack Community**: https://codex-community.slack.com/

---

**You're ready to build with Codex Cloud Agents! 🚀**
