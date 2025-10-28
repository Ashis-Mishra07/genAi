import { GoogleGenerativeAI } from '@google/generative-ai';

export class ImageAnalyzer {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async analyzeImage(imageData: string, prompt: string = 'Analyze this product image') {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Convert base64 to proper format for Gemini
      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        analysis: text,
        prompt,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async extractProductInfo(imageData: string) {
    const prompt = `
      Analyze this product image and extract the following information in JSON format:
      {
        "productName": "estimated product name",
        "category": "product category",
        "materials": ["list of materials"],
        "colors": ["dominant colors"],
        "style": "artistic style or technique",
        "culturalElements": ["cultural or traditional elements visible"],
        "condition": "condition of the product",
        "estimatedSize": "estimated size description"
      }
      Only return the JSON, no additional text.
    `;

    try {
      const result = await this.analyzeImage(imageData, prompt);
      if (result.success) {
        const productInfo = JSON.parse(result.analysis);
        return {
          success: true,
          productInfo,
          timestamp: new Date().toISOString()
        };
      }
      return result;
    } catch (error) {
      console.error('Product info extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract product info',
        timestamp: new Date().toISOString()
      };
    }
  }
}
