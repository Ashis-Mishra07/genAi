// MCP Client utilities for frontend interaction with MCP tools

export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/mcp') {
    this.baseUrl = baseUrl;
  }

  async processVoice(audioData: string, language?: string) {
    const response = await fetch(`${this.baseUrl}/voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioData, language }),
    });

    if (!response.ok) {
      throw new Error(`Voice processing failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzeImage(imageData: string, prompt?: string) {
    const response = await fetch(`${this.baseUrl}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData, prompt }),
    });

    if (!response.ok) {
      throw new Error(`Image analysis failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async generateContent(type: string, input: any, context?: any) {
    const response = await fetch(`${this.baseUrl}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, input, context }),
    });

    if (!response.ok) {
      throw new Error(`Content generation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async analyzePricing(productData: any, category: string, userPrice?: number) {
    const response = await fetch(`${this.baseUrl}/pricing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productData, category, userPrice }),
    });

    if (!response.ok) {
      throw new Error(`Pricing analysis failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async generateMarketing(productData: any, platform?: string, imageData?: string) {
    const response = await fetch(`${this.baseUrl}/marketing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productData, platform, imageData }),
    });

    if (!response.ok) {
      throw new Error(`Marketing generation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async getMarketInsights(category: string, region?: string) {
    const params = new URLSearchParams({ category });
    if (region) params.append('region', region);

    const response = await fetch(`${this.baseUrl}/pricing?${params}`);

    if (!response.ok) {
      throw new Error(`Market insights failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Comprehensive product processing workflow
  async processProduct(imageData: string, voiceData?: string, userPrice?: number) {
    try {
      const results: any = {};

      // Step 1: Analyze image
      console.log('Analyzing product image...');
      const imageAnalysis = await this.analyzeImage(imageData, 'Extract comprehensive product information');
      results.imageAnalysis = imageAnalysis;

      if (!imageAnalysis.success) {
        throw new Error('Image analysis failed');
      }

      // Step 2: Process voice if provided
      if (voiceData) {
        console.log('Processing voice description...');
        const voiceProcessing = await this.processVoice(voiceData);
        results.voiceProcessing = voiceProcessing;
      }

      // Step 3: Generate content based on analysis
      const productInfo = imageAnalysis.analysis;
      
      console.log('Generating product description...');
      const productDescription = await this.generateContent('product_description', productInfo);
      results.productDescription = productDescription;

      console.log('Generating cultural story...');
      const culturalStory = await this.generateContent('cultural_story', productInfo);
      results.culturalStory = culturalStory;

      // Step 4: Analyze pricing
      const category = productInfo.productInfo?.category || 'handicraft';
      console.log('Analyzing pricing...');
      const pricingAnalysis = await this.analyzePricing(productInfo, category, userPrice);
      results.pricingAnalysis = pricingAnalysis;

      // Step 5: Generate marketing content
      console.log('Generating marketing content...');
      const marketingContent = await this.generateMarketing(productInfo, 'multi-platform', imageData);
      results.marketingContent = marketingContent;

      console.log('Product processing completed successfully!');
      return {
        success: true,
        results,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Product processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();
