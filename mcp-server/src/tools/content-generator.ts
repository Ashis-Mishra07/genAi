import { GoogleGenerativeAI } from '@google/generative-ai';

export class ContentGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateContent(type: string, input: any, context?: any) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
      
      Product Info: ${JSON.stringify(input)}
      Additional Context: ${context ? JSON.stringify(context) : 'None'}
      
      Requirements:
      - Write as a brand narrative that tells the product's journey
      - Focus on the artisan's passion, dedication, and creative process
      - Describe the photoshoot-worthy qualities and visual appeal
      - Highlight how each piece tells a unique story
      - Include sensory details (texture, visual beauty, craftsmanship feel)
      - Mention the photogenic qualities and styling potential
      - Connect the product to lifestyle and personal expression
      - Keep it between 120-250 words
      - Write for photography and social media enthusiasts
      
      Format as a brand story that would inspire a photoshoot concept.
    `;
  }

  private createCulturalStoryPrompt(input: any, context?: any): string {
    return `
      Create a cinematic brand story about this artisan product's cultural journey:
      
      Product Info: ${JSON.stringify(input)}
      Cultural Context: ${context ? JSON.stringify(context) : 'Research based on product details'}
      
      Requirements:
      - Craft a visual narrative suitable for editorial photoshoots
      - Tell the artisan's personal brand story and creative journey  
      - Describe scenes that would make beautiful photography moments
      - Include the workspace, tools, and creative process as visual elements
      - Connect tradition with contemporary lifestyle and aesthetics
      - Make it feel like behind-the-scenes documentary content
      - Focus on authentic moments and genuine creative passion
      - 180-300 words
      - Write for content creators and photography enthusiasts
      - Include details that inspire photoshoot concepts and styling ideas
      
      Write a brand story that reads like a creative brief for a lifestyle photoshoot.
    `;
  }

  private createMarketingCopyPrompt(input: any, context?: any): string {
    return `
      Create photoshoot-inspired brand content for this artisan product:
      
      Product Info: ${JSON.stringify(input)}
      Platform/Context: ${context ? JSON.stringify(context) : 'Photography-focused content'}
      
      Requirements:
      - Write copy that complements stunning product photography
      - Create captions that tell the brand story behind each shot
      - Include styling and photography direction hints
      - Focus on visual storytelling and aesthetic appeal
      - Highlight photogenic qualities and styling versatility
      - Create content suitable for editorial and lifestyle photography
      - Add photography hashtags and visual content tags
      - Include behind-the-scenes story elements
      - Write for photographers, stylists, and visual content creators
      
      Format as photography-centric brand content ready for visual storytelling.
    `;
  }
}
