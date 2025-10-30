#!/usr/bin/env node

/**
 * Environment Check Script for Android Development
 * Checks if all required tools are installed for Capacitor Android development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Android Development Environment...\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to run commands safely
function runCommand(command, description) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    checks.passed.push(`✅ ${description}`);
    return output.trim();
  } catch (error) {
    checks.failed.push(`❌ ${description}`);
    return null;
  }
}

// Helper function to check environment variables
function checkEnvVar(varName, description) {
  const value = process.env[varName];
  if (value) {
    checks.passed.push(`✅ ${description}: ${value}`);
    return value;
  } else {
    checks.failed.push(`❌ ${description} not set`);
    return null;
  }
}

// Helper function to check if path exists
function checkPath(pathToCheck, description) {
  if (fs.existsSync(pathToCheck)) {
    checks.passed.push(`✅ ${description} exists`);
    return true;
  } else {
    checks.failed.push(`❌ ${description} not found at: ${pathToCheck}`);
    return false;
  }
}

console.log('📦 Checking Node.js and npm...');
const nodeVersion = runCommand('node -v', 'Node.js installed');
const npmVersion = runCommand('npm -v', 'npm installed');
if (nodeVersion) console.log(`   Version: ${nodeVersion}`);
if (npmVersion) console.log(`   npm Version: ${npmVersion}`);
console.log();

console.log('☕ Checking Java JDK...');
const javaVersion = runCommand('java -version', 'Java installed');
const javaHome = checkEnvVar('JAVA_HOME', 'JAVA_HOME environment variable');
if (javaHome) {
  checkPath(javaHome, 'JAVA_HOME path');
}
console.log();

console.log('🤖 Checking Android SDK...');
const androidHome = checkEnvVar('ANDROID_HOME', 'ANDROID_HOME environment variable');
const androidSdkRoot = process.env['ANDROID_SDK_ROOT'];
if (androidSdkRoot) {
  checks.passed.push(`✅ ANDROID_SDK_ROOT: ${androidSdkRoot}`);
}

if (androidHome) {
  checkPath(androidHome, 'Android SDK directory');
  checkPath(path.join(androidHome, 'platform-tools'), 'Android platform-tools');
  checkPath(path.join(androidHome, 'platforms'), 'Android platforms');
  checkPath(path.join(androidHome, 'build-tools'), 'Android build-tools');
}

const adbVersion = runCommand('adb --version', 'ADB (Android Debug Bridge)');
if (adbVersion) console.log(`   ${adbVersion.split('\n')[0]}`);
console.log();

console.log('🔧 Checking Gradle...');
const gradleVersion = runCommand('gradle -v', 'Gradle installed');
if (!gradleVersion) {
  checks.warnings.push('⚠️  Gradle not in PATH (Android Studio includes its own Gradle)');
}
console.log();

console.log('📱 Checking Capacitor...');
const capacitorInstalled = fs.existsSync(path.join(process.cwd(), 'node_modules', '@capacitor', 'core'));
if (capacitorInstalled) {
  checks.passed.push('✅ Capacitor core installed');
  
  const androidInstalled = fs.existsSync(path.join(process.cwd(), 'node_modules', '@capacitor', 'android'));
  if (androidInstalled) {
    checks.passed.push('✅ Capacitor Android platform installed');
  } else {
    checks.failed.push('❌ Capacitor Android platform not installed');
  }
  
  const capacitorConfigExists = fs.existsSync(path.join(process.cwd(), 'capacitor.config.ts')) || 
                                  fs.existsSync(path.join(process.cwd(), 'capacitor.config.json'));
  if (capacitorConfigExists) {
    checks.passed.push('✅ Capacitor config file exists');
  } else {
    checks.warnings.push('⚠️  Capacitor not initialized (run: npx cap init)');
  }
  
  const androidFolderExists = fs.existsSync(path.join(process.cwd(), 'android'));
  if (androidFolderExists) {
    checks.passed.push('✅ Android project folder exists');
  } else {
    checks.warnings.push('⚠️  Android platform not added (run: npx cap add android)');
  }
} else {
  checks.failed.push('❌ Capacitor not installed');
}
console.log();

console.log('🏗️  Checking Next.js Configuration...');
const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (nextConfig.includes("output: 'export'")) {
    checks.passed.push('✅ Next.js configured for static export');
  } else {
    checks.warnings.push("⚠️  Next.js not configured for static export (change output to 'export')");
  }
} else {
  checks.warnings.push('⚠️  next.config.ts not found');
}
console.log();

// Summary
console.log('═══════════════════════════════════════════════════════');
console.log('📊 SUMMARY');
console.log('═══════════════════════════════════════════════════════\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED CHECKS:');
  checks.passed.forEach(check => console.log(`   ${check}`));
  console.log();
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
  console.log();
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
  console.log();
}

// Recommendations
console.log('═══════════════════════════════════════════════════════');
console.log('💡 NEXT STEPS');
console.log('═══════════════════════════════════════════════════════\n');

if (checks.failed.some(f => f.includes('Node.js'))) {
  console.log('1. Install Node.js LTS from: https://nodejs.org/');
}

if (checks.failed.some(f => f.includes('Java'))) {
  console.log('2. Install Java JDK 17+ from: https://adoptium.net/');
  console.log('   Set JAVA_HOME environment variable');
}

if (checks.failed.some(f => f.includes('Android') || f.includes('ADB'))) {
  console.log('3. Install Android Studio from: https://developer.android.com/studio');
  console.log('   Set ANDROID_HOME environment variable');
  console.log('   Add to PATH: %ANDROID_HOME%\\platform-tools');
}

if (checks.failed.some(f => f.includes('Capacitor'))) {
  console.log('4. Install Capacitor:');
  console.log('   npm install @capacitor/core @capacitor/cli @capacitor/android');
  console.log('   npx cap init');
  console.log('   npx cap add android');
}

if (checks.warnings.some(w => w.includes('static export'))) {
  console.log('5. Update next.config.ts to use static export');
  console.log("   Change: output: 'export'");
  console.log("   Add: images: { unoptimized: true }");
}

if (checks.failed.length === 0 && checks.warnings.length === 0) {
  console.log('🎉 Your environment is ready for Android development!');
  console.log('\nYou can now:');
  console.log('   1. npm run build');
  console.log('   2. npx cap sync android');
  console.log('   3. npx cap open android');
}

console.log('\n📖 For detailed instructions, see: ANDROID_CAPACITOR_SETUP.md');
console.log('═══════════════════════════════════════════════════════\n');

// Exit with appropriate code
process.exit(checks.failed.length > 0 ? 1 : 0);
