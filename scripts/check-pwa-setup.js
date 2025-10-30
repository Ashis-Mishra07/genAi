#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking PWA Setup...\n');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

// Check manifest.json
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  checks.passed.push('✅ manifest.json exists');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.name && manifest.short_name) {
      checks.passed.push('✅ Manifest has required fields');
    } else {
      checks.warnings.push('⚠️  Manifest missing name or short_name');
    }
    if (manifest.icons && manifest.icons.length > 0) {
      checks.passed.push(`✅ Manifest has ${manifest.icons.length} icons`);
    } else {
      checks.failed.push('❌ Manifest has no icons');
    }
  } catch (e) {
    checks.failed.push('❌ Manifest JSON is invalid');
  }
} else {
  checks.failed.push('❌ manifest.json not found');
}

// Check service worker
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  checks.passed.push('✅ Service worker (sw.js) exists');
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('install') && swContent.includes('fetch')) {
    checks.passed.push('✅ Service worker has required event listeners');
  } else {
    checks.warnings.push('⚠️  Service worker may be incomplete');
  }
} else {
  checks.failed.push('❌ Service worker (sw.js) not found');
}

// Check offline page
const offlinePath = path.join(__dirname, '..', 'public', 'offline.html');
if (fs.existsSync(offlinePath)) {
  checks.passed.push('✅ Offline page exists');
} else {
  checks.warnings.push('⚠️  Offline page not found');
}

// Check icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (fs.existsSync(iconsDir)) {
  const icons = fs.readdirSync(iconsDir);
  if (icons.length > 0) {
    checks.passed.push(`✅ Icons directory has ${icons.length} files`);
  } else {
    checks.warnings.push('⚠️  Icons directory is empty - run: npm run pwa:icons');
  }
} else {
  checks.warnings.push('⚠️  Icons directory not found - run: npm run pwa:icons');
}

// Check PWA components
const componentsDir = path.join(__dirname, '..', 'components');
const pwaComponents = ['PWARegister.tsx', 'PWAInstallPrompt.tsx', 'MobileNav.tsx'];
pwaComponents.forEach(component => {
  const componentPath = path.join(componentsDir, component);
  if (fs.existsSync(componentPath)) {
    checks.passed.push(`✅ ${component} exists`);
  } else {
    checks.failed.push(`❌ ${component} not found`);
  }
});

// Check layout.tsx for PWA integration
const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('PWARegister')) {
    checks.passed.push('✅ PWARegister integrated in layout');
  } else {
    checks.warnings.push('⚠️  PWARegister not found in layout');
  }
  if (layoutContent.includes('manifest')) {
    checks.passed.push('✅ Manifest linked in metadata');
  } else {
    checks.warnings.push('⚠️  Manifest not linked in metadata');
  }
} else {
  checks.failed.push('❌ app/layout.tsx not found');
}

// Check globals.css for responsive utilities
const globalsPath = path.join(__dirname, '..', 'app', 'globals.css');
if (fs.existsSync(globalsPath)) {
  const cssContent = fs.readFileSync(globalsPath, 'utf8');
  if (cssContent.includes('safe-area-inset')) {
    checks.passed.push('✅ Safe area support in CSS');
  } else {
    checks.warnings.push('⚠️  Safe area support not found in CSS');
  }
  if (cssContent.includes('container-mobile')) {
    checks.passed.push('✅ Responsive utilities in CSS');
  } else {
    checks.warnings.push('⚠️  Responsive utilities not found in CSS');
  }
} else {
  checks.failed.push('❌ app/globals.css not found');
}

// Check Capacitor setup
const capacitorConfigPath = path.join(__dirname, '..', 'android', 'capacitor.settings.gradle');
if (fs.existsSync(capacitorConfigPath)) {
  checks.passed.push('✅ Capacitor Android platform configured');
} else {
  checks.warnings.push('⚠️  Capacitor Android platform not found');
}

// Print results
console.log('📊 Results:\n');

checks.passed.forEach(msg => console.log(msg));
checks.warnings.forEach(msg => console.log(msg));
checks.failed.forEach(msg => console.log(msg));

console.log('\n' + '='.repeat(60));

if (checks.failed.length === 0) {
  console.log('\n🎉 PWA setup is complete!');
  console.log('\n📱 Next steps:');
  console.log('   1. npm run pwa:icons (if icons not generated)');
  console.log('   2. npm run build');
  console.log('   3. npm start');
  console.log('   4. Test on mobile device');
  console.log('\n📖 See PWA_SETUP_GUIDE.md for detailed instructions');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.');
  console.log('📖 See PWA_SETUP_GUIDE.md for setup instructions');
}

console.log('\n' + '='.repeat(60) + '\n');

// Summary
console.log('📈 Summary:');
console.log(`   ✅ Passed: ${checks.passed.length}`);
console.log(`   ⚠️  Warnings: ${checks.warnings.length}`);
console.log(`   ❌ Failed: ${checks.failed.length}\n`);
