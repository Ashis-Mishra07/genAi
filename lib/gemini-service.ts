import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ConversationContext {
  role: 'user' | 'assistant';
  content: string;
}

export class GeminiService {
  private models = [
    'gemini-2.5-flash',  // Free tier friendly
    'gemini-1.0-pro-latest',  // Fallback text model
    'gemini-pro'  // Last resort
  ];

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async tryWithFallback<T>(operation: (model: any) => Promise<T>): Promise<T> {
    let lastError: any = null;
    
    for (const modelName of this.models) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topK: 32,
            topP: 0.9,
            maxOutputTokens: 4096,
          }
        });
        
        return await operation(model);
      } catch (error: any) {
        console.log(`Model ${modelName} failed:`, error.message);
        lastError = error;
        
        if (error.message?.includes('RATE_LIMIT_EXCEEDED') || error.message?.includes('429')) {
          console.log('Rate limit hit, trying next model...');
          await this.delay(1000);
          continue;
        }
        continue;
      }
    }
    
    throw lastError || new Error('All models failed');
  }

  async generateResponse(
    message: string, 
    context: ConversationContext[] = [],
    systemPrompt?: string
  ): Promise<GeminiResponse> {
    try {
      const defaultSystemPrompt = `You are an AI-powered marketplace assistant for local artisans. You help with:
      
      - Cultural storytelling and product narratives
      - Pricing suggestions and market analysis  
      - Marketing content creation
      - Voice processing and multilingual support
      - Image analysis for product listings
      
      You should be helpful, culturally sensitive, and knowledgeable about traditional crafts and artisan products. 
      When users ask for specific AI tools (pricing, marketing, image analysis, voice processing), suggest using the specialized tools available.
      
      Keep responses conversational and helpful. If you need to use a specialized tool, explain what it can do.`;

      const prompt = systemPrompt || defaultSystemPrompt;
      
      // Build conversation history
      let conversationText = `${prompt}\n\n`;
      
      // Add conversation context
      context.forEach(ctx => {
        conversationText += `${ctx.role === 'user' ? 'User' : 'Assistant'}: ${ctx.content}\n`;
      });
      
      conversationText += `User: ${message}\nAssistant:`;

      const text = await this.tryWithFallback(async (model) => {
        const result = await model.generateContent(conversationText);
        const response = await result.response;
        return response.text();
      });

      return {
        success: true,
        content: text
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        success: false,
        error: `AI is currently experiencing high demand. Please try again in a few minutes. (${error instanceof Error ? error.message : 'Unknown error'})`
      };
    }
  }

  async analyzeIntent(message: string): Promise<{
    intent: 'conversation' | 'content_generation' | 'pricing' | 'marketing' | 'image_analysis' | 'voice_processing';
    confidence: number;
    suggestion?: string;
  }> {
    try {
      const prompt = `Analyze this user message and determine the intent. Return ONLY a JSON response:

      Message: "${message}"

      Possible intents:
      - conversation: General chat or questions
      - content_generation: Wants cultural stories or product descriptions
      - pricing: Asking about pricing, costs, or market value
      - marketing: Wants marketing content, ads, or promotion help
      - image_analysis: Mentions images, photos, or visual analysis
      - voice_processing: Mentions audio, voice, or speech

      Return format:
      {
        "intent": "intent_name",
        "confidence": 0.8,
        "suggestion": "optional suggestion text"
      }`;

      const text = await this.tryWithFallback(async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
      
      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        intent: 'conversation',
        confidence: 0.5
      };
    } catch (error) {
      console.error('Intent analysis error:', error);
      return {
        intent: 'conversation',
        confidence: 0.5
      };
    }
  }

  async generateProductStory(productName: string, description: string, category: string): Promise<GeminiResponse> {
    const prompt = `Create a compelling cultural story for this artisan product:

    Product: ${productName}
    Description: ${description}
    Category: ${category}

    Generate an authentic cultural narrative that:
    - Highlights traditional craftsmanship techniques
    - Connects to cultural heritage and history
    - Appeals to customers who value authenticity
    - Is 2-3 paragraphs long
    - Feels personal and meaningful

    Write in a warm, storytelling tone that honors the artisan's skill and cultural traditions.`;

    return this.generateResponse('', [], prompt);
  }

  async generateMarketingContent(product: string, targetAudience: string = 'art lovers'): Promise<GeminiResponse> {
    const prompt = `Create marketing content for this artisan product:

    Product: ${product}
    Target Audience: ${targetAudience}

    Generate compelling marketing copy that includes:
    - Catchy headline
    - Key selling points
    - Emotional appeal
    - Call to action
    - Social media hashtags

    Focus on authenticity, craftsmanship, and cultural value.`;

    return this.generateResponse('', [], prompt);
  }
}

export const geminiService = new GeminiService();
