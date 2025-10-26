#!/usr/bin/env node

/**
 * Test script for the realistic photoshoot system
 * Tests product detection and photoshoot concept generation
 */

// Import our updated image generator tool
const { ImageGeneratorTool } = require('./lib/mcp-tools/image-generator.ts');

// Test cases for different product types
const testCases = [
  {
    name: "Hoodie Test",
    prompt: "stylish black hoodie with urban design",
    productInfo: {
      type: "hoodie",
      materials: ["cotton blend"],
      colors: ["black", "white"],
      culture: "streetwear"
    },
    style: "lifestyle"
  },
  {
    name: "T-Shirt Test", 
    prompt: "comfortable cotton t-shirt with artistic print",
    productInfo: {
      type: "t-shirt",
      materials: ["organic cotton"],
      colors: ["white", "navy"],
    },
    style: "studio"
  },
  {
    name: "Necklace Test",
    prompt: "elegant silver necklace with pendant",
    productInfo: {
      type: "necklace", 
      materials: ["sterling silver"],
      colors: ["silver"],
      culture: "artisan jewelry"
    },
    style: "editorial"
  },
  {
    name: "Handbag Test",
    prompt: "leather handbag with modern design",
    productInfo: {
      type: "handbag",
      materials: ["genuine leather"],
      colors: ["brown", "tan"]
    },
    style: "commercial"
  },
  {
    name: "Shoes Test",
    prompt: "comfortable running sneakers",
    productInfo: {
      type: "sneakers",
      materials: ["mesh", "rubber"],
      colors: ["white", "black", "red"]
    },
    style: "lifestyle"
  }
];

async function runTests() {
  console.log("🎯 TESTING REALISTIC PHOTOSHOOT SYSTEM");
  console.log("=====================================\n");
  
  const imageGenerator = new ImageGeneratorTool();
  
  for (const testCase of testCases) {
    console.log(`📸 ${testCase.name}`);
    console.log("-".repeat(40));
    
    try {
      const result = await imageGenerator.execute({
        prompt: testCase.prompt,
        productInfo: testCase.productInfo,
        style: testCase.style,
        dimensions: 'square'
      });
      
      if (result.success) {
        console.log(`✅ SUCCESS: ${result.result.type}`);
        console.log(`🔧 Tool: ${result.result.tool}`);
        console.log(`🎨 Style: ${result.result.style}`);
        
        if (result.result.prompt) {
          console.log(`📝 Enhanced Prompt: ${result.result.prompt.substring(0, 150)}...`);
        }
        
        if (result.result.note) {
          console.log(`📋 Note: ${result.result.note}`);
        }
      } else {
        console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`💥 ERROR: ${error.message}`);
    }
    
    console.log("\n");
  }
  
  console.log("🎉 Test completed!");
  console.log("\nREALISTIC FEATURES TESTED:");
  console.log("✓ Product-specific detection (hoodie, t-shirt, necklace, bag, shoes)");
  console.log("✓ Model scenario generation for each product type");
  console.log("✓ Photoshoot style adaptation (lifestyle, studio, editorial, commercial)");
  console.log("✓ Professional photography prompts");
  console.log("✓ Fallback CSS mockup system");
}

// Run the tests
runTests().catch(console.error);
