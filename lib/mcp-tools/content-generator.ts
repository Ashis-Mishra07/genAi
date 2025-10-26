import { GoogleGenerativeAI } from '@google/generative-ai';

export class ContentGeneratorTool {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async execute(args: { type: string; input: any; context?: any }) {
    try {
      const { type, input, context } = args;
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });

      let prompt = '';
      
      switch (type) {
        case 'product_description':
          prompt = this.createProductDescriptionPrompt(input, context);
          break;
        case 'cultural_story':
          prompt = this.createCulturalStoryPrompt(input, context);
          break;
        case 'marketing_copy':
          prompt = this.createMarketingCopyPrompt(input, context);
          break;
        case 'social_caption':
          prompt = this.createSocialCaptionPrompt(input, context);
          break;
        case 'poster_content':
          prompt = this.createPosterContentPrompt(input, context);
          break;
        default:
          throw new Error(`Unsupported content type: ${type}`);
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text,
        type,
        input,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Content generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private createProductDescriptionPrompt(input: any, context?: any): string {
    return `
      Create a compelling brand story-driven product description for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Additional Context: ${context ? JSON.stringify(context, null, 2) : 'None'}
      
      Requirements:
      FOR REALISTIC PHOTOSHOOT CONTEXT:
      - Create content that envisions this product being worn/used by real models
      - Describe specific photoshoot scenarios (e.g., "model wearing this hoodie in urban setting")
      - Focus on how the product would look in professional photography
      - Include model styling suggestions and pose concepts
      - Describe lighting and setting that would complement the product
      - Write for brands planning actual photoshoots with models
      - Mention specific photoshoot styles (lifestyle, studio, editorial, commercial)
      - Include realistic model scenarios and styling contexts
      - Connect to authentic fashion/lifestyle photography
      - Keep between 180-280 words
      - Format as professional photoshoot brief and creative direction
      
      Write as if directing a professional photographer and stylist for a real photoshoot with models.
    `;
  }

  private createCulturalStoryPrompt(input: any, context?: any): string {
    return `
      Create a compelling cultural story for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Cultural Context: ${context ? JSON.stringify(context, null, 2) : 'Infer from product details'}
      
      Requirements:
      - Tell the story of the craft tradition and its origins
      - Mention the artisan's heritage and family traditions
      - Explain the cultural and historical significance
      - Include details about traditional techniques passed down through generations
      - Make it authentic, respectful, and educational
      - Connect the buyer emotionally to the product's heritage
      - 200-300 words
      - Appeal to buyers who value cultural preservation and authenticity
      - Include specific cultural details when possible
      
      Write a narrative that helps buyers understand they're not just purchasing a product, but supporting a living tradition and cultural heritage.
    `;
  }

  private createMarketingCopyPrompt(input: any, context?: any): string {
    return `
      Create photoshoot-inspired brand content for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Photography Context: ${context ? JSON.stringify(context, null, 2) : 'Professional photoshoot campaign'}
      
      Create photoshoot-focused brand content:
      1. Photoshoot headline (describing the visual story, 10-15 words)
      2. Model/styling subheadline (describing how it looks on models, 15-25 words)  
      3. Visual selling points (5-7 bullet points about photoshoot appeal)
      4. Photoshoot concept paragraph (describing the visual story, 50-75 words)
      5. Creative call-to-action (photoshoot/visual focused, 5-10 words)
      6. Styling statement (how models/stylists would use this piece)
      
      Focus on:
      - How the product photographs on models
      - Professional photoshoot quality
      - Visual storytelling potential
      - Model styling opportunities
      - Photography and creative appeal
      - Instagram-worthy aesthetic
      
      Format as creative brief for professional photoshoot campaign with models.
    `;
  }

  private createSocialCaptionPrompt(input: any, context?: any): string {
    return `
      Create photoshoot-style social media captions for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Photoshoot Context: ${context ? JSON.stringify(context, null, 2) : 'Model photoshoot campaign'}
      
      Create model/photoshoot captions for:
      1. Instagram (with model/fashion hashtags)
      2. Facebook (behind-the-scenes photoshoot story)  
      3. Twitter/X (photoshoot moment version)
      
      Each caption should:
      - Reference the photoshoot/model context
      - Describe how the product looks in photos
      - Include photoshoot behind-the-scenes elements
      - Use fashion/photography hashtags
      - Appeal to visual content creators
      - Focus on styling and aesthetic appeal
      
      Write as if posting from a professional photoshoot with models wearing/using the product.
    `;
  }

  private createPosterContentPrompt(input: any, context?: any): string {
    return `
      Create content for a promotional poster for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Design Context: ${context ? JSON.stringify(context, null, 2) : 'General promotional poster'}
      
      Create:
      1. Main headline (5-8 words, impactful)
      2. Subheadline (10-15 words, descriptive)
      3. Key features (3-5 short bullet points)
      4. Cultural highlight (1-2 sentences)
      5. Call-to-action (3-5 words)
      6. Supporting text (20-30 words)
      7. Color scheme suggestions based on product
      8. Typography recommendations (elegant/traditional/modern)
      
      Style: Professional, culturally respectful, visually appealing
      Purpose: Drive sales while honoring craftsmanship and heritage
    `;
  }
}
