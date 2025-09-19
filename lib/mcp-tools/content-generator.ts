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
      Create an engaging product description for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Additional Context: ${context ? JSON.stringify(context, null, 2) : 'None'}
      
      Requirements:
      - Write in an engaging, storytelling style
      - Highlight the craftsmanship and quality
      - Mention cultural significance and heritage
      - Include material and technique details
      - Emphasize the handmade, authentic nature
      - Keep between 150-250 words
      - Make it appealing to international buyers who value authenticity
      - Include emotional connection points
      - Mention the artisan's skill and tradition
      
      Format the response as a clean, marketing-ready product description that would work on an e-commerce platform.
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
      Create persuasive marketing copy for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Marketing Context: ${context ? JSON.stringify(context, null, 2) : 'General e-commerce marketing'}
      
      Create:
      1. Attention-grabbing headline (10-15 words)
      2. Compelling subheadline (15-25 words)
      3. Key selling points (5-7 bullet points)
      4. Emotional appeal paragraph (50-75 words)
      5. Strong call-to-action (5-10 words)
      6. Urgency/scarcity statement (if applicable)
      
      Focus on:
      - Unique handmade quality
      - Cultural authenticity
      - Supporting artisan communities
      - Limited availability
      - Investment in heritage
      - Gift-worthy appeal
      
      Format as structured marketing copy ready for use on websites, ads, or promotional materials.
    `;
  }

  private createSocialCaptionPrompt(input: any, context?: any): string {
    return `
      Create engaging social media captions for this artisan product:
      
      Product Information: ${JSON.stringify(input, null, 2)}
      Platform Context: ${context ? JSON.stringify(context, null, 2) : 'Multi-platform use'}
      
      Create captions for:
      1. Instagram (with hashtags)
      2. Facebook (community-focused)
      3. Twitter/X (concise version)
      
      Each caption should:
      - Tell a micro-story about the product
      - Highlight cultural heritage
      - Include relevant hashtags
      - Have engaging hooks
      - Encourage interaction
      - Support artisan communities theme
      
      Make them authentic, educational, and shareable.
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
