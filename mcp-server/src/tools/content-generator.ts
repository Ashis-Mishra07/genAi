import { GoogleGenerativeAI } from '@google/generative-ai';

export class ContentGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generateContent(type: string, input: any, context?: any) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
      Create an engaging product description for this artisan product:
      
      Product Info: ${JSON.stringify(input)}
      Additional Context: ${context ? JSON.stringify(context) : 'None'}
      
      Requirements:
      - Write in an engaging, storytelling style
      - Highlight the craftsmanship and quality
      - Mention cultural significance if applicable
      - Include material and technique details
      - Keep it between 100-200 words
      - Make it appealing to international buyers
      
      Format the response as a clean, marketing-ready description.
    `;
  }

  private createCulturalStoryPrompt(input: any, context?: any): string {
    return `
      Create a compelling cultural story for this artisan product:
      
      Product Info: ${JSON.stringify(input)}
      Cultural Context: ${context ? JSON.stringify(context) : 'Research based on product details'}
      
      Requirements:
      - Tell the story of the craft tradition
      - Mention the artisan's heritage and skills
      - Explain the cultural significance
      - Include historical context if relevant
      - Make it authentic and respectful
      - 150-250 words
      - Appeal to buyers who value authenticity
      
      Write a story that connects the buyer emotionally to the product and its heritage.
    `;
  }

  private createMarketingCopyPrompt(input: any, context?: any): string {
    return `
      Create marketing copy for this artisan product:
      
      Product Info: ${JSON.stringify(input)}
      Platform/Context: ${context ? JSON.stringify(context) : 'General marketing'}
      
      Requirements:
      - Create attention-grabbing headlines
      - Include persuasive bullet points
      - Add a compelling call-to-action
      - Highlight unique selling points
      - Emphasize handmade quality
      - Include urgency or scarcity if appropriate
      
      Format as ready-to-use marketing material.
    `;
  }
}
