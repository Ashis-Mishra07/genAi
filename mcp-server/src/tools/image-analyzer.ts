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
      Analyze this product image for REALISTIC PHOTOSHOOT PLANNING with models. Extract information in JSON format:
      {
        "productName": "estimated product name",
        "category": "product category",
        "specificProductType": "exact product type (hoodie, tshirt, necklace, bag, shoes, dress, etc.)",
        "materials": ["list of materials"],
        "colors": ["dominant colors"],
        "photographyStyle": "current photography style (studio, lifestyle, editorial, commercial, artistic)",
        "lightingQuality": "assessment of lighting and shadows",
        "compositionNotes": "photography composition analysis",
        "idealModel": "recommended model type for this product (casual streetwear model, elegant jewelry model, professional fashion model, etc.)",
        "photoshootScenario": "specific photoshoot scenario (urban street, professional studio, elegant portrait, lifestyle setting, etc.)",
        "stylingElements": ["specific styling suggestions for model photoshoot"],
        "modelPoses": ["recommended model poses for this product type"],
        "settingRecommendations": ["ideal photoshoot settings and backgrounds"],
        "brandStoryElements": ["visual elements that tell the brand story"],
        "culturalElements": ["cultural or traditional elements visible"],
        "photoshootPotential": "assessment of how this product would look in professional model photoshoot",
        "visualAppeal": "overall aesthetic and visual impact assessment",
        "backgroundSuitability": "current background and setting analysis",
        "improvementSuggestions": ["photography and model presentation improvement ideas"],
        "instagramReady": "assessment of Instagram-worthiness and social media appeal"
      }
      Only return the JSON, no additional text.
    `;

    try {
      const result = await this.analyzeImage(imageData, prompt);
      if (result.success && result.analysis) {
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
