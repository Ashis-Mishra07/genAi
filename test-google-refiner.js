#!/usr/bin/env node

/**
 * Test the Google-only image refiner with a hoodie
 */

const { refineImageWithGoogle } = require('./google-image-refiner.js');

async function testHoodieRefinement() {
  console.log('🧪 TESTING GOOGLE IMAGE REFINER WITH HOODIE');
  console.log('===========================================');
  
  // Create a sample hoodie image data (for testing)
  // In real use, you would pass your actual hoodie image file path
  const testImagePath = process.argv[2];
  
  if (!testImagePath) {
    console.log('❌ Please provide an image path:');
    console.log('node test-google-refiner.js /path/to/your/hoodie.jpg');
    console.log('\nOr test with sample data:');
    console.log('node test-google-refiner.js sample');
    return;
  }
  
  let imageInput;
  if (testImagePath === 'sample') {
    // Sample base64 for testing (tiny test image)
    imageInput = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    console.log('🧪 Using sample test data...');
  } else {
    imageInput = testImagePath;
    console.log('📁 Using image file:', testImagePath);
  }
  
  try {
    const result = await refineImageWithGoogle(imageInput);
    
    if (result.success) {
      console.log('\n🎉 SUCCESS! GOOGLE AI COMPLETED ALL TASKS:');
      console.log('==========================================');
      
      console.log('\n📊 PRODUCT ANALYSIS:');
      console.log('- Product:', result.originalAnalysis.productData.type);
      console.log('- Color:', result.originalAnalysis.productData.color);
      console.log('- Style:', result.originalAnalysis.productData.style);
      console.log('- Material:', result.originalAnalysis.productData.material);
      console.log('- Google Model:', result.googleModel);
      
      console.log('\n✅ TASKS COMPLETED:');
      console.log('- Product Identified:', result.taskCompleted.productIdentified ? '✅' : '❌');
      console.log('- Background Removed:', result.taskCompleted.backgroundRemoved ? '✅' : '❌');
      console.log('- Model Added:', result.taskCompleted.modelAdded ? '✅' : '❌');
      console.log('- Professional Photo:', result.taskCompleted.professionalPhoto ? '✅' : '❌');
      
      console.log('\n📸 FINAL PHOTOSHOOT URL:');
      console.log(result.finalImageUrl);
      
      console.log('\n🎯 SPECS:');
      console.log('- Quality:', result.photoshoot.quality);
      console.log('- Camera Specs:', result.photoshoot.specs);
      console.log('- Background Removed:', result.photoshoot.backgroundRemoved ? 'YES' : 'NO');
      console.log('- Model Added:', result.photoshoot.modelAdded ? 'YES' : 'NO');
      
      // Save result to file
      const fs = require('fs');
      fs.writeFileSync('google-refiner-result.json', JSON.stringify(result, null, 2));
      console.log('\n💾 Full result saved to: google-refiner-result.json');
      
    } else {
      console.log('\n❌ FAILED:', result.error);
      console.log('💡 Make sure your GEMINI_API_KEY is set in .env file');
    }
    
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
  }
}

// Run the test
testHoodieRefinement();
