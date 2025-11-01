import { NextRequest, NextResponse } from 'next/server';
import { InstagramPoster } from '@/lib/instagram-poster';
import { productOperations } from '@/lib/db/products';

interface ImagePostRequest {
  imageData?: string;
  imageUrl?: string;
  caption?: string;
  productInfo?: {
    title?: string;
    materials?: string;
    culture?: string;
    artistName?: string;
    price?: number;
    currency?: string;
    category?: string;
    dimensions?: string;
    description?: string;
    culturalOrigin?: string;
    creationStory?: string;
    careInstructions?: string;
    poster?: {
      imageUrl?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: ImagePostRequest = await request.json();
    const { imageData, imageUrl, caption, productInfo } = data;

    if (!imageData && !imageUrl) {
      return NextResponse.json(
        { error: 'Image data or URL is required' },
        { status: 400 }
      );
    }

    // Prepare Instagram caption with product info
    const instagramCaption = generateInstagramCaption(caption, productInfo);

    try {
      const poster = new InstagramPoster();
      
      // Test connection first
      const connectionOk = await poster.testConnection();
      
      if (!connectionOk) {
        return NextResponse.json({
          success: false,
          error: 'Instagram API connection failed. Please check your credentials.',
          suggestion: 'Verify your Instagram Business Account and access tokens in the .env file.'
        });
      }

      // Determine the image URL to use
      let finalImageUrl = imageUrl;
      
      // If productInfo contains the direct image URL from generation, use that
      if (productInfo?.poster?.imageUrl) {
        finalImageUrl = productInfo.poster.imageUrl;
        console.log('Using direct image URL from generator:', finalImageUrl);
      }
      // If it's a base64 data URL, generate a new image URL using Pollinations
      else if (imageData && imageData.startsWith('data:')) {
        // Extract the image description from the caption for re-generation
        const imagePrompt = extractImagePromptFromCaption(instagramCaption, productInfo);
        
        // Generate new image URL using Pollinations (this gives us a direct URL)
        finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1080&height=1080&seed=${Date.now()}&model=flux&enhance=true`;
        
        console.log('Generated new Instagram image URL:', finalImageUrl);
      } else if (imageData) {
        finalImageUrl = imageData;
      }

      if (!finalImageUrl) {
        throw new Error('No valid image URL available');
      }

      // Post to Instagram using URL method
      const mediaId = await poster.postImageByUrl(finalImageUrl, instagramCaption);

      if (!mediaId) {
        throw new Error('Failed to get media ID from Instagram posting');
      }

      // Create product in database if price is provided
      let product = null;
      let productPageUrl = null;
      
      if (productInfo?.price && productInfo.price > 0) {
        try {
          const productName = extractProductNameFromCaption(
            caption || '', 
            productInfo.title,
            productInfo.artistName
          );
          
          const productData = {
            name: productName,
            description: productInfo.description || caption || 'Handcrafted artisan product',
            price: productInfo.price,
            currency: productInfo.currency || 'INR',
            category: productInfo.category || 'Handcrafted',
            materials: productInfo.materials || 'Mixed media',
            dimensions: productInfo.dimensions || '',
            weight: '0', // Convert to string as required by interface
            artist_name: productInfo.artistName || 'Artisan',
            cultural_origin: productInfo.culturalOrigin || productInfo.culture || '',
            instagram_media_id: mediaId,
            instagram_url: `https://www.instagram.com/p/${mediaId}/`,
            image_url: finalImageUrl,
            is_active: true
          };

          product = await productOperations.createProduct(productData);
          
          // Generate product page URL
          productPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/products/${product.id}`;
          
          console.log('Created product page:', productPageUrl);
        } catch (productError) {
          console.error('Product creation error:', productError);
          // Continue without failing the Instagram post
        }
      }

      return NextResponse.json({
        success: true,
        mediaId: mediaId,
        message: product ? 'Posted to Instagram and created product page!' : 'Successfully posted to Instagram!',
        instagramUrl: `https://www.instagram.com/p/${mediaId}/`,
        caption: instagramCaption,
        imageUrl: finalImageUrl,
        product: product,
        productPageUrl: productPageUrl
      });

    } catch (instagramError: any) {
      console.error('Instagram posting error:', instagramError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to post to Instagram',
        details: instagramError.message,
        suggestion: 'Please check your Instagram credentials and account permissions.'
      });
    }

  } catch (error: any) {
    console.error('Instagram API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function extractImagePromptFromCaption(caption: string, productInfo: any): string {
  // Create a prompt for regenerating the image based on product info
  let prompt = 'Professional social media poster for artisan marketplace, ';
  
  if (productInfo?.title) {
    prompt += `featuring ${productInfo.title}, `;
  }
  
  if (productInfo?.materials) {
    prompt += `made from ${productInfo.materials}, `;
  }
  
  if (productInfo?.culture) {
    prompt += `${productInfo.culture} cultural heritage, `;
  }
  
  // Add style descriptors
  prompt += 'beautiful typography, elegant design, marketing poster, ';
  prompt += 'professional photography, high quality, social media ready, ';
  prompt += 'artisan craft, handmade product, cultural tradition, ';
  prompt += 'perfect lighting, detailed, commercial use';
  
  return prompt;
}

function generateInstagramCaption(originalCaption?: string, productInfo?: any): string {
  let caption = originalCaption || 'Beautiful handcrafted artisan piece';
  
  // Add artist attribution if provided
  if (productInfo?.artistName) {
    caption += `\n\nArtist: ${productInfo.artistName}`;
  }
  
  // Add price if provided
  if (productInfo?.price && productInfo.price > 0) {
    const currency = productInfo.currency || 'USD';
    caption += `\nPrice: ${currency} ${productInfo.price}`;
  }
  
  // Add call to action
  caption += '\n\nDM to buy! 💫';
  
  // Add relevant hashtags
  caption += '\n\n#handmade #artisan #handcrafted #art #unique #supportartists #handmadeart #artisanmade #dmtobuy';
  
  return caption;
}

function extractProductNameFromCaption(
  caption: string, 
  title?: string,
  artistName?: string
): string {
  // Use the title if provided
  if (title && title.trim()) {
    return title.trim();
  }
  
  // Try to extract a product name from the caption
  const words = caption.split(' ').slice(0, 5); // Take first 5 words
  let name = words.join(' ');
  
  // Clean up and limit length
  name = name.replace(/[^\w\s-]/g, '').trim();
  if (name.length > 50) {
    name = name.substring(0, 47) + '...';
  }
  
  // Fallback names
  if (!name || name.length < 3) {
    if (artistName) {
      name = `${artistName}'s Creation`;
    } else {
      name = 'Handcrafted Artisan Piece';
    }
  }
  
  return name;
}
