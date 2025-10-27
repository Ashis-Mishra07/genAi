const fs = require('fs');
const path = require('path');

// Import the image refiner
const { detectProductType, getPhotoshootConcept, generateRefinedImage } = require('./image-refiner.js');

console.log('🎨 Quick Image Test');
console.log('==================\n');

// Test with different scenarios
async function quickTest() {
  const testCases = [
    { filename: 'pottery_bowl.jpg', expected: 'pottery' },
    { filename: 'silver_earrings.jpg', expected: 'jewelry' },
    { filename: 'leather_jacket.jpg', expected: 'jacket' },
    { filename: 'wooden_chair.jpg', expected: 'woodwork' },
    { filename: 'handmade_soap.jpg', expected: 'soap' },
    { filename: 'ceramic_vase.jpg', expected: 'vase' },
    { filename: 'knitted_scarf.jpg', expected: 'scarf' },
    { filename: 'glass_sculpture.jpg', expected: 'glass' }
  ];

  console.log('Testing product detection and photoshoot concepts:\n');

  for (const testCase of testCases) {
    console.log(`📸 Testing: ${testCase.filename}`);
    
    // Test product detection
    const detected = detectProductType(testCase.filename);
    console.log(`   Detected: ${detected}`);
    
    // Get photoshoot concept
    const concept = getPhotoshootConcept(detected);
    console.log(`   Model: ${concept.modelType}`);
    console.log(`   Setting: ${concept.setting}`);
    console.log(`   Style: ${concept.style}`);
    console.log('   ---');
  }

  console.log('\n✅ All tests completed!');
  console.log('\n🚀 To test with a real image:');
  console.log('   node test-image-refiner.js your-image.jpg');
  console.log('\n🧪 To test scenarios:');
  console.log('   node test-image-refiner.js test-pottery');
  console.log('   node test-image-refiner.js test-jewelry');
  console.log('   node test-image-refiner.js test-clothing');
}

// Also provide a simple function to test one image
async function testSingleImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.log(`❌ Image not found: ${imagePath}`);
    return;
  }

  console.log(`\n🔍 Testing image: ${path.basename(imagePath)}`);
  
  try {
    const result = await generateRefinedImage(imagePath);
    
    if (result.success) {
      console.log('✅ Success!');
      console.log(`Product: ${result.detectedProduct}`);
      console.log(`Refined URL: ${result.imageUrl}`);
    } else {
      console.log('❌ Failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Run quick test by default
quickTest();

// Export for use in other files
module.exports = { testSingleImage };
