import { GoogleGenerativeAI } from '@google/generative-ai';

export class MarketingGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateMarketing(productData: any, platform: string = 'social') {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      let prompt = '';
      
      switch (platform.toLowerCase()) {
        case 'social':
          prompt = this.createSocialMediaPrompt(productData);
          break;
        case 'instagram':
          prompt = this.createInstagramPrompt(productData);
          break;
        case 'facebook':
          prompt = this.createFacebookPrompt(productData);
          break;
        case 'poster':
          prompt = this.createPosterPrompt(productData);
          break;
        default:
          prompt = this.createGeneralMarketingPrompt(productData, platform);
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        marketing: text,
        platform,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Marketing generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private createSocialMediaPrompt(productData: any): string {
    return `
      Create engaging social media content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate:
      1. Instagram caption (with relevant hashtags)
      2. Facebook post
      3. Twitter/X post
      4. LinkedIn post (professional angle)
      
      Requirements:
      - Highlight craftsmanship and cultural value
      - Include storytelling elements
      - Add appropriate hashtags for each platform
      - Create engaging hooks
      - Include call-to-action
      - Mention artisan heritage
      
      Format each platform's content clearly labeled.
    `;
  }

  private createInstagramPrompt(productData: any): string {
    return `
      Create Instagram content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate:
      1. Main caption (engaging story + product details)
      2. Hashtag strategy (mix of niche and popular tags)
      3. Stories content ideas (3-5 slides)
      4. Reel script ideas
      
      Style: Authentic, visual-first, community-building
      Focus: Heritage, craftsmanship, uniqueness
    `;
  }

  private createFacebookPrompt(productData: any): string {
    return `
      Create Facebook marketing content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate:
      1. Detailed post with story
      2. Event announcement (if applicable)
      3. Community engagement questions
      4. Share-worthy content angles
      
      Style: Community-focused, educational, shareable
      Focus: Supporting artisans, cultural preservation
    `;
  }

  private createPosterPrompt(productData: any): string {
    return `
      Create poster/banner content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate design brief including:
      1. Main headline (attention-grabbing)
      2. Subheadline (product details)
      3. Key selling points (bullet format)
      4. Call-to-action text
      5. Color scheme suggestions
      6. Layout recommendations
      7. Typography suggestions
      
      Style: Professional, artistic, culturally respectful
      Purpose: Sales conversion and brand awareness
    `;
  }

  private createGeneralMarketingPrompt(productData: any, platform: string): string {
    return `
      Create marketing content for ${platform} for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Adapt the content style and format appropriate for ${platform}.
      Focus on the unique value proposition of handmade artisan goods.
      Include cultural storytelling and craftsmanship details.
    `;
  }

  async generatePosterDesign(productData: any, imageData?: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Create a detailed design brief for a product poster:
        
        Product: ${JSON.stringify(productData)}
        ${imageData ? 'Product Image: [Image provided]' : ''}
        
        Design Elements:
        1. Layout structure (header, body, footer)
        2. Typography hierarchy
        3. Color palette (inspired by product/culture)
        4. Visual elements placement
        5. Text content for each section
        6. Call-to-action placement
        7. Branding considerations
        
        Output as detailed design specifications that a graphic designer can follow.
      `;

      const inputs = [prompt];
      if (imageData) {
        inputs.push({
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        });
      }

      const result = await model.generateContent(inputs);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        designBrief: text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Poster design generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}
