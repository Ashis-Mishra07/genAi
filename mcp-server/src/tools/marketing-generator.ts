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
      Create photoshoot-inspired social media content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate:
      1. Instagram caption (brand story + photography hashtags)
      2. Facebook post (behind-the-scenes brand narrative)
      3. Twitter/X post (visual storytelling focus)
      4. LinkedIn post (artisan brand journey and creative process)
      
      Requirements:
      - Write captions that complement beautiful product photography
      - Include brand storytelling that feels authentic and personal
      - Add photography and visual content hashtags
      - Create content that inspires photoshoot concepts
      - Focus on the creative process and artisan's brand journey
      - Include styling and aesthetic appreciation elements
      - Mention photoshoot-worthy qualities and visual appeal
      - Write for photography enthusiasts and visual content creators
      
      Format each platform's content clearly labeled with photography-focused approach.
    `;
  }

  private createInstagramPrompt(productData: any): string {
    return `
      Create Instagram photoshoot content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate:
      1. Main caption (brand story behind the photoshoot + creative process)
      2. Hashtag strategy (photography, lifestyle, artisan brand, styling tags)
      3. Stories content ideas (5-7 slides: behind-the-scenes, styling process, brand story moments)
      4. Reel script ideas (photoshoot process, brand story highlights, styling transformations)
      
      Style: Editorial photoshoot aesthetic, brand storytelling, visual-first narrative
      Focus: Creative process, photoshoot concepts, brand journey, styling inspiration
      Approach: Content that inspires other creators and photographers
    `;
  }

  private createFacebookPrompt(productData: any): string {
    return `
      Create Facebook brand story content for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate:
      1. Detailed brand story post with photoshoot behind-the-scenes
      2. Photoshoot process documentation (if applicable)
      3. Community engagement about creative process and styling
      4. Share-worthy brand journey and creative moments
      
      Style: Documentary-style brand storytelling, photoshoot insights, creative community-focused
      Focus: Artisan brand journey, creative process, photoshoot concepts, visual storytelling
    `;
  }

  private createPosterPrompt(productData: any): string {
    return `
      Create photoshoot concept brief for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Generate photoshoot design brief including:
      1. Main visual concept (photography style and mood)
      2. Brand story narrative (storytelling elements)
      3. Styling direction (props, backgrounds, lighting)
      4. Shot composition ideas (angles, framing, focus)
      5. Color palette inspiration (mood and aesthetic)
      6. Layout concept for final imagery
      7. Typography pairing suggestions for brand consistency
      
      Style: Editorial photoshoot aesthetic, artistic brand storytelling, lifestyle photography
      Purpose: Brand storytelling through visual narrative and professional photography
    `;
  }

  private createGeneralMarketingPrompt(productData: any, platform: string): string {
    return `
      Create photoshoot-inspired brand content for ${platform} for this artisan product:
      
      Product: ${JSON.stringify(productData)}
      
      Adapt the content style and format appropriate for ${platform} with photography focus.
      Focus on brand storytelling through visual narrative and creative process.
      Include behind-the-scenes creative journey and photoshoot concepts.
      Emphasize styling opportunities and aesthetic appeal for content creators.
    `;
  }

  async generatePosterDesign(productData: any, imageData?: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Create a detailed photoshoot concept and styling brief for this artisan product:
        
        Product: ${JSON.stringify(productData)}
        ${imageData ? 'Product Image: [Image provided for styling reference]' : ''}
        
        Photoshoot Concept Elements:
        1. Photography style direction (studio, lifestyle, editorial, commercial, artistic)
        2. Brand story narrative to capture through imagery
        3. Styling and prop suggestions (backgrounds, textures, complementary objects)
        4. Lighting mood and setup recommendations
        5. Composition and framing ideas (close-ups, lifestyle shots, detail shots)
        6. Color palette and aesthetic mood for brand consistency
        7. Behind-the-scenes content opportunities
        
        Output as detailed photoshoot brief that photographers and stylists can follow.
      `;

      const inputs: any[] = [prompt];
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
