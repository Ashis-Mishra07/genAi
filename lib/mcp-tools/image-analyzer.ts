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
    'gemini-1.5-flash',  // Free tier friendly
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
          ${prompt || 'Analyze this artisan product image from a photography and brand storytelling perspective'}
          
          Please analyze this artisan product image and provide detailed information about:
          
          1. **Product Details**: What type of artisan product is this? What materials, colors, and techniques are visible?
          2. **Photography Quality**: Assess the current lighting, composition, styling, and photoshoot potential
          3. **Brand Story Elements**: What authentic narrative and creative journey does this piece represent?
          4. **Visual Appeal**: How photogenic is this product? What makes it compelling for visual content?
          5. **Styling Opportunities**: What photoshoot concepts and styling approaches would enhance this product?
          6. **Cultural Heritage**: What cultural tradition does this represent for authentic brand storytelling?
          7. **Creative Process**: What artisan techniques and creative passion are evident in the craftsmanship?
          
          Provide a comprehensive analysis that would help create compelling brand stories and photoshoot concepts.
        `;
        break;

      case 'refine':
        enhancedPrompt = `
          Analyze this artisan product image and provide professional photoshoot refinement suggestions:
          
          **PHOTOSHOOT QUALITY ASSESSMENT:**
          1. **Lighting Analysis**: Evaluate current lighting setup - assess mood, shadows, highlights, and overall aesthetic quality
          2. **Composition & Styling**: Review framing, angles, styling elements, and brand story visual narrative
          3. **Color Palette**: Assess color harmony, brand consistency, and visual appeal for content creation
          4. **Brand Story Elements**: How well does this image tell the artisan's creative journey and brand narrative?
          
          **PROFESSIONAL PHOTOSHOOT RECOMMENDATIONS:**
          1. **Photography Style Direction**: Suggest best photoshoot style (lifestyle, studio, editorial, commercial, artistic)
          2. **Lighting & Mood Setup**: Professional lighting recommendations for brand storytelling
          3. **Styling & Props**: Creative styling suggestions that enhance the brand narrative
          4. **Background & Setting**: Ideal environments that complement the artisan's story
          5. **Composition Concepts**: Multiple shot ideas for a complete photoshoot series
          
          **CONTENT CREATION OPTIMIZATION:**
          - Instagram photoshoot series suggestions
          - Behind-the-scenes content opportunities
          - Brand story visual narrative ideas
          - Creative styling and photography direction
          
          Provide professional photoshoot direction that elevates the artisan's brand story and visual content.
        `;
        break;

      case 'poster':
        enhancedPrompt = `
          Analyze this artisan product image and extract key information for creating a BRAND STORYTELLING PHOTOSHOOT:
          
          **PRODUCT ANALYSIS FOR PHOTOSHOOT CONCEPTS:**
          1. **Product Type**: What specific type of artisan product is this?
          2. **Visual Appeal**: What makes this product photogenic and compelling for photography?
          3. **Brand Story Elements**: What authentic narrative and creative journey does this represent?
          4. **Styling Potential**: What photography styles and concepts would best showcase this product?
          5. **Artisan Heritage**: What cultural tradition and creative process are evident?
          6. **Target Audience**: Who would connect with this brand story and aesthetic?
          
          **PHOTOSHOOT-FOCUSED INFORMATION FORMAT:**
          Please format your response as JSON with these fields:
          {
            "productType": "specific product type for photography",
            "materials": "beautiful materials to highlight in photoshoot",
            "culture": "cultural heritage for authentic brand storytelling",
            "brandStoryElements": ["authentic narrative 1", "creative process 2", "heritage aspect 3"],
            "title": "evocative brand story title (5-8 words)",
            "description": "compelling brand narrative emphasizing creativity and authentic craftsmanship (2-3 sentences)",
            "targetAudience": "creative community and photography enthusiasts who appreciate authentic artisan stories",
            "photographyStyle": "recommended photoshoot style (lifestyle, studio, editorial, commercial, artistic)",
            "artist": "artisan name if visible/determinable, otherwise 'Creative Artisan'",
            "photoshootPrompt": "detailed prompt for generating professional brand storytelling photoshoot imagery with focus on authentic artisan narrative and creative process"
          }
          
          Focus on extracting information that emphasizes CREATIVITY, AUTHENTICITY, and BRAND STORYTELLING for photoshoot concepts.
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

        // Generate the actual photoshoot concept image
        const photoshootStyle = productInfo.photographyStyle || 'lifestyle';
        const posterResult = await this.imageGenerator.execute({
          prompt: `Professional artisan product photoshoot showcasing ${productInfo.title || 'handcrafted item'}`,
          productInfo: productInfo,
          style: photoshootStyle as 'lifestyle' | 'studio' | 'editorial' | 'commercial' | 'artistic', // Use recommended photoshoot style
          dimensions: 'square'   // Instagram square format
        });

        return {
          success: true,
          result: {
            analysis: text,
            action: action,
            productInfo: productInfo,
            photoshoot: posterResult.success ? posterResult.result : null,
            confidence: 'high',
            tool: `gemini-vision-${modelName}`,
            model: modelName,
            brandStoryFocused: true
          },
          timestamp: new Date().toISOString()
        };
      } catch (photoshootError) {
        console.error('Photoshoot concept generation failed:', photoshootError);
        // Return analysis without photoshoot concept if generation fails
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
      prompt: 'Extract comprehensive product information from this artisan craft image for brand storytelling',
      action: 'analyze'
    });
  }

  async getPhotoshootRefinementSuggestions(imageData: string) {
    return this.execute({
      imageData,
      action: 'refine'
    });
  }

  async generatePhotoshootConcept(imageData: string, productDetails?: any) {
    return this.execute({
      imageData,
      action: 'poster',
      productInfo: productDetails || {}
    });
  }
}
