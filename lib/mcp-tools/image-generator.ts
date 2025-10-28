export class ImageGeneratorTool {
  private apiKey: string;

  constructor() {
    // We'll use Hugging Face's free Stable Diffusion API
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
  }

  async execute(args: { 
    prompt: string; 
    productInfo?: any; 
    style?: 'poster' | 'elegant' | 'vintage' | 'modern' | 'cultural';
    dimensions?: 'square' | 'story' | 'landscape';
  }) {
    const { prompt, productInfo, style = 'poster', dimensions = 'square' } = args;

    try {
      // Try multiple free image generation APIs
      let imageResult = null;
      
      // Option 1: Try Pollinations AI (free, no API key required)
      try {
        imageResult = await this.generateWithPollinations(prompt, productInfo, style, dimensions);
        if (imageResult) return imageResult;
      } catch (error) {
        console.log('Pollinations API failed, trying next option...');
      }

      // Option 2: Try Hugging Face if API key is available
      if (this.apiKey) {
        try {
          imageResult = await this.generateWithHuggingFace(prompt, productInfo, style, dimensions);
          if (imageResult) return imageResult;
        } catch (error) {
          console.log('Hugging Face API failed, trying fallback...');
        }
      }

      // Option 3: Generate a CSS-based visual poster (always works)
      return this.generateCSSPoster(prompt, productInfo, style, dimensions);

    } catch (error: any) {
      console.error('All image generation methods failed:', error);
      
      // Ultimate fallback to text-based poster description
      return this.generateFallbackPoster(prompt, productInfo, style, dimensions);
    }
  }

  private async generateWithPollinations(prompt: string, productInfo: any, style: string, dimensions: string) {
    const enhancedPrompt = this.enhancePromptForPoster(prompt, productInfo, style);
    
    // Get dimension specs
    const dims = this.getDimensions(dimensions);
    
    // Generate image URL with enhanced prompt
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${dims.width}&height=${dims.height}&seed=${Date.now()}&model=flux&enhance=true`;
    
    console.log('Generating image with Pollinations AI...');
    console.log('Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
    
    try {
      // Test if the image URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        return {
          success: true,
          result: {
            type: 'generated_image',
            imageData: imageUrl, // Return direct URL for Instagram compatibility
            imageUrl: imageUrl,  // Also provide as imageUrl for clarity
            prompt: enhancedPrompt,
            style: style,
            dimensions: dimensions,
            tool: 'pollinations-ai'
          },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log('Pollinations AI test failed');
    }
    
    return null;
  }

  private async generateWithHuggingFace(prompt: string, productInfo: any, style: string, dimensions: string) {
    const enhancedPrompt = this.enhancePromptForPoster(prompt, productInfo, style);
    
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          method: "POST",
          body: JSON.stringify({
            inputs: enhancedPrompt,
            options: { wait_for_model: true }
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const base64 = await this.blobToBase64(blob);
        
        return {
          success: true,
          result: {
            type: 'generated_image',
            imageData: base64,
            prompt: enhancedPrompt,
            style: style,
            dimensions: dimensions,
            tool: 'huggingface-sdxl'
          },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log('Hugging Face generation failed');
    }
    
    return null;
  }

  private generateCSSPoster(prompt: string, productInfo: any, style: string, dimensions: string) {
    // Generate a beautiful CSS-based poster that looks like a real image
    const posterData = this.generateAdvancedHtmlPoster(prompt, productInfo, style, dimensions);
    
    return {
      success: true,
      result: {
        type: 'css_poster',
        htmlContent: posterData,
        prompt: prompt,
        style: style,
        dimensions: dimensions,
        tool: 'css-poster-generator',
        note: 'Generated CSS-based visual poster. For AI-generated images, check network connection or try again later.'
      },
      timestamp: new Date().toISOString()
    };
  }

  private enhancePromptForPoster(prompt: string, productInfo: any, style: string): string {
    let enhancedPrompt = '';
    
    // Base prompt for sales/marketing poster
    enhancedPrompt += 'Create a professional marketing poster for selling artisan products, ';
    enhancedPrompt += 'commercial advertisement style, e-commerce product poster, ';
    
    // Add style modifiers with sales focus
    switch (style) {
      case 'elegant':
        enhancedPrompt += 'luxury brand aesthetic, premium product showcase, elegant typography, gold accents, ';
        break;
      case 'vintage':
        enhancedPrompt += 'vintage marketplace style, traditional craft advertisement, heritage branding, ';
        break;
      case 'modern':
        enhancedPrompt += 'modern e-commerce design, clean product showcase, contemporary branding, ';
        break;
      case 'cultural':
        enhancedPrompt += 'authentic cultural branding, traditional patterns as background, heritage showcase, ';
        break;
      default:
        enhancedPrompt += 'professional product showcase, sales-focused design, marketing poster, ';
    }

    // Add product-specific details if available
    if (productInfo) {
      if (productInfo.type) enhancedPrompt += `showcasing beautiful ${productInfo.type}, `;
      if (productInfo.materials) enhancedPrompt += `highlighting ${productInfo.materials} craftsmanship, `;
      if (productInfo.culture) enhancedPrompt += `celebrating ${productInfo.culture} heritage, `;
      if (productInfo.title) enhancedPrompt += `product name "${productInfo.title}", `;
    }

    // Add the main prompt
    enhancedPrompt += prompt;
    
    // Add clean, minimal poster requirements - NO pricing or text overlays
    enhancedPrompt += ', clean professional Instagram poster with minimal text, ';
    enhancedPrompt += 'only "DM to Buy" call-to-action in small elegant corner, ';
    enhancedPrompt += 'NO price tags, NO pricing information, NO artist name overlay, ';
    enhancedPrompt += 'NO product title text, NO watermarks, NO text overlays, ';
    enhancedPrompt += 'focus on beautiful product photography, clean aesthetic, ';
    enhancedPrompt += 'minimal design, product-focused composition, ';
    enhancedPrompt += 'social media optimized, Instagram post format, ';
    enhancedPrompt += 'high-end product showcase, clean professional background, ';
    enhancedPrompt += 'perfect lighting, 4k resolution, minimal text poster design, ';
    enhancedPrompt += 'elegant simplicity, let the product speak for itself';

    return enhancedPrompt;
  }

  private generateAdvancedHtmlPoster(prompt: string, productInfo: any, style: string, dimensions: string): string {
    const dims = this.getDimensions(dimensions);
    
    // Extract key information for the poster - but keep it minimal
    const description = this.extractDescription(prompt, productInfo);
    const colorScheme = this.getColorScheme(style);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Artisan Product Poster</title>
    <style>
        .poster {
            width: ${dims.width}px;
            height: ${dims.height}px;
            background: linear-gradient(135deg, ${colorScheme.background});
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            box-sizing: border-box;
            font-family: 'Georgia', serif;
            position: relative;
            overflow: hidden;
        }
        
        .poster::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${colorScheme.overlay};
            opacity: 0.1;
        }
        
        .content {
            text-align: center;
            z-index: 2;
            max-width: 90%;
        }
        
        .description {
            font-size: ${dimensions === 'story' ? '32px' : '28px'};
            color: ${colorScheme.text};
            margin-bottom: 50px;
            line-height: 1.4;
            font-weight: 300;
            text-align: center;
        }
        
        .cta {
            background: ${colorScheme.cta};
            color: white;
            padding: 18px 40px;
            border-radius: 30px;
            font-size: ${dimensions === 'story' ? '24px' : '22px'};
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        
        .cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        }
        
        .handcrafted-badge {
            position: absolute;
            top: 25px;
            left: 25px;
            background: rgba(255,255,255,0.9);
            color: ${colorScheme.cta};
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .cultural-element {
            position: absolute;
            ${dimensions === 'story' ? 'bottom: 30px; right: 30px;' : 'bottom: 25px; right: 25px;'}
            width: 80px;
            height: 80px;
            background: ${colorScheme.accent};
            border-radius: 50%;
            opacity: 0.2;
        }
    </style>
</head>
<body>
    <div class="poster">
        <div class="handcrafted-badge">Handcrafted</div>
        <div class="cultural-element"></div>
        <div class="content">
            <p class="description">${description}</p>
            <div class="cta">DM to Buy</div>
        </div>
    </div>
</body>
</html>`;
  }

  private extractDescription(prompt: string, productInfo: any): string {
    if (productInfo?.description) return productInfo.description;
    
    // Create a clean, descriptive text without pricing
    const words = prompt.toLowerCase().split(' ');
    const craftWords = ['handcrafted', 'artisan', 'traditional', 'beautiful', 'unique', 'elegant'];
    const found = words.find(word => craftWords.includes(word)) || 'beautiful';
    
    if (productInfo?.materials) {
      return `${found.charAt(0).toUpperCase() + found.slice(1)} ${productInfo.materials} creation`;
    }
    
    return `${found.charAt(0).toUpperCase() + found.slice(1)} handcrafted piece`;
  }

  private getDimensions(dimensions: string) {
    switch (dimensions) {
      case 'story':
        return { width: 1080, height: 1920 };
      case 'landscape':
        return { width: 1920, height: 1080 };
      case 'square':
      default:
        return { width: 1080, height: 1080 };
    }
  }

  private getColorScheme(style: string) {
    switch (style) {
      case 'elegant':
        return {
          background: '#f8f6f3, #e8e5e1',
          overlay: 'radial-gradient(circle at 50% 50%, #d4af37, transparent)',
          title: '#2c1810',
          text: '#5a4a3a',
          cta: '#d4af37',
          accent: '#d4af37'
        };
      case 'vintage':
        return {
          background: '#f4f1e8, #e6dcc8',
          overlay: 'radial-gradient(circle at 30% 70%, #8b4513, transparent)',
          title: '#3e2723',
          text: '#5d4037',
          cta: '#8b4513',
          accent: '#cd853f'
        };
      case 'modern':
        return {
          background: '#ffffff, #f5f5f5',
          overlay: 'linear-gradient(45deg, #333333, transparent)',
          title: '#212121',
          text: '#424242',
          cta: '#2196f3',
          accent: '#03a9f4'
        };
      case 'cultural':
        return {
          background: '#fff8e1, #f3e5ab',
          overlay: 'radial-gradient(circle at 70% 30%, #ff6f00, transparent)',
          title: '#e65100',
          text: '#bf360c',
          cta: '#ff6f00',
          accent: '#ffa726'
        };
      default:
        return {
          background: '#fafafa, #f0f0f0',
          overlay: 'linear-gradient(135deg, #6a1b9a, transparent)',
          title: '#4a148c',
          text: '#6a1b9a',
          cta: '#8e24aa',
          accent: '#ab47bc'
        };
    }
  }

  private generateFallbackPoster(prompt: string, productInfo: any, style: string, dimensions: string) {
    return {
      success: true,
      result: {
        type: 'text_poster',
        content: `📸 **Professional Product Poster**\n\n${prompt}\n\n✨ **Style**: ${style}\n📐 **Format**: ${dimensions}\n\n💫 **DM to Buy**\n\n*This would be displayed as a beautiful visual poster with minimal text and clean design.*`,
        style: style,
        dimensions: dimensions,
        tool: 'text-fallback',
        note: 'Visual poster generation temporarily unavailable. This represents the poster content that would be displayed.'
      },
      timestamp: new Date().toISOString()
    };
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
