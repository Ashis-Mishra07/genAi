import { GoogleGenerativeAI } from '@google/generative-ai';

export class PricingAnalyzer {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async analyzePricing(productData: any, category: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
        Analyze pricing for this artisan product and provide fair trade pricing suggestions:
        
        Product Details: ${JSON.stringify(productData)}
        Category: ${category}
        
        Consider:
        - Handmade/artisan value premium
        - Material costs
        - Time investment
        - Skill level required
        - Cultural significance
        - Market demand
        - Fair compensation for artisan
        - International shipping considerations
        
        Provide pricing analysis in this JSON format:
        {
          "suggestedPrice": {
            "min": number,
            "max": number,
            "recommended": number,
            "currency": "USD"
          },
          "priceBreakdown": {
            "materials": number,
            "labor": number,
            "artisanMargin": number,
            "platformFee": number
          },
          "marketPosition": "budget|mid-range|premium|luxury",
          "reasoning": "explanation of pricing strategy",
          "competitiveAnalysis": "comparison with similar products",
          "recommendations": ["specific pricing tips"]
        }
        
        Only return the JSON, no additional text.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const pricingData = JSON.parse(text);
        return {
          success: true,
          pricing: pricingData,
          timestamp: new Date().toISOString()
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse pricing analysis',
          rawResponse: text,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Pricing analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async getMarketInsights(category: string, region: string = 'global') {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
        Provide market insights for ${category} artisan products in the ${region} market:
        
        Include:
        - Current market trends
        - Popular price ranges
        - Customer preferences
        - Seasonal demand patterns
        - Growth opportunities
        - Cultural appreciation factors
        
        Format as actionable insights for artisans.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        insights: text,
        category,
        region,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market insights error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}
