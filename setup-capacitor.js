#!/usr/bin/env node

/**
 * Automated Capacitor Setup Script
 * This script helps set up Capacitor for your Next.js project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    return false;
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   📱 Capacitor Setup for Artisan Marketplace App     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Step 1: Check if Capacitor is already installed
  const capacitorInstalled = fs.existsSync(path.join(process.cwd(), 'node_modules', '@capacitor', 'core'));
  
  if (!capacitorInstalled) {
    console.log('📦 Installing Capacitor dependencies...\n');
    const installed = runCommand(
      'npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen',
      'Installing Capacitor packages'
    );
    
    if (!installed) {
      console.log('\n❌ Failed to install Capacitor. Please check your npm installation.');
      process.exit(1);
    }
  } else {
    console.log('✅ Capacitor is already installed\n');
  }

  // Step 2: Check if Capacitor is initialized
  const capacitorConfigExists = fs.existsSync(path.join(process.cwd(), 'capacitor.config.ts'));
  
  if (!capacitorConfigExists) {
    console.log('🔧 Initializing Capacitor...\n');
    
    const appName = await question('Enter app name (default: Artisan Marketplace): ') || 'Artisan Marketplace';
    const appId = await question('Enter app ID (default: com.artisan.marketplace): ') || 'com.artisan.marketplace';
    
    // Create capacitor config manually
    const capacitorConfig = `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${appId}',
  appName: '${appName}',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  }
};

export default config;
`;
    
    fs.writeFileSync('capacitor.config.ts', capacitorConfig);
    console.log('✅ Created capacitor.config.ts');
  } else {
    console.log('✅ Capacitor is already initialized\n');
  }

  // Step 3: Update Next.js config for static export
  console.log('\n🔧 Updating Next.js configuration for static export...\n');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (!nextConfig.includes("output: 'export'")) {
      // Backup original config
      fs.writeFileSync('next.config.ts.backup', nextConfig);
      console.log('📄 Backed up original next.config.ts to next.config.ts.backup');
      
      // Update config
      nextConfig = nextConfig.replace(/output:\s*['"]standalone['"]/, "output: 'export'");
      
      // Add images config if not present
      if (!nextConfig.includes('images:')) {
        nextConfig = nextConfig.replace(
          /const nextConfig: NextConfig = {/,
          `const nextConfig: NextConfig = {\n  output: 'export',\n  images: {\n    unoptimized: true,\n  },`
        );
      }
      
      fs.writeFileSync(nextConfigPath, nextConfig);
      console.log('✅ Updated next.config.ts for static export');
    } else {
      console.log('✅ Next.js already configured for static export');
    }
  }

  // Step 4: Add Android platform
  const androidFolderExists = fs.existsSync(path.join(process.cwd(), 'android'));
  
  if (!androidFolderExists) {
    console.log('\n🤖 Adding Android platform...\n');
    const added = runCommand('npx cap add android', 'Adding Android platform');
    
    if (!added) {
      console.log('\n⚠️  Failed to add Android platform. You may need to:');
      console.log('   1. Install Android Studio and SDK');
      console.log('   2. Set ANDROID_HOME environment variable');
      console.log('   3. Run: npx cap add android');
    }
  } else {
    console.log('✅ Android platform already added\n');
  }

  // Step 5: Create mobile-specific styles
  console.log('\n🎨 Creating mobile-specific styles...\n');
  
  const mobileStylesPath = path.join(process.cwd(), 'app', 'mobile.css');
  const mobileStyles = `/* Mobile-specific styles for Capacitor */

/* Prevent zoom on input focus */
@media (max-width: 768px) {
  body {
    font-size: 16px;
  }
  
  input, textarea, select {
    font-size: 16px;
  }
}

/* Safe area for notched devices */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Touch-friendly buttons */
button, a {
  min-height: 44px;
  min-width: 44px;
}

/* Disable text selection for better mobile feel */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

/* Smooth scrolling */
html {
  -webkit-overflow-scrolling: touch;
}
`;
  
  if (!fs.existsSync(mobileStylesPath)) {
    fs.writeFileSync(mobileStylesPath, mobileStyles);
    console.log('✅ Created app/mobile.css');
    console.log('   Remember to import this in your layout.tsx');
  }

  // Step 6: Create build script
  console.log('\n📝 Adding build scripts to package.json...\n');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'cap:build': 'npm run build && npx cap sync android',
    'cap:open': 'npx cap open android',
    'cap:run': 'npm run build && npx cap sync android && npx cap run android',
    'cap:sync': 'npx cap sync android'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added Capacitor scripts to package.json');

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                  ✅ SETUP COMPLETE!                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  console.log('📋 New npm scripts available:');
  console.log('   npm run cap:build  - Build Next.js and sync to Android');
  console.log('   npm run cap:open   - Open project in Android Studio');
  console.log('   npm run cap:run    - Build and run on device/emulator');
  console.log('   npm run cap:sync   - Sync web assets to Android\n');

  console.log('🚀 Next steps:');
  console.log('   1. Ensure Android Studio and SDK are installed');
  console.log('   2. Run: npm run cap:build');
  console.log('   3. Run: npm run cap:open');
  console.log('   4. Click "Run" in Android Studio\n');

  console.log('📖 For detailed instructions, see: ANDROID_CAPACITOR_SETUP.md\n');

  rl.close();
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
