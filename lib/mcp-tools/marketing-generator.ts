import { GoogleGenerativeAI } from '@google/generative-ai';

export class MarketingGeneratorTool {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async execute(args: { productData: any; platform?: string; imageData?: string }) {
    try {
      const { productData, platform = 'multi-platform', imageData } = args;
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
      
      switch (platform.toLowerCase()) {
        case 'instagram':
          prompt = this.createInstagramPrompt(productData);
          break;
        case 'facebook':
          prompt = this.createFacebookPrompt(productData);
          break;
        case 'twitter':
        case 'x':
          prompt = this.createTwitterPrompt(productData);
          break;
        case 'poster':
          prompt = this.createPosterPrompt(productData);
          break;
        case 'email':
          prompt = this.createEmailPrompt(productData);
          break;
        case 'product-launch':
          prompt = this.createProductLaunchPrompt(productData);
          break;
        default:
          prompt = this.createMultiPlatformPrompt(productData);
      }

      let result;
      if (imageData) {
        const imagePart = {
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        };
        result = await model.generateContent([prompt, imagePart]);
      } else {
        result = await model.generateContent(prompt);
      }
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

  private createInstagramPrompt(productData: any): string {
    return `
      Create comprehensive Instagram marketing content for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Generate:
      1. MAIN POST CAPTION (200-300 characters)
         - Hook opening line
         - Product story in 2-3 sentences
         - Cultural heritage mention
         - Call-to-action
      
      2. HASHTAG STRATEGY (20-30 hashtags)
         - Mix of popular and niche tags
         - Cultural and artisan-specific tags
         - Location-based tags
         - Trending craft tags
      
      3. INSTAGRAM STORIES CONTENT (5 slides)
         - Slide 1: Product reveal
         - Slide 2: Artisan story
         - Slide 3: Making process
         - Slide 4: Cultural significance
         - Slide 5: Call-to-action with link
      
      4. REEL SCRIPT IDEAS (3 concepts)
         - 15-30 second video concepts
         - Trending audio suggestions
         - Visual storytelling approach
      
      5. CAROUSEL POST CONCEPT
         - 5-10 slide educational carousel
         - Each slide focus and text
      
      Style: Authentic, visually-driven, community-building, educational
      Tone: Warm, respectful, inspiring, culturally aware
    `;
  }

  private createFacebookPrompt(productData: any): string {
    return `
      Create Facebook marketing content for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Generate:
      1. MAIN POST (300-500 words)
         - Compelling story opening
         - Detailed product description
         - Artisan background and heritage
         - Cultural significance
         - Community impact
         - Clear call-to-action
      
      2. COMMUNITY ENGAGEMENT POSTS (3 variations)
         - Question to spark discussion
         - Behind-the-scenes content
         - Educational content about the craft
      
      3. EVENT ANNOUNCEMENT (if applicable)
         - Virtual or physical showcase
         - Live crafting demonstration
         - Q&A with artisan
      
      4. SHARE-WORTHY CONTENT
         - Inspirational quotes about craftsmanship
         - Cultural facts and traditions
         - Sustainability and fair trade messaging
      
      5. FACEBOOK SHOP DESCRIPTION
         - SEO-optimized product description
         - Key benefits and features
         - Cultural story integration
      
      Style: Community-focused, educational, story-driven, shareable
      Focus: Building relationships, cultural appreciation, supporting artisans
    `;
  }

  private createTwitterPrompt(productData: any): string {
    return `
      Create Twitter/X marketing content for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Generate:
      1. MAIN TWEET (280 characters max)
         - Attention-grabbing opening
         - Product highlight
         - Heritage mention
         - Relevant hashtags
         - Link space consideration
      
      2. TWITTER THREAD (5-7 tweets)
         - Tweet 1: Hook and introduction
         - Tweet 2: Artisan story
         - Tweet 3: Craft technique
         - Tweet 4: Cultural significance
         - Tweet 5: Why it matters
         - Tweet 6: Call-to-action
         - Tweet 7: Thank you and support message
      
      3. QUOTE TWEETS & RETWEETS
         - Inspirational craftsmanship quotes
         - Cultural heritage facts
         - Sustainability messages
      
      4. ENGAGEMENT TWEETS
         - Questions for followers
         - Polls about preferences
         - Behind-the-scenes glimpses
      
      Style: Concise, impactful, conversation-starting
      Focus: Quick education, cultural appreciation, community building
    `;
  }

  private createPosterPrompt(productData: any): string {
    return `
      Create comprehensive poster design content for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Design Specifications:
      1. MAIN HEADLINE (5-8 words)
         - Powerful, attention-grabbing
         - Cultural hook if applicable
      
      2. SUBHEADLINE (10-15 words)
         - Product description
         - Heritage mention
      
      3. KEY FEATURES (3-5 bullet points)
         - Handmade quality
         - Cultural significance
         - Unique characteristics
      
      4. VISUAL LAYOUT SUGGESTIONS
         - Header placement and size
         - Image positioning
         - Text hierarchy
         - Color scheme based on cultural elements
         - Typography recommendations (traditional/modern blend)
      
      5. CULTURAL DESIGN ELEMENTS
         - Patterns or motifs to include
         - Color palette inspiration
         - Cultural symbols (respectful use)
      
      6. CALL-TO-ACTION
         - Clear, compelling action phrase
         - Contact/purchase information placement
      
      7. SUPPORTING TEXT
         - Brief cultural story (20-30 words)
         - Quality assurance message
         - Authenticity guarantee
      
      Purpose: Drive sales while honoring cultural heritage and craftsmanship
      Style: Professional, culturally respectful, visually appealing
    `;
  }

  private createEmailPrompt(productData: any): string {
    return `
      Create email marketing campaign for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Generate:
      1. SUBJECT LINES (5 variations)
         - Curiosity-driven
         - Cultural angle
         - Exclusivity focus
         - Heritage emphasis
         - Urgency/scarcity
      
      2. EMAIL CONTENT
         - Compelling opening
         - Product story and description
         - Artisan background
         - Cultural significance
         - High-quality imagery descriptions
         - Social proof elements
         - Clear call-to-action
         - Urgency/scarcity messaging
      
      3. FOLLOW-UP SEQUENCE (3 emails)
         - Email 1: Introduction and story
         - Email 2: Behind-the-scenes and process
         - Email 3: Final call with special offer
      
      Style: Personal, storytelling, authentic, respectful
      Goal: Build connection and drive conversions
    `;
  }

  private createProductLaunchPrompt(productData: any): string {
    return `
      Create product launch campaign for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Launch Strategy:
      1. PRE-LAUNCH TEASERS (1 week before)
         - Sneak peek content
         - Coming soon posts
         - Artisan introduction
         - Behind-the-scenes content
      
      2. LAUNCH DAY CONTENT
         - Grand reveal post
         - Live unveiling script
         - Story highlights
         - Press release template
      
      3. POST-LAUNCH FOLLOW-UP
         - Thank you messages
         - Customer testimonials
         - Additional product angles
         - Cross-selling opportunities
      
      4. INFLUENCER OUTREACH
         - Collaboration pitch template
         - Key talking points
         - Cultural education elements
      
      5. PR ANGLE
         - Newsworthy story elements
         - Cultural significance
         - Artisan empowerment angle
         - Heritage preservation message
      
      Goal: Create buzz, drive sales, build brand awareness
      Focus: Cultural appreciation, artisan support, quality craftsmanship
    `;
  }

  private createMultiPlatformPrompt(productData: any): string {
    return `
      Create multi-platform marketing content for this artisan product:
      
      Product: ${JSON.stringify(productData, null, 2)}
      
      Generate content optimized for:
      1. Instagram (visual, hashtag-heavy)
      2. Facebook (community-focused, longer form)
      3. Twitter (concise, conversational)
      4. Email (personal, detailed)
      5. Website (SEO-optimized, comprehensive)
      
      Each platform should maintain consistent messaging while being optimized for platform-specific best practices.
      
      Include cultural sensitivity guidelines and brand voice consistency across all platforms.
    `;
  }
}
