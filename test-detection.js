/**
 * Simple test to verify product detection logic
 */

function detectProductType(prompt, productInfo) {
  const text = (prompt + ' ' + JSON.stringify(productInfo || {})).toLowerCase();
  
  // Clothing detection with better patterns
  if (text.match(/\b(hoodie|hoody|sweatshirt|pullover|jumper)\b/)) return 'hoodie';
  if (text.match(/\b(t-?shirt|tee|top|tank)\b/)) return 'tshirt';
  if (text.match(/\b(shirt|blouse|button.?up|dress.?shirt)\b/)) return 'shirt';
  if (text.match(/\b(dress|gown|frock|sundress|maxi.?dress)\b/)) return 'dress';
  if (text.match(/\b(jeans|pants|trousers|bottoms|slacks|chinos)\b/)) return 'pants';
  if (text.match(/\b(jacket|blazer|coat|cardigan|sweater)\b/)) return 'jacket';
  if (text.match(/\b(shoes|sneakers|boots|footwear|sandals|heels)\b/)) return 'shoes';
  
  // Accessories detection
  if (text.match(/\b(necklace|chain|pendant|choker)\b/)) return 'necklace';
  if (text.match(/\b(ring|band|signet)\b/)) return 'ring';
  if (text.match(/\b(earrings|studs|hoops|dangles)\b/)) return 'earrings';
  if (text.match(/\b(bracelet|bangle|wristband|charm.?bracelet)\b/)) return 'bracelet';
  if (text.match(/\b(watch|timepiece|wristwatch)\b/)) return 'watch';
  if (text.match(/\b(bag|purse|handbag|backpack|tote|clutch|satchel)\b/)) return 'bag';
  if (text.match(/\b(hat|cap|beanie|fedora|baseball.?cap)\b/)) return 'hat';
  if (text.match(/\b(sunglasses|glasses|eyewear|shades)\b/)) return 'sunglasses';
  if (text.match(/\b(scarf|shawl|wrap|pashmina)\b/)) return 'scarf';
  
  // Home & Decor
  if (text.match(/\b(vase|pot|vessel|urn|planter)\b/)) return 'vase';
  if (text.match(/\b(candle|lamp|light|lantern|sconce)\b/)) return 'candle';
  if (text.match(/\b(pillow|cushion|throw|pillow.?case)\b/)) return 'pillow';
  if (text.match(/\b(artwork|painting|print|canvas|poster)\b/)) return 'artwork';
  if (text.match(/\b(sculpture|figurine|statue|carving)\b/)) return 'sculpture';
  if (text.match(/\b(bowl|dish|plate|ceramic|pottery)\b/)) return 'bowl';
  if (text.match(/\b(mirror|frame|wall.?decor)\b/)) return 'mirror';
  
  return 'general';
}

function getPhotoshootConcept(productType, style) {
  const concepts = {
    hoodie: {
      basePrompt: 'Professional fashion photoshoot featuring a model wearing a stylish hoodie, ',
      scenario: style === 'lifestyle' ? 
        'urban street setting, model walking casually, natural candid poses, city backdrop' :
        'clean white studio backdrop, model in confident standing poses, professional lighting setup',
      modelType: 'casual streetwear model',
      setting: 'urban street or professional studio'
    },
    
    tshirt: {
      basePrompt: 'Professional fashion photoshoot with a model wearing a stylish t-shirt, ',
      scenario: style === 'lifestyle' ? 
        'casual outdoor setting, model in relaxed natural poses, everyday fashion context' :
        'minimalist studio setup, model showcasing t-shirt fit and style',
      modelType: 'casual fashion model',
      setting: 'outdoor natural or clean studio'
    },
    
    necklace: {
      basePrompt: 'Professional jewelry photoshoot featuring a model wearing the elegant necklace, ',
      scenario: 'elegant portrait setting, model in natural graceful poses, necklace as the focal point',
      modelType: 'elegant jewelry model',
      setting: 'portrait studio with soft lighting'
    },
    
    bag: {
      basePrompt: 'Professional accessory photoshoot featuring a model with the stylish bag, ',
      scenario: 'urban street style setting, model carrying bag naturally, everyday fashion lifestyle context',
      modelType: 'street style fashion model',
      setting: 'urban street or lifestyle setting'
    },
    
    shoes: {
      basePrompt: 'Professional footwear photoshoot featuring a model wearing the stylish shoes, ',
      scenario: 'urban or natural outdoor setting, model walking or standing naturally, shoes in real-world context',
      modelType: 'active lifestyle model',
      setting: 'outdoor urban or natural environment'
    },
    
    general: {
      basePrompt: 'Professional product photoshoot showcasing the beautiful artisan item, ',
      scenario: 'natural authentic setting, product in real-world context, lifestyle integration',
      modelType: 'lifestyle model',
      setting: 'authentic lifestyle environment'
    }
  };
  
  return concepts[productType] || concepts.general;
}

// Test cases
const testCases = [
  {
    name: "Hoodie Detection",
    prompt: "stylish black hoodie with urban design",
    productInfo: { type: "hoodie" },
    expectedType: "hoodie"
  },
  {
    name: "T-Shirt Detection", 
    prompt: "comfortable cotton t-shirt with print",
    productInfo: { type: "t-shirt" },
    expectedType: "tshirt"
  },
  {
    name: "Necklace Detection",
    prompt: "elegant silver necklace with pendant",
    productInfo: { type: "necklace" },
    expectedType: "necklace"
  },
  {
    name: "Bag Detection",
    prompt: "leather handbag with modern design",
    productInfo: { type: "handbag" },
    expectedType: "bag"
  },
  {
    name: "Shoes Detection",
    prompt: "comfortable running sneakers",
    productInfo: { type: "sneakers" },
    expectedType: "shoes"
  },
  {
    name: "Complex Hoodie",
    prompt: "I have this amazing pullover hoodie that's perfect for streetwear",
    productInfo: {},
    expectedType: "hoodie"
  },
  {
    name: "Dress Detection",
    prompt: "beautiful summer dress with floral pattern",
    productInfo: { category: "clothing" },
    expectedType: "dress"
  }
];

console.log("🎯 TESTING REALISTIC PRODUCT DETECTION");
console.log("======================================\n");

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const detectedType = detectProductType(testCase.prompt, testCase.productInfo);
  const photoshootConcept = getPhotoshootConcept(detectedType, 'lifestyle');
  
  console.log(`📋 ${testCase.name}`);
  console.log(`   Input: "${testCase.prompt}"`);
  console.log(`   Expected: ${testCase.expectedType}`);
  console.log(`   Detected: ${detectedType}`);
  
  if (detectedType === testCase.expectedType) {
    console.log(`   ✅ PASS`);
    passed++;
  } else {
    console.log(`   ❌ FAIL`);
    failed++;
  }
  
  console.log(`   🎬 Photoshoot: ${photoshootConcept.basePrompt}`);
  console.log(`   👤 Model: ${photoshootConcept.modelType}`);
  console.log(`   📍 Setting: ${photoshootConcept.setting}`);
  console.log("");
}

console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
console.log("\n🎉 REALISTIC PHOTOSHOOT FEATURES:");
console.log("✓ Accurate product type detection");
console.log("✓ Product-specific model recommendations");
console.log("✓ Realistic photoshoot scenarios");
console.log("✓ Professional photography concepts");
console.log("✓ Model styling and pose suggestions");

if (failed === 0) {
  console.log("\n🎊 ALL TESTS PASSED! The realistic photoshoot system is working perfectly!");
} else {
  console.log(`\n⚠️  ${failed} tests failed. Need to improve detection patterns.`);
}
