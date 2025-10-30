#!/usr/bin/env node

/**
 * Icon Generator Script for PWA
 * 
 * This script generates placeholder icons for the PWA.
 * For production, replace these with actual designed icons.
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');

// Create directories if they don't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG icons
sizes.forEach(size => {
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.5}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">A</text>
</svg>`.trim();

  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png.svg`), svg);
  console.log(`✓ Generated icon-${size}x${size}.png.svg`);
});

// Generate placeholder screenshots
const desktopScreenshot = `
<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#0f172a"/>
  <text x="640" y="360" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#f97316" text-anchor="middle" dominant-baseline="central">Artisan Marketplace</text>
  <text x="640" y="420" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle" dominant-baseline="central">Desktop Screenshot</text>
</svg>`.trim();

const mobileScreenshot = `
<svg width="750" height="1334" xmlns="http://www.w3.org/2000/svg">
  <rect width="750" height="1334" fill="#0f172a"/>
  <text x="375" y="667" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#f97316" text-anchor="middle" dominant-baseline="central">Artisan Marketplace</text>
  <text x="375" y="720" font-family="Arial, sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle" dominant-baseline="central">Mobile Screenshot</text>
</svg>`.trim();

fs.writeFileSync(path.join(screenshotsDir, 'desktop-1.png.svg'), desktopScreenshot);
fs.writeFileSync(path.join(screenshotsDir, 'mobile-1.png.svg'), mobileScreenshot);

console.log('✓ Generated desktop-1.png.svg');
console.log('✓ Generated mobile-1.png.svg');

console.log('\n✨ Icon generation complete!');
console.log('\n📝 Note: These are placeholder SVG icons.');
console.log('For production, replace them with actual PNG icons using a tool like:');
console.log('  - https://realfavicongenerator.net/');
console.log('  - https://www.pwabuilder.com/');
console.log('  - Adobe Photoshop/Illustrator');
console.log('  - Figma with export plugin\n');
