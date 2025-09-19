import { GoogleGenerativeAI } from '@google/generative-ai';

export class ImageAnalyzerTool {
  private genAI: GoogleGenerativeAI;
  private modelQueue = [
    'gemini-1.5-flash',  // Free tier friendly
    'gemini-1.0-pro-vision-latest',  // Fallback vision model
    'gemini-pro-vision'  // Last resort
  ];

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async execute(args: { imageData: string; prompt?: string; action?: 'analyze' | 'refine' | 'poster' }) {
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

  private async executeWithModel(args: { imageData: string; prompt?: string; action?: 'analyze' | 'refine' | 'poster' }, modelName: string) {
    const { imageData, prompt, action = 'analyze' } = args;
    
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
          Create social media poster content for this artisan product:
          
          **PRODUCT ANALYSIS:**
          Analyze the product and create compelling social media content including:
          
          **POSTER ELEMENTS:**
          1. **Catchy Headline**: 5-8 word attention-grabbing title
          2. **Product Description**: 2-3 sentence compelling description
          3. **Cultural Story**: Brief cultural significance or tradition (1-2 sentences)
          4. **Key Features**: 3-4 bullet points highlighting unique aspects
          5. **Call-to-Action**: Engaging CTA for social media
          
          **DESIGN SUGGESTIONS:**
          1. **Color Palette**: Suggested colors that complement the product
          2. **Typography Style**: Font style recommendations (elegant, traditional, modern)
          3. **Layout Ideas**: How to arrange text and image elements
          4. **Cultural Elements**: Traditional patterns, symbols, or motifs to include
          
          **PLATFORM VARIATIONS:**
          - **Instagram Post**: Square format content suggestions
          - **Instagram Story**: Vertical format adaptations
          - **Facebook Post**: Detailed description version
          
          **HASHTAG SUGGESTIONS:**
          Provide 10-15 relevant hashtags for maximum reach.
          
          Format the response as ready-to-use social media content.
        `;
        break;
    }

    const result = await model.generateContent([enhancedPrompt, imagePart]);
    const response = await result.response;
    const text = response.text();

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

  async generateSocialMediaPoster(imageData: string) {
    return this.execute({
      imageData,
      action: 'poster'
    });
  }
}
