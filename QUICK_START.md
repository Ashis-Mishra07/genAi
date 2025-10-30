# 🚀 Quick Start - Android App Conversion

## Current Status ✅

Based on environment check:
- ✅ Node.js v22.20.0 installed
- ✅ npm 10.9.3 installed  
- ✅ Java JDK 21 installed
- ⚠️ Android Studio NOT installed
- ⚠️ Capacitor NOT installed
- ⚠️ Next.js NOT configured for static export

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Install Android Studio (30-45 minutes)

1. **Download Android Studio**
   - Go to: https://developer.android.com/studio
   - Download the Windows installer
   - Run the installer

2. **During Installation - Select These Components:**
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device (AVD)
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools

3. **After Installation:**
   - Open Android Studio
   - Go to: More Actions → SDK Manager
   - Note the SDK Location (e.g., `C:\Users\adity\AppData\Local\Android\Sdk`)
   - Install:
     - Android SDK Platform 34 (or latest)
     - Android SDK Build-Tools 34.0.0
     - Android Emulator

4. **Set Environment Variables:**
   - Press `Win + X` → System → Advanced system settings → Environment Variables
   - Add New System Variable:
     ```
     Variable: ANDROID_HOME
     Value: C:\Users\adity\AppData\Local\Android\Sdk
     ```
   - Edit PATH variable, add:
     ```
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\cmdline-tools\latest\bin
     %ANDROID_HOME%\emulator
     ```
   - Click OK and restart your terminal

5. **Verify Installation:**
   ```cmd
   adb --version
   ```

---

### Step 2: Install Capacitor (5 minutes)

Run the automated setup script:

```cmd
node setup-capacitor.js
```

This will:
- Install Capacitor dependencies
- Initialize Capacitor configuration
- Update Next.js config for static export
- Add Android platform
- Create mobile-specific styles
- Add npm scripts

**Or manually:**

```cmd
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
npx cap init
npx cap add android
```

---

### Step 3: Build and Run (10 minutes)

```cmd
# Build your Next.js app
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Create/start an AVD (Android Virtual Device)
# 3. Click the green "Run" button
```

---

## 📱 New NPM Scripts (After Setup)

```cmd
npm run cap:build   # Build Next.js and sync to Android
npm run cap:open    # Open project in Android Studio
npm run cap:run     # Build, sync, and run on device
npm run cap:sync    # Sync web assets to Android
```

---

## 🔧 If You Get Stuck

### Problem: "ANDROID_HOME not found"
**Solution:** Restart your terminal/IDE after setting environment variables

### Problem: "SDK location not found"
**Solution:** Create `android/local.properties`:
```
sdk.dir=C:\\Users\\adity\\AppData\\Local\\Android\\Sdk
```

### Problem: "Gradle sync failed"
**Solution:**
```cmd
cd android
gradlew clean
cd ..
npx cap sync android
```

### Problem: "App shows blank screen"
**Solution:**
1. Check if `out` folder exists after `npm run build`
2. Verify `capacitor.config.ts` has `webDir: 'out'`
3. Check Android Studio Logcat for errors

---

## 📋 Complete Workflow

```cmd
# 1. Make changes to your code
# 2. Build Next.js
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Run on device/emulator
npx cap run android
```

---

## 🎨 Making Your App Mobile-Friendly

After basic setup works, follow these guides:
1. **MOBILE_RESPONSIVE_GUIDE.md** - Make UI responsive
2. **ANDROID_CAPACITOR_SETUP.md** - Detailed configuration
3. Test on different screen sizes
4. Add mobile-specific features (haptics, status bar, etc.)

---

## 🚀 Production Build

When ready to publish:

```cmd
# 1. Generate keystore
keytool -genkey -v -keystore artisan-marketplace.keystore -alias artisan -keyalg RSA -keysize 2048 -validity 10000

# 2. Build release APK in Android Studio:
# Build → Generate Signed Bundle / APK → APK → Select keystore → Build

# 3. APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📞 Need Help?

1. Run environment check: `node check-android-env.js`
2. Check detailed guides in project root
3. Review Android Studio Logcat for errors
4. Verify all environment variables are set

---

## ⏱️ Estimated Time

- Android Studio Installation: 30-45 minutes
- Capacitor Setup: 5 minutes
- First Build & Run: 10 minutes
- Making UI Responsive: 2-4 hours
- Testing & Refinement: Ongoing

**Total to first working app: ~1 hour**

---

## 🎯 Success Criteria

You'll know it's working when:
- ✅ `adb --version` shows version info
- ✅ `npm run build` creates `out` folder
- ✅ `npx cap sync android` completes without errors
- ✅ Android Studio opens your project
- ✅ App runs on emulator/device
- ✅ You can see your web app in the Android app

---

**Ready to start? Run:** `node setup-capacitor.js`
