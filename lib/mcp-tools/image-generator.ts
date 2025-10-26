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
    // Detect product type from prompt and productInfo
    const productType = this.detectProductType(prompt, productInfo);
    const photoshootConcept = this.getPhotoshootConcept(productType, style);
    
    let enhancedPrompt = photoshootConcept.basePrompt;
    
    // Add product-specific details
    if (productInfo) {
      if (productInfo.type) enhancedPrompt += `featuring ${productInfo.type}, `;
      if (productInfo.materials) enhancedPrompt += `made from ${productInfo.materials}, `;
      if (productInfo.colors && productInfo.colors.length > 0) {
        enhancedPrompt += `in ${productInfo.colors.join(' and ')} colors, `;
      }
      if (productInfo.culture) enhancedPrompt += `with ${productInfo.culture} cultural elements, `;
    }

    // Add the main prompt context
    enhancedPrompt += prompt + ', ';
    
    // Add specific photoshoot scenario
    enhancedPrompt += photoshootConcept.scenario + ', ';
    
    // Add style-specific modifiers
    enhancedPrompt += photoshootConcept.styleModifiers + ', ';
    
    // Add technical requirements
    enhancedPrompt += photoshootConcept.technicalSpecs + ', ';
    
    // Add final quality specifications
    enhancedPrompt += 'professional photography, high resolution, no text overlays, no watermarks, no logos, cinematic lighting, magazine quality, Instagram-worthy aesthetic';

    return enhancedPrompt;
  }

  private detectProductType(prompt: string, productInfo: any): string {
    const text = (prompt + ' ' + JSON.stringify(productInfo || {})).toLowerCase();
    
    // Clothing detection with better patterns
    if (text.match(/\b(hoodie|hoody|sweatshirt|pullover|jumper)\b/)) return 'hoodie';
    if (text.match(/\b(t-?shirt|tee|top|tank)\b/)) return 'tshirt';
    if (text.match(/\b(shirt|blouse|button.?up|dress.?shirt)\b/)) return 'shirt';
    if (text.match(/\b(dress|gown|frock|sundress|maxi.?dress)\b/)) return 'dress';
    if (text.match(/\b(jeans|pants|trousers|bottoms|slacks|chinos)\b/)) return 'pants';
    if (text.match(/\b(jacket|blazer|coat|cardigan|sweater)\b/)) return 'jacket';
    if (text.match(/\b(shoes|sneakers|boots|footwear|sandals|heels)\b/)) return 'shoes';
    
    // Accessories detection
    if (text.match(/\b(necklace|chain|pendant|choker)\b/)) return 'necklace';
    if (text.match(/\b(ring|band|signet)\b/)) return 'ring';
    if (text.match(/\b(earrings|studs|hoops|dangles)\b/)) return 'earrings';
    if (text.match(/\b(bracelet|bangle|wristband|charm.?bracelet)\b/)) return 'bracelet';
    if (text.match(/\b(watch|timepiece|wristwatch)\b/)) return 'watch';
    if (text.match(/\b(bag|purse|handbag|backpack|tote|clutch|satchel)\b/)) return 'bag';
    if (text.match(/\b(hat|cap|beanie|fedora|baseball.?cap)\b/)) return 'hat';
    if (text.match(/\b(sunglasses|glasses|eyewear|shades)\b/)) return 'sunglasses';
    if (text.match(/\b(scarf|shawl|wrap|pashmina)\b/)) return 'scarf';
    
    // Home & Decor
    if (text.match(/\b(vase|pot|vessel|urn|planter)\b/)) return 'vase';
    if (text.match(/\b(candle|lamp|light|lantern|sconce)\b/)) return 'candle';
    if (text.match(/\b(pillow|cushion|throw|pillow.?case)\b/)) return 'pillow';
    if (text.match(/\b(artwork|painting|print|canvas|poster)\b/)) return 'artwork';
    if (text.match(/\b(sculpture|figurine|statue|carving)\b/)) return 'sculpture';
    if (text.match(/\b(bowl|dish|plate|ceramic|pottery)\b/)) return 'bowl';
    if (text.match(/\b(mirror|frame|wall.?decor)\b/)) return 'mirror';
    
    // Beauty & Personal Care
    if (text.match(/\b(soap|skincare|lotion|cream|balm)\b/)) return 'skincare';
    if (text.match(/\b(perfume|fragrance|cologne|scent)\b/)) return 'perfume';
    
    // Default fallback
    return 'general';
  }

  private getPhotoshootConcept(productType: string, style: string) {
    const concepts: { [key: string]: any } = {
      hoodie: {
        basePrompt: 'Professional fashion photoshoot featuring a model wearing a stylish hoodie, ',
        scenario: style === 'lifestyle' ? 
          'urban street setting, model walking casually, natural candid poses, city backdrop' :
          style === 'studio' ?
          'clean white studio backdrop, model in confident standing poses, professional lighting setup' :
          style === 'editorial' ?
          'artistic urban environment, dramatic model poses, magazine-style composition, moody lighting' :
          style === 'commercial' ?
          'commercial product showcase, model displaying hoodie features, brand-focused professional shoot' :
          'artistic creative shoot, model in expressive poses, unique lighting, creative composition',
        styleModifiers: style === 'lifestyle' ? 
          'natural street lighting, authentic urban aesthetic, casual styling, real-world context' :
          style === 'studio' ?
          'professional studio lighting, clean background, fashion model poses, commercial quality' :
          'high-fashion editorial lighting, dramatic shadows, magazine photography, artistic direction',
        technicalSpecs: 'full body and detail shots, fabric texture clearly visible, fit and styling emphasized, model showcasing hoodie naturally'
      },
      
      tshirt: {
        basePrompt: 'Professional fashion photoshoot with a model wearing a stylish t-shirt, ',
        scenario: style === 'lifestyle' ? 
          'casual outdoor setting, model in relaxed natural poses, everyday fashion context, natural environment' :
          style === 'studio' ?
          'minimalist studio setup, model showcasing t-shirt fit and style, clean professional backdrop' :
          style === 'editorial' ?
          'creative fashion editorial setting, artistic model poses, magazine-quality composition' :
          style === 'commercial' ?
          'commercial product photography, model highlighting t-shirt features and design details' :
          'artistic fashion shoot, creative poses, unique styling, expressive modeling',
        styleModifiers: style === 'lifestyle' ? 
          'natural daylight, casual authentic styling, lifestyle moments, relaxed atmosphere' :
          style === 'studio' ?
          'controlled studio lighting, professional model poses, commercial fashion styling' :
          'editorial fashion lighting, dramatic composition, high-fashion styling, artistic direction',
        technicalSpecs: 'upper body focus shots, fabric detail and color accuracy, t-shirt fit clearly shown, natural model poses'
      },
      
      shirt: {
        basePrompt: 'Professional fashion photoshoot with a model wearing an elegant dress shirt, ',
        scenario: style === 'lifestyle' ? 
          'sophisticated office or cafe environment, model in professional casual poses, business casual context' :
          style === 'studio' ?
          'clean professional studio setup, model in business formal poses, elegant styling' :
          style === 'editorial' ?
          'high-fashion editorial shoot, dramatic lighting, sophisticated magazine composition' :
          style === 'commercial' ?
          'commercial fashion photography, model showcasing shirt versatility and professional quality' :
          'artistic professional shoot, creative styling, sophisticated poses, elegant presentation',
        styleModifiers: style === 'lifestyle' ? 
          'natural professional lighting, business casual aesthetic, sophisticated real-world styling' :
          style === 'studio' ?
          'professional studio lighting, formal model poses, business fashion presentation' :
          'editorial fashion lighting, dramatic professional styling, magazine-quality composition',
        technicalSpecs: 'upper body and detail shots, fabric quality and craftsmanship visible, professional styling emphasized'
      },
      
      dress: {
        basePrompt: 'Elegant fashion photoshoot featuring a model wearing the beautiful dress, ',
        scenario: style === 'lifestyle' ? 
          'beautiful outdoor location, model in graceful natural poses, romantic golden hour lighting' :
          style === 'studio' ?
          'professional fashion studio, model in elegant flowing poses, dramatic studio lighting' :
          style === 'editorial' ?
          'high-fashion editorial shoot, artistic dramatic poses, magazine-style glamour photography' :
          style === 'commercial' ?
          'commercial fashion photography, model showcasing dress silhouette, movement, and details' :
          'artistic fashion shoot, creative poses, dramatic lighting, expressive modeling',
        styleModifiers: style === 'lifestyle' ? 
          'golden hour natural lighting, romantic atmosphere, elegant natural poses, outdoor beauty' :
          style === 'studio' ?
          'professional fashion lighting, elegant model poses, glamorous styling, studio perfection' :
          'high-fashion editorial lighting, dramatic composition, luxury styling, artistic direction',
        technicalSpecs: 'full body shots emphasizing dress silhouette, fabric flow and movement captured, elegant model presentation'
      },
      
      necklace: {
        basePrompt: 'Professional jewelry photoshoot featuring a model wearing the elegant necklace, ',
        scenario: style === 'lifestyle' ? 
          'elegant portrait setting, model in natural graceful poses, necklace as the focal point' :
          style === 'studio' ?
          'clean jewelry photography setup, close-up and portrait shots, professional jewelry lighting' :
          style === 'editorial' ?
          'high-fashion jewelry editorial, artistic composition, luxury jewelry aesthetic' :
          style === 'commercial' ?
          'commercial jewelry photography, model showcasing necklace design and craftsmanship details' :
          'artistic jewelry shoot, creative lighting, dramatic poses, luxury presentation',
        styleModifiers: style === 'lifestyle' ? 
          'soft natural portrait lighting, elegant simplicity, refined natural styling' :
          style === 'studio' ?
          'controlled jewelry lighting, macro detail capability, luxury commercial presentation' :
          'editorial jewelry lighting, dramatic shadows, high-fashion luxury styling',
        technicalSpecs: 'close-up detail shots of jewelry craftsmanship, portrait shots emphasizing necklace, model poses highlighting piece'
      },
      
      bag: {
        basePrompt: 'Professional accessory photoshoot featuring a model with the stylish bag, ',
        scenario: style === 'lifestyle' ? 
          'urban street style setting, model carrying bag naturally, everyday fashion lifestyle context' :
          style === 'studio' ?
          'clean studio setup, model posing with bag, accessory-focused professional photography' :
          style === 'editorial' ?
          'fashion editorial shoot, artistic styling, luxury accessory presentation' :
          style === 'commercial' ?
          'commercial product photography, model demonstrating bag functionality, style, and features' :
          'artistic accessory shoot, creative poses, unique styling, expressive modeling',
        styleModifiers: style === 'lifestyle' ? 
          'street style aesthetic, natural carrying poses, fashion-forward everyday styling' :
          style === 'studio' ?
          'professional accessory lighting, model poses showcasing bag design and functionality' :
          'editorial fashion lighting, luxury accessory styling, high-fashion presentation',
        technicalSpecs: 'bag detail shots, model carrying and styling poses, craftsmanship and functionality clearly visible'
      },
      
      shoes: {
        basePrompt: 'Professional footwear photoshoot featuring a model wearing the stylish shoes, ',
        scenario: style === 'lifestyle' ? 
          'urban or natural outdoor setting, model walking or standing naturally, shoes in real-world context' :
          style === 'studio' ?
          'clean studio floor setup, model poses emphasizing footwear, professional shoe photography' :
          style === 'editorial' ?
          'fashion editorial shoot, artistic footwear photography, magazine-style composition' :
          style === 'commercial' ?
          'commercial shoe photography, model demonstrating shoe style, fit, and design details' :
          'artistic footwear shoot, creative poses, dramatic lighting, expressive modeling',
        styleModifiers: style === 'lifestyle' ? 
          'natural lighting, movement and walking shots, real-world footwear context' :
          style === 'studio' ?
          'professional footwear lighting, posed shots emphasizing design, product-focused presentation' :
          'editorial fashion lighting, dramatic footwear styling, high-fashion shoe presentation',
        technicalSpecs: 'full body and close-up shoe shots, footwear detail and craftsmanship visible, fit and style emphasized'
      },
      
      // Additional product types for comprehensive coverage
      pants: {
        basePrompt: 'Professional fashion photoshoot with a model wearing the stylish pants, ',
        scenario: style === 'lifestyle' ? 
          'casual urban setting, model in natural walking poses, everyday fashion context' :
          'professional studio setup, model showcasing pants fit and style, clean backdrop',
        styleModifiers: 'natural fashion lighting, model poses emphasizing fit and movement',
        technicalSpecs: 'full body shots, pants fit and fabric detail visible, styling emphasized'
      },
      
      jacket: {
        basePrompt: 'Professional outerwear photoshoot featuring a model wearing the jacket, ',
        scenario: style === 'lifestyle' ? 
          'outdoor urban setting, model in natural poses, layered styling context' :
          'studio setup, model showcasing jacket design and fit, professional presentation',
        styleModifiers: 'fashion lighting emphasizing texture and fit',
        technicalSpecs: 'upper body and detail shots, jacket construction and styling visible'
      },
      
      scarf: {
        basePrompt: 'Professional accessory photoshoot with a model wearing the elegant scarf, ',
        scenario: 'portrait and styling shots, model showcasing scarf versatility and draping',
        styleModifiers: 'soft lighting emphasizing fabric texture and styling options',
        technicalSpecs: 'detail shots of fabric and styling versatility, elegant model poses'
      },
      
      vase: {
        basePrompt: 'Professional home decor lifestyle photoshoot featuring the beautiful vase, ',
        scenario: style === 'lifestyle' ? 
          'elegant home interior setting, vase styled with fresh flowers, natural home environment' :
          style === 'studio' ?
          'clean product photography setup, vase as centerpiece, professional lighting' :
          'artistic interior design shoot, sophisticated home styling, magazine-quality presentation',
        styleModifiers: style === 'lifestyle' ? 
          'natural home lighting, lived-in aesthetic, cozy styling, authentic home environment' :
          'professional product lighting, styled interior presentation, commercial quality',
        technicalSpecs: 'detailed craftsmanship shots, styled interior context, artistic home composition'
      },
      
      general: {
        basePrompt: 'Professional product photoshoot showcasing the beautiful artisan item, ',
        scenario: style === 'lifestyle' ? 
          'natural authentic setting, product in real-world context, lifestyle integration' :
          style === 'studio' ?
          'clean professional setup, product as hero focus, controlled lighting' :
          style === 'editorial' ?
          'artistic editorial presentation, creative composition, magazine-style quality' :
          'commercial product photography, professional presentation, brand-focused shoot',
        styleModifiers: style === 'lifestyle' ? 
          'natural lighting, authentic context, real-world styling' :
          'professional studio lighting, product hero shots, commercial presentation',
        technicalSpecs: 'detailed craftsmanship visible, multiple angles, professional quality photography'
      }
    };
    
    return concepts[productType] || concepts.general;
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
