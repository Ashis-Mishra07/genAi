#!/usr/bin/env node

/**
 * GEMINI PRODUCT ANALYZER & AD GENERATOR
 * Uses only Google/Gemini APIs to analyze images and create advertisements
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initialize Gemini AI
 */
function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('❌ No Gemini API key found. Please set GEMINI_API_KEY in your .env file');
  }
  
  console.log('🤖 Initializing Google Gemini AI...');
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Analyze uploaded image with Gemini Vision
 */
async function analyzeImageWithGemini(imagePath) {
  console.log('🔍 ANALYZING YOUR IMAGE WITH GEMINI VISION...');
  
  try {
    const genAI = initializeGemini();
    
    // Read and convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    
    console.log('📊 Image loaded:', path.basename(imagePath));
    console.log('📊 File size:', imageBuffer.length, 'bytes');
    console.log('📊 Format:', mimeType);
    
    // Try different Gemini models for vision analysis
    const models = [
      'gemini-1.5-pro-vision-latest',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-pro-vision'
    ];
    
    for (const modelName of models) {
      try {
        console.log(`🔄 Trying Gemini model: ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `Analyze this image in detail. Please provide:

1. **MAIN SUBJECT**: What is the primary product/item in this image?
2. **COLORS**: What are the dominant colors you can see?
3. **STYLE**: Describe the style, design, and aesthetic
4. **MATERIAL**: What material does it appear to be made of?
5. **CATEGORY**: What product category does this belong to? (clothing, electronics, food, etc.)
6. **BRAND POTENTIAL**: What kind of advertising would work best for this product?
7. **TARGET AUDIENCE**: Who would be interested in this product?
8. **VISUAL ELEMENTS**: Describe lighting, background, composition

Please be very specific and detailed in your analysis.`;

        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const analysis = response.text();
        
        console.log('✅ Gemini Vision Analysis Complete!');
        console.log('📝 Model used:', modelName);
        
        return {
          success: true,
          model: modelName,
          analysis: analysis,
          imagePath: imagePath,
          imageSize: imageBuffer.length,
          mimeType: mimeType
        };
        
      } catch (modelError) {
        console.log(`❌ ${modelName} failed:`, modelError.message);
        if (modelError.message.includes('SAFETY')) {
          console.log('⚠️ Safety filter triggered, trying next model...');
        }
        continue;
      }
    }
    
    throw new Error('All Gemini vision models failed');
    
  } catch (error) {
    console.error('❌ Image analysis failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Ask user about the main subject
 */
async function askUserAboutSubject(analysis) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n🎯 GEMINI DETECTED THE FOLLOWING:');
    console.log('================================');
    console.log(analysis.analysis);
    console.log('\n================================');
    
    rl.question('\n❓ What is the MAIN SUBJECT you want to advertise? (or press Enter to use Gemini\'s detection): ', (answer) => {
      rl.close();
      resolve(answer.trim() || 'auto-detect from Gemini analysis');
    });
  });
}

/**
 * Generate advertisement with Gemini
 */
async function generateAdvertisementWithGemini(analysis, userSubject) {
  console.log('\n📢 GENERATING ADVERTISEMENT WITH GEMINI...');
  
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const adPrompt = `Based on the image analysis and user input, create a professional advertisement concept:

IMAGE ANALYSIS:
${analysis.analysis}

USER SPECIFIED SUBJECT: ${userSubject}

Please generate:

1. **ADVERTISING CONCEPT**: A creative advertising concept for this product
2. **HEADLINE**: A catchy, memorable headline
3. **TARGET AUDIENCE**: Specific demographic and psychographic details
4. **KEY SELLING POINTS**: 3-5 main benefits to highlight
5. **VISUAL DIRECTION**: Detailed description for a photo/video shoot
6. **ADVERTISING COPY**: Short and long form copy options
7. **CALL TO ACTION**: Compelling CTAs for different platforms
8. **PLATFORM STRATEGY**: Which platforms would work best (social, print, digital, etc.)
9. **MOOD & TONE**: The emotional feeling the ad should convey
10. **TECHNICAL SPECS**: Camera settings, lighting, styling recommendations for the shoot

Make this a professional, comprehensive advertising strategy that could be used by a marketing agency.`;

    console.log('🎨 Generating comprehensive advertising strategy...');
    
    const result = await model.generateContent([adPrompt]);
    const response = await result.response;
    const adStrategy = response.text();
    
    console.log('✅ Advertisement strategy generated!');
    
    return {
      success: true,
      strategy: adStrategy,
      subject: userSubject,
      originalAnalysis: analysis.analysis
    };
    
  } catch (error) {
    console.error('❌ Advertisement generation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate visual advertisement prompt with Gemini
 */
async function generateVisualAdWithGemini(adStrategy, subject) {
  console.log('\n🎨 CREATING VISUAL ADVERTISEMENT PROMPT WITH GEMINI...');
  
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const visualPrompt = `Based on this advertising strategy, create a detailed visual prompt for generating the actual advertisement image:

ADVERTISING STRATEGY:
${adStrategy.strategy}

MAIN SUBJECT: ${subject}

Please create a detailed prompt that could be used with image generation services. Include:

1. **MAIN COMPOSITION**: How the product should be positioned
2. **MODEL/PERSON**: If needed, describe the ideal model/person
3. **BACKGROUND**: Detailed background description
4. **LIGHTING**: Professional lighting setup
5. **CAMERA ANGLE**: Best angles and perspectives
6. **STYLING**: Props, accessories, styling elements
7. **COLOR PALETTE**: Specific colors that enhance the product
8. **MOOD**: The overall feeling and atmosphere
9. **TEXT PLACEMENT**: Where text/logos should go
10. **TECHNICAL DETAILS**: Photography specifications

Format this as a comprehensive prompt that could generate a professional advertisement image.`;

    console.log('📸 Generating visual advertisement prompt...');
    
    const result = await model.generateContent([visualPrompt]);
    const response = await result.response;
    const visualPrompt_text = response.text();
    
    console.log('✅ Visual advertisement prompt created!');
    
    return {
      success: true,
      visualPrompt: visualPrompt_text,
      fullStrategy: adStrategy
    };
    
  } catch (error) {
    console.error('❌ Visual prompt generation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function processImageForAdvertising(imagePath) {
  try {
    console.log('🚀 GEMINI PRODUCT ANALYZER & AD GENERATOR');
    console.log('==========================================');
    console.log('🎯 Using ONLY Google/Gemini APIs for complete analysis and ad generation');
    
    // Step 1: Analyze image with Gemini Vision
    console.log('\n📸 STEP 1: ANALYZING IMAGE WITH GEMINI VISION');
    const analysis = await analyzeImageWithGemini(imagePath);
    
    if (!analysis.success) {
      throw new Error('Image analysis failed: ' + analysis.error);
    }
    
    // Step 2: Ask user about main subject
    console.log('\n❓ STEP 2: CONFIRMING MAIN SUBJECT');
    const userSubject = await askUserAboutSubject(analysis);
    
    // Step 3: Generate advertisement strategy with Gemini
    console.log('\n📢 STEP 3: GENERATING ADVERTISEMENT STRATEGY');
    const adStrategy = await generateAdvertisementWithGemini(analysis, userSubject);
    
    if (!adStrategy.success) {
      throw new Error('Advertisement generation failed: ' + adStrategy.error);
    }
    
    // Step 4: Generate visual advertisement prompt
    console.log('\n🎨 STEP 4: CREATING VISUAL ADVERTISEMENT');
    const visualAd = await generateVisualAdWithGemini(adStrategy, userSubject);
    
    if (!visualAd.success) {
      throw new Error('Visual ad generation failed: ' + visualAd.error);
    }
    
    // Final result
    const result = {
      success: true,
      imagePath: imagePath,
      analysis: analysis,
      subject: userSubject,
      advertisementStrategy: adStrategy,
      visualAdvertisement: visualAd,
      generatedWith: 'Google Gemini AI (100% Google products)',
      timestamp: new Date().toISOString()
    };
    
    console.log('\n🎉 SUCCESS - COMPLETE ADVERTISEMENT GENERATED!');
    console.log('==============================================');
    console.log('✅ Image analyzed with Gemini Vision');
    console.log('✅ User input collected');
    console.log('✅ Advertisement strategy created with Gemini');
    console.log('✅ Visual advertisement prompt generated');
    console.log('✅ 100% Google/Gemini powered solution');
    
    return result;
    
  } catch (error) {
    console.error('❌ PROCESS FAILED:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export
module.exports = { processImageForAdvertising };

// CLI usage
if (require.main === module) {
  const imagePath = process.argv[2];
  if (!imagePath) {
    console.log('🎯 GEMINI PRODUCT ANALYZER & AD GENERATOR');
    console.log('Usage: node gemini-ad-generator.js <your-image>');
    console.log('Example: node gemini-ad-generator.js ./product.jpg');
    console.log('');
    console.log('This tool uses ONLY Google/Gemini APIs to:');
    console.log('1. Analyze your product image with Gemini Vision');
    console.log('2. Ask you about the main subject');
    console.log('3. Generate comprehensive advertising strategy');
    console.log('4. Create visual advertisement prompts');
    process.exit(1);
  }
  
  if (!fs.existsSync(imagePath)) {
    console.error('❌ Image file not found:', imagePath);
    process.exit(1);
  }
  
  processImageForAdvertising(imagePath)
    .then(result => {
      if (result.success) {
        console.log('\n📊 COMPLETE RESULTS:');
        console.log('====================');
        
        console.log('\n🔍 IMAGE ANALYSIS:');
        console.log(result.analysis.analysis);
        
        console.log('\n🎯 MAIN SUBJECT:', result.subject);
        
        console.log('\n📢 ADVERTISEMENT STRATEGY:');
        console.log(result.advertisementStrategy.strategy);
        
        console.log('\n🎨 VISUAL ADVERTISEMENT PROMPT:');
        console.log(result.visualAdvertisement.visualPrompt);
        
        // Save complete result
        const filename = `gemini-ad-result-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(result, null, 2));
        console.log('\n💾 Complete result saved to:', filename);
        
        console.log('\n🎉 READY FOR IMPLEMENTATION!');
        console.log('Use the visual prompt above with any image generation service');
        console.log('All analysis and strategy powered by Google Gemini AI');
        
      } else {
        console.log('\n❌ FAILED:', result.error);
      }
    })
    .catch(console.error);
}
