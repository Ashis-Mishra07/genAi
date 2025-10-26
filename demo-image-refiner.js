#!/usr/bin/env node

/**
 * Demo script for Image Refiner
 * Shows how the image refiner works without needing actual image files
 */

const { detectProductType, getPhotoshootConcept, generateRefinedImage } = require('./image-refiner.js');

console.log('🎯 IMAGE REFINER DEMO');
console.log('====================\n');

// Test different product types
const testImages = [
  'my-black-hoodie.jpg',
  'elegant-necklace.jpg', 
  'leather-handbag.jpg',
  'running-shoes.jpg',
  'summer-dress.jpg',
  'denim-jacket.jpg',
  'business-shirt.jpg'
];

async function runDemo() {
  for (const imagePath of testImages) {
    console.log(`📁 Processing: ${imagePath}`);
    
    // Detect product type
    const productType = detectProductType(imagePath);
    console.log(`🔍 Detected: ${productType}`);
    
    // Get photoshoot concept
    const concept = getPhotoshootConcept(productType);
    console.log(`👤 Model: ${concept.modelType}`);
    console.log(`📍 Setting: ${concept.setting}`);
    console.log(`🎨 Style: ${concept.style}`);
    
    // Generate refined image (simulation)
    const result = await generateRefinedImage(imagePath, productType);
    console.log(`🔗 Refined URL: ${result.imageUrl.substring(0, 80)}...`);
    
    console.log('─'.repeat(60) + '\n');
  }
  
  console.log('🎉 DEMO COMPLETE!');
  console.log('\n💡 HOW TO USE:');
  console.log('1. Save any product image (hoodie.jpg, necklace.png, etc.)');
  console.log('2. Run: node image-refiner.js your-image.jpg');
  console.log('3. Get refined photoshoot-style image with model!');
  
  console.log('\n✨ FEATURES:');
  console.log('• Automatic product detection from filename');
  console.log('• Product-specific model recommendations');
  console.log('• Professional photoshoot scenarios');
  console.log('• Realistic model placement and styling');
  console.log('• Instagram-ready aesthetic output');
  console.log('• No hardcoded templates - all dynamic!');
}

runDemo().catch(console.error);
