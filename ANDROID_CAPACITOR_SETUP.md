# 📱 Android App Conversion Guide - Artisan Marketplace

## Overview
This guide will help you convert your Next.js web app into a native Android app using Capacitor.

---

## 🔧 Phase 1: Environment Setup (Windows)

### 1.1 Check Current Installations

First, verify what's already installed:

```cmd
node -v
npm -v
java -version
```

### 1.2 Install Required Software

#### A. Node.js (if not installed)
- Download from: https://nodejs.org/
- Install LTS version (20.x or later)
- Verify: `node -v` and `npm -v`

#### B. Java JDK 17+
- Download: https://adoptium.net/ (Temurin JDK 17 or 21)
- Install and note the installation path (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`)
- Add to System Environment Variables:
  ```
  JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.x
  ```
- Add to PATH: `%JAVA_HOME%\bin`
- Verify: `java -version`

#### C. Android Studio
- Download from: https://developer.android.com/studio
- During installation, ensure these are selected:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)
  - Android SDK Build-Tools
  - Android SDK Command-line Tools

#### D. Configure Android Environment Variables
After Android Studio installation:

1. Open Android Studio → More Actions → SDK Manager
2. Note the SDK Location (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
3. Add System Environment Variables:
   ```
   ANDROID_HOME = C:\Users\YourName\AppData\Local\Android\Sdk
   ANDROID_SDK_ROOT = C:\Users\YourName\AppData\Local\Android\Sdk
   ```
4. Add to PATH:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\cmdline-tools\latest\bin
   %ANDROID_HOME%\emulator
   ```

#### E. Install Android SDK Components
In Android Studio SDK Manager, install:
- Android SDK Platform 34 (or latest)
- Android SDK Build-Tools 34.0.0 (or latest)
- Android SDK Command-line Tools
- Android Emulator
- Intel x86 Emulator Accelerator (HAXM) - if using Intel CPU

#### F. Verify Installation
```cmd
adb --version
sdkmanager --version
```

---

## 📦 Phase 2: Install Capacitor

### 2.1 Install Capacitor Core and CLI

```cmd
npm install @capacitor/core @capacitor/cli
```

### 2.2 Initialize Capacitor

```cmd
npx cap init
```

When prompted:
- **App name**: Artisan Marketplace
- **App ID**: com.artisan.marketplace (use reverse domain notation)
- **Web asset directory**: out (for Next.js static export)

### 2.3 Install Android Platform

```cmd
npm install @capacitor/android
npx cap add android
```

---

## 🎨 Phase 3: Configure Next.js for Static Export

Capacitor requires a static build. Update your Next.js configuration:

### 3.1 Update `next.config.ts`

Change the output mode from 'standalone' to 'export':

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Change this for Capacitor
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Keep existing configs
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      /Critical dependency/,
      /the request of a dependency is an expression/,
    ];
    return config;
  },
};

export default nextConfig;
```

### 3.2 Update `capacitor.config.ts`

Create or update this file in your project root:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.artisan.marketplace',
  appName: 'Artisan Marketplace',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // For development, you can point to your local server
    // url: 'http://10.0.2.2:3000',
    // cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
```

---

## 📱 Phase 4: Make Frontend Mobile-Responsive

### 4.1 Install Mobile UI Dependencies

```cmd
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

### 4.2 Add Mobile-Specific Styles

Create `app/globals.css` additions for mobile:

```css
/* Mobile-specific styles */
@media (max-width: 768px) {
  body {
    font-size: 16px; /* Prevents zoom on input focus */
  }
  
  input, textarea, select {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Safe area for notched devices */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 4.3 Add Viewport Meta Tag

Ensure your `app/layout.tsx` has proper viewport settings:

```typescript
export const metadata = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  // ... other metadata
};
```

---

## 🔨 Phase 5: Build and Run

### 5.1 Build Your Next.js App

```cmd
npm run build
```

This creates the `out` directory with static files.

### 5.2 Sync Capacitor

```cmd
npx cap sync android
```

This copies web assets to the Android project.

### 5.3 Open in Android Studio

```cmd
npx cap open android
```

### 5.4 Run on Emulator or Device

In Android Studio:
1. Create/start an AVD (Android Virtual Device) or connect a physical device
2. Click the green "Run" button
3. Select your device/emulator

Or use CLI:
```cmd
npx cap run android
```

---

## 🔄 Phase 6: Development Workflow

### Option A: Live Reload (Development)

1. Start your Next.js dev server:
   ```cmd
   npm run dev
   ```

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true
   }
   ```

3. Sync and run:
   ```cmd
   npx cap sync android
   npx cap run android
   ```

### Option B: Static Build (Production Testing)

1. Build:
   ```cmd
   npm run build
   ```

2. Sync:
   ```cmd
   npx cap sync android
   ```

3. Run:
   ```cmd
   npx cap open android
   ```

---

## 📝 Phase 7: Handle Backend API Calls

Since your app has a backend, you need to configure API endpoints:

### 7.1 Create Environment Configuration

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 7.2 Update API Calls

Ensure all API calls use the environment variable:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

---

## 🚀 Phase 8: Build Release APK

### 8.1 Generate Keystore

```cmd
keytool -genkey -v -keystore artisan-marketplace.keystore -alias artisan -keyalg RSA -keysize 2048 -validity 10000
```

### 8.2 Configure Gradle

Update `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../../artisan-marketplace.keystore")
            storePassword "your-password"
            keyAlias "artisan"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 8.3 Build Release APK

In Android Studio:
- Build → Generate Signed Bundle / APK
- Select APK
- Choose your keystore
- Build

Or via CLI:
```cmd
cd android
gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔍 Troubleshooting

### Issue: "ANDROID_HOME not found"
- Restart your terminal/IDE after setting environment variables
- Verify path in System Properties → Environment Variables

### Issue: "SDK location not found"
- Create `android/local.properties`:
  ```
  sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
  ```

### Issue: Build fails with "Duplicate class"
- Clear Gradle cache:
  ```cmd
  cd android
  gradlew clean
  ```

### Issue: App shows blank screen
- Check browser console in Android Studio (View → Tool Windows → Logcat)
- Verify `webDir` in `capacitor.config.ts` matches your build output
- Ensure `npm run build` completed successfully

---

## 📋 Quick Command Reference

```cmd
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init

# Add Android platform
npx cap add android

# Build Next.js
npm run build

# Sync changes
npx cap sync android

# Open in Android Studio
npx cap open android

# Run on device
npx cap run android

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest
npx cap sync
```

---

## 🎯 Next Steps

1. ✅ Set up environment (Java, Android Studio, SDK)
2. ✅ Install Capacitor dependencies
3. ✅ Configure Next.js for static export
4. ✅ Make UI responsive for mobile
5. ✅ Build and test on emulator
6. ✅ Configure backend API endpoints
7. ✅ Test all features on device
8. ✅ Generate release APK
9. ✅ Publish to Google Play Store

---

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
