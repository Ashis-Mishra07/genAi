export class ImageGeneratorTool {
  private apiKey: string;

  constructor() {
    // We'll use Hugging Face's free Stable Diffusion API
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
  }

  async execute(args: { 
    prompt: string; 
    productInfo?: any; 
    style?: 'lifestyle' | 'studio' | 'editorial' | 'commercial' | 'artistic';
    dimensions?: 'square' | 'story' | 'landscape';
  }) {
    const { prompt, productInfo, style = 'lifestyle', dimensions = 'square' } = args;

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

      // Option 3: Generate a CSS-based photoshoot mockup (always works)
      return this.generateCSSPoster(prompt, productInfo, style, dimensions);

    } catch (error: any) {
      console.error('All image generation methods failed:', error);
      
      // Ultimate fallback to text-based photoshoot concept description
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
    // Generate a beautiful CSS-based photoshoot mockup that looks like a real image
    const photoshootData = this.generateAdvancedHtmlPoster(prompt, productInfo, style, dimensions);
    
    return {
      success: true,
      result: {
        type: 'css_photoshoot',
        htmlContent: photoshootData,
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
    
    // Base prompt for professional product photoshoot
    enhancedPrompt += 'Create a professional product photoshoot for artisan products, ';
    enhancedPrompt += 'high-end photography aesthetic, editorial style product photography, ';
    
    // Add style modifiers with photoshoot focus
    switch (style) {
      case 'lifestyle':
        enhancedPrompt += 'lifestyle photography aesthetic, natural settings, authentic moments, everyday luxury, ';
        break;
      case 'studio':
        enhancedPrompt += 'professional studio photography, controlled lighting, clean backgrounds, product focus, ';
        break;
      case 'editorial':
        enhancedPrompt += 'editorial fashion photography style, artistic composition, magazine quality, storytelling imagery, ';
        break;
      case 'commercial':
        enhancedPrompt += 'commercial product photography, brand storytelling, professional styling, market-ready imagery, ';
        break;
      case 'artistic':
        enhancedPrompt += 'artistic photography approach, creative composition, artistic lighting, unique perspectives, ';
        break;
      default:
        enhancedPrompt += 'lifestyle product photography, authentic brand storytelling, photoshoot aesthetic, ';
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
    
    // Add professional photoshoot requirements - NO text overlays, focus on photography
    enhancedPrompt += ', professional product photoshoot with no text overlays, ';
    enhancedPrompt += 'pure photography focus, editorial quality imagery, ';
    enhancedPrompt += 'NO price tags, NO pricing information, NO text overlays, ';
    enhancedPrompt += 'NO watermarks, NO logos, NO promotional text, ';
    enhancedPrompt += 'focus on beautiful product photography and styling, ';
    enhancedPrompt += 'professional lighting setup, expert composition, ';
    enhancedPrompt += 'brand storytelling through visual narrative only, ';
    enhancedPrompt += 'Instagram-worthy photoshoot aesthetic, ';
    enhancedPrompt += 'perfect lighting, 4k resolution, photoshoot quality, ';
    enhancedPrompt += 'elegant photographic composition, let the artisan product and styling speak';

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
    <title>Artisan Product Photoshoot</title>
    <style>
        .photoshoot {
            width: ${dims.width}px;
            height: ${dims.height}px;
            background: linear-gradient(135deg, ${colorScheme.background});
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px;
            box-sizing: border-box;
            font-family: 'Inter', 'Helvetica Neue', sans-serif;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(5px);
        }
        
        .photoshoot::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${colorScheme.overlay};
            opacity: 0.05;
            filter: blur(1px);
        }
        
        .content {
            text-align: center;
            z-index: 2;
            max-width: 85%;
        }
        
        .brand-story {
            font-size: ${dimensions === 'story' ? '28px' : '24px'};
            color: ${colorScheme.text};
            margin-bottom: 40px;
            line-height: 1.6;
            font-weight: 200;
            text-align: center;
            letter-spacing: 0.5px;
        }
        
        .photoshoot-cta {
            background: transparent;
            color: ${colorScheme.text};
            border: 2px solid ${colorScheme.cta};
            padding: 15px 35px;
            border-radius: 25px;
            font-size: ${dimensions === 'story' ? '20px' : '18px'};
            font-weight: 300;
            text-decoration: none;
            display: inline-block;
            margin-top: 30px;
            transition: all 0.3s ease;
            letter-spacing: 1px;
        }
        
        .photoshoot-cta:hover {
            background: ${colorScheme.cta};
            color: white;
            transform: translateY(-1px);
        }
        
        .artisan-badge {
            position: absolute;
            top: 30px;
            left: 30px;
            background: rgba(255,255,255,0.15);
            color: ${colorScheme.text};
            padding: 10px 20px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 200;
            text-transform: lowercase;
            letter-spacing: 2px;
            backdrop-filter: blur(10px);
        }
        
        .brand-accent {
            position: absolute;
            ${dimensions === 'story' ? 'bottom: 40px; right: 40px;' : 'bottom: 30px; right: 30px;'}
            width: 60px;
            height: 60px;
            background: ${colorScheme.accent};
            border-radius: 30px;
            opacity: 0.1;
            transform: rotate(45deg);
        }
    </style>
</head>
<body>
    <div class="photoshoot">
        <div class="artisan-badge">artisan made</div>
        <div class="brand-accent"></div>
        <div class="content">
            <p class="brand-story">${description}</p>
            <div class="photoshoot-cta">explore collection</div>
        </div>
    </div>
</body>
</html>`;
  }

  private extractDescription(prompt: string, productInfo: any): string {
    if (productInfo?.description) return productInfo.description;
    
    // Create brand storytelling focused description for photoshoots
    const words = prompt.toLowerCase().split(' ');
    const storyWords = ['authentic', 'handcrafted', 'artisan', 'creative', 'passionate', 'unique', 'timeless'];
    const found = words.find(word => storyWords.includes(word)) || 'authentic';
    
    if (productInfo?.materials) {
      return `Where ${found} craftsmanship meets ${productInfo.materials} artistry`;
    }
    
    if (productInfo?.culture) {
      return `${found.charAt(0).toUpperCase() + found.slice(1)} heritage, modern expression`;
    }
    
    return `${found.charAt(0).toUpperCase() + found.slice(1)} artisan stories, beautifully crafted`;
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
      case 'lifestyle':
        return {
          background: '#fafafa, #f0f0f0',
          overlay: 'radial-gradient(circle at 60% 40%, #e8e8e8, transparent)',
          title: '#333333',
          text: '#555555',
          cta: '#8d6e63',
          accent: '#a1887f'
        };
      case 'studio':
        return {
          background: '#ffffff, #f8f8f8',
          overlay: 'linear-gradient(135deg, rgba(0,0,0,0.02), transparent)',
          title: '#212121',
          text: '#424242',
          cta: '#37474f',
          accent: '#546e7a'
        };
      case 'editorial':
        return {
          background: '#fcfcfc, #f5f5f5',
          overlay: 'radial-gradient(circle at 70% 30%, rgba(0,0,0,0.05), transparent)',
          title: '#1a1a1a',
          text: '#2e2e2e',
          cta: '#6d4c41',
          accent: '#8d6e63'
        };
      case 'commercial':
        return {
          background: '#f9f9f9, #eeeeee',
          overlay: 'linear-gradient(45deg, rgba(66,66,66,0.03), transparent)',
          title: '#263238',
          text: '#37474f',
          cta: '#455a64',
          accent: '#607d8b'
        };
      case 'artistic':
        return {
          background: '#fefefe, #f7f7f7',
          overlay: 'radial-gradient(circle at 40% 60%, rgba(121,85,72,0.08), transparent)',
          title: '#3e2723',
          text: '#5d4037',
          cta: '#795548',
          accent: '#8d6e63'
        };
      default: // lifestyle
        return {
          background: '#fafafa, #f0f0f0',
          overlay: 'radial-gradient(circle at 60% 40%, #e8e8e8, transparent)',
          title: '#333333',
          text: '#555555',
          cta: '#8d6e63',
          accent: '#ab47bc'
        };
    }
  }

  private generateFallbackPoster(prompt: string, productInfo: any, style: string, dimensions: string) {
    return {
      success: true,
      result: {
        type: 'text_photoshoot',
        content: `📸 **Professional Product Photoshoot Concept**\n\n${prompt}\n\n✨ **Photography Style**: ${style}\n📐 **Format**: ${dimensions}\n🎨 **Brand Story**: Authentic artisan craftsmanship\n\n� **Explore Collection**\n\n*This would be displayed as a beautiful photoshoot-style visual with elegant typography and minimal design.*`,
        style: style,
        dimensions: dimensions,
        tool: 'text-fallback',
        note: 'Visual photoshoot generation temporarily unavailable. This represents the photoshoot concept that would be captured.'
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
