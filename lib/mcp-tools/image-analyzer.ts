import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageGeneratorTool } from './image-generator';

// Currency symbol mapping
function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: '$',
    AUD: '$',
    JPY: '¥'
  };
  return symbols[currency] || currency;
}

export class ImageAnalyzerTool {
  private genAI: GoogleGenerativeAI;
  private imageGenerator: ImageGeneratorTool;
  private modelQueue = [
    'gemini-2.5-flash',  // Free tier friendly
    'gemini-1.0-pro-vision-latest',  // Fallback vision model
    'gemini-pro-vision'  // Last resort
  ];

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.imageGenerator = new ImageGeneratorTool();
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async execute(args: { imageData: string; prompt?: string; action?: 'analyze' | 'refine' | 'poster'; productInfo?: any }) {
    let lastError: any = null;
    
    // Try each model in sequence until one works
    for (const modelName of this.modelQueue) {
      try {
        return await this.executeWithModel(args, modelName);
      } catch (error: any) {
        console.log(`Model ${modelName} failed:`, error.message);
        lastError = error;
        
        // If it's a rate limit error, wait a bit before trying next model
        if (error.message?.includes('RATE_LIMIT_EXCEEDED') || error.message?.includes('429')) {
          console.log('Rate limit hit, trying next model...');
          await this.delay(1000); // Wait 1 second
          continue;
        }
        
        // For other errors, try next model immediately
        continue;
      }
    }
    
    // If all models failed, return error
    console.error('All models failed. Last error:', lastError);
    return {
      success: false,
      error: `All AI models are currently unavailable due to rate limits. Please try again in a few minutes. Consider upgrading to a paid Gemini API plan for better reliability.`,
      timestamp: new Date().toISOString(),
      suggestion: 'Try again in 2-3 minutes or consider upgrading your Gemini API plan.'
    };
  }

  private async executeWithModel(args: { imageData: string; prompt?: string; action?: 'analyze' | 'refine' | 'poster'; productInfo?: any }, modelName: string) {
    const { imageData, prompt, action = 'analyze', productInfo: providedProductInfo } = args;
    
    // Use free-tier friendly configuration
    const model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 4096, // Reduced for free tier
      }
    });

    // Extract base64 data and mime type from data URL
    let base64Data = imageData;
    let mimeType = 'image/jpeg';
    
    if (imageData.startsWith('data:')) {
      const [header, data] = imageData.split(',');
      base64Data = data;
      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    // Convert base64 to proper format for Gemini
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    let enhancedPrompt = '';
    
    switch (action) {
      case 'analyze':
        enhancedPrompt = `
          ${prompt || 'Analyze this artisan product image comprehensively'}
          
          Please analyze this artisan product image and provide detailed information about:
          
          1. **Product Details**: What type of artisan product is this? What materials, colors, and techniques are visible?
          2. **Cultural Context**: What cultural tradition or heritage does this represent?
          3. **Craftsmanship**: What level of skill and time investment is evident?
          4. **Market Value**: What makes this unique and valuable to collectors or customers?
          5. **Story Potential**: What cultural stories or traditions could be associated with this piece?
          
          Provide a comprehensive analysis that would help an artisan marketplace seller create compelling product listings.
        `;
        break;

      case 'refine':
        enhancedPrompt = `
          Analyze this artisan product image and provide detailed photography refinement suggestions:
          
          **IMAGE QUALITY ASSESSMENT:**
          1. **Lighting Analysis**: Evaluate current lighting - is it natural, artificial, harsh, soft? What improvements are needed?
          2. **Composition Review**: Assess framing, angles, background, and overall composition quality
          3. **Color Accuracy**: Are the colors true to life? Any color correction needed?
          4. **Clarity & Focus**: Is the image sharp? Any blur or focus issues?
          
          **REFINEMENT RECOMMENDATIONS:**
          1. **Lighting Improvements**: Specific suggestions for better lighting setup
          2. **Background Suggestions**: Ideal background colors/textures to enhance the product
          3. **Angle & Positioning**: Best angles to showcase the craftsmanship
          4. **Props & Styling**: Cultural or complementary props that would enhance the presentation
          5. **Technical Settings**: Camera/phone settings recommendations
          
          **SOCIAL MEDIA OPTIMIZATION:**
          - Square crop suggestions for Instagram
          - Vertical orientation tips for Stories
          - Close-up detail shots for showcasing craftsmanship
          
          Provide actionable, specific advice that an artisan can implement with basic photography equipment.
        `;
        break;

      case 'poster':
        enhancedPrompt = `
          Analyze this artisan product image and extract key information for creating a SALES POSTER:
          
          **PRODUCT ANALYSIS FOR SALES:**
          1. **Product Type**: What specific type of artisan product is this?
          2. **Materials**: What premium materials are visible?
          3. **Cultural Heritage**: What cultural tradition/origin does this represent?
          4. **Unique Selling Points**: What makes this product special and valuable?
          5. **Craftsmanship Quality**: What level of skill and artistry is evident?
          6. **Target Market**: Who would buy this product?
          
          **SALES-FOCUSED INFORMATION FORMAT:**
          Please format your response as JSON with these fields:
          {
            "productType": "specific product type for marketing",
            "materials": "premium materials highlighted for sales",
            "culture": "cultural origin/heritage for authenticity",
            "keyFeatures": ["unique selling point 1", "premium feature 2", "quality aspect 3"],
            "title": "catchy product name for sales (5-8 words)",
            "description": "compelling sales description emphasizing quality and heritage (2-3 sentences)",
            "targetMarket": "ideal customer description",
            "priceRange": "estimated price range based on materials and craftsmanship (e.g., $150-$300)",
            "artist": "artist name if visible/determinable, otherwise 'Artisan Creator'",
            "posterPrompt": "detailed prompt for generating a professional Instagram sales poster with pricing, artist name, and 'DM to Buy' call-to-action"
          }
          
          Focus on extracting information that emphasizes VALUE, QUALITY, and CULTURAL AUTHENTICITY for sales purposes.
        `;
        break;
    }

    const result = await model.generateContent([enhancedPrompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // For poster action, also generate the actual visual poster
    if (action === 'poster') {
      try {
        // Use provided product info if available, otherwise parse from AI response
        let productInfo: any = providedProductInfo || {};
        
        // If no product info was provided, try to parse from AI response
        if (!providedProductInfo || Object.keys(providedProductInfo).length === 0) {
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              productInfo = JSON.parse(jsonMatch[0]);
            }
          } catch (parseError) {
            // If JSON parsing fails, extract information manually
            productInfo = {
              title: this.extractFromText(text, 'title', 'Beautiful Artisan Craft'),
              description: this.extractFromText(text, 'description', 'Handcrafted with cultural heritage'),
              materials: this.extractFromText(text, 'materials', 'traditional materials'),
              culture: this.extractFromText(text, 'culture', 'cultural tradition'),
              priceRange: this.extractFromText(text, 'priceRange', '$100-$200'),
              artist: this.extractFromText(text, 'artist', 'Artisan Creator')
            };
          }
        } else {
          // Transform the provided product details to match expected format
          productInfo = {
            title: productInfo.description || 'Handcrafted Artisan Product',
            description: productInfo.description || 'Beautiful handcrafted item',
            materials: productInfo.materials || 'Mixed media',
            culture: productInfo.culturalOrigin || 'Traditional craft',
            price: productInfo.price ? `${getCurrencySymbol(productInfo.currency || 'INR')}${productInfo.price}` : null,
            currency: productInfo.currency || 'INR',
            artist: productInfo.artistName || 'Artisan Creator',
            category: productInfo.category || 'Handcrafted',
            dimensions: productInfo.dimensions || ''
          };
        }

        // Generate the actual poster image
        const posterResult = await this.imageGenerator.execute({
          prompt: `Professional artisan product poster showcasing ${productInfo.title || 'handcrafted item'}`,
          productInfo: productInfo,
          style: 'elegant', // Use elegant style for sales posters
          dimensions: 'square'   // Instagram square format
        });

        return {
          success: true,
          result: {
            analysis: text,
            action: action,
            productInfo: productInfo,
            poster: posterResult.success ? posterResult.result : null,
            confidence: 'high',
            tool: `gemini-vision-${modelName}`,
            model: modelName,
            salesFocused: true
          },
          timestamp: new Date().toISOString()
        };
      } catch (posterError) {
        console.error('Poster generation failed:', posterError);
        // Return analysis without poster if generation fails
      }
    }

    return {
      success: true,
      result: {
        analysis: text,
        action: action,
        confidence: 'high',
        tool: `gemini-vision-${modelName}`,
        model: modelName
      },
      timestamp: new Date().toISOString()
    };
  }

  private extractFromText(text: string, field: string, defaultValue: string): string {
    const patterns = {
      title: /title["\s:]*([^"\n,}]+)/i,
      description: /description["\s:]*([^"\n,}]+)/i,
      materials: /materials?["\s:]*([^"\n,}]+)/i,
      culture: /culture["\s:]*([^"\n,}]+)/i,
      priceRange: /priceRange["\s:]*([^"\n,}]+)/i,
      artist: /artist["\s:]*([^"\n,}]+)/i
    };

    const pattern = patterns[field as keyof typeof patterns];
    if (pattern) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim().replace(/[",]/g, '');
      }
    }
    return defaultValue;
  }

  async extractProductInfo(imageData: string) {
    return this.execute({
      imageData,
      prompt: 'Extract comprehensive product information from this artisan craft image',
      action: 'analyze'
    });
  }

  async getImageRefinementSuggestions(imageData: string) {
    return this.execute({
      imageData,
      action: 'refine'
    });
  }

  async generateSocialMediaPoster(imageData: string, productDetails?: any) {
    return this.execute({
      imageData,
      action: 'poster',
      productInfo: productDetails || {}
    });
  }
}
