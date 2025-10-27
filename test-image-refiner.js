#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the image refiner functions
const { detectProductType, getPhotoshootConcept, generateRefinedImage } = require('./image-refiner.js');

async function testImageRefiner() {
  console.log('🎨 Image Refiner Test Tool');
  console.log('========================\n');

  // Check if image path is provided
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.log('Usage: node test-image-refiner.js <image-path>');
    console.log('Example: node test-image-refiner.js ./my-product.jpg');
    console.log('\nOr test with sample scenarios:');
    console.log('node test-image-refiner.js test-pottery');
    console.log('node test-image-refiner.js test-jewelry');
    console.log('node test-image-refiner.js test-clothing');
    return;
  }

  // Handle test scenarios
  if (imagePath.startsWith('test-')) {
    const testType = imagePath.replace('test-', '');
    await runTestScenario(testType);
    return;
  }

  // Check if image file exists
  if (!fs.existsSync(imagePath)) {
    console.log(`❌ Error: Image file '${imagePath}' not found`);
    return;
  }

  try {
    console.log(`📁 Processing image: ${path.basename(imagePath)}`);
    console.log('⏳ Analyzing and refining...\n');

    // Process the image
    const result = await generateRefinedImage(imagePath);
    
    if (result.success) {
      console.log('✅ Image refined successfully!');
      console.log(`🔍 Detected product: ${result.detectedProduct}`);
      console.log(`📸 Photoshoot style: ${result.concept.style}`);
      console.log(`👤 Model type: ${result.concept.modelType}`);
      console.log(`🏠 Setting: ${result.concept.setting}`);
      console.log(`🖼️ Refined image URL: ${result.imageUrl}`);
      
      // Save the result to a JSON file for reference
      const resultData = {
        originalImage: imagePath,
        processedAt: new Date().toISOString(),
        ...result
      };
      
      const outputFile = `test-result-${Date.now()}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(resultData, null, 2));
      console.log(`💾 Results saved to: ${outputFile}`);
      
    } else {
      console.log('❌ Failed to refine image');
      console.log(`Error: ${result.error}`);
    }

  } catch (error) {
    console.log('❌ Error processing image:', error.message);
  }
}

async function runTestScenario(testType) {
  console.log(`🧪 Running test scenario: ${testType}\n`);
  
  // Simulate product detection with the test type directly
  const detectedProduct = detectProductType(`${testType}_test_image.jpg`);
  console.log(`🔍 Detected product type: ${detectedProduct}`);
  
  // Get photoshoot concept
  const concept = getPhotoshootConcept(detectedProduct);
  console.log(`📸 Photoshoot concept:`);
  console.log(`   Style: ${concept.style}`);
  console.log(`   Model: ${concept.modelType}`);
  console.log(`   Setting: ${concept.setting}`);
  console.log(`   Poses: ${concept.poses}`);
  console.log(`   Prompt: ${concept.prompt}\n`);
  
  // Simulate image generation (without actually calling the API)
  console.log('🎨 Generated photoshoot concept successfully!');
  console.log(`✨ This would create a professional ${concept.style} featuring ${concept.modelType} in ${concept.setting}`);
  
  // Show what the API call would look like
  const simulatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(concept.prompt)}?width=1024&height=1024&model=flux&seed=${Math.floor(Math.random() * 1000)}`;
  console.log(`🔗 Simulation URL: ${simulatedUrl}`);
}

// Run the test
testImageRefiner().catch(console.error);
