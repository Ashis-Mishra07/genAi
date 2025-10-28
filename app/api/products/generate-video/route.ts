import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/utils/jwt';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    // Get current user - must be admin
    const user = await getCurrentUser(request);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product details
    const products = await sql`
      SELECT id, name, description, category, image_url, video_status 
      FROM products WHERE id = ${productId}
    `;

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

    // Check if video generation is already in progress
    if (product.video_status === 'PROCESSING') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Video generation already in progress for this product',
          status: product.video_status
        },
        { status: 409 }
      );
    }

    // Update product status to PROCESSING
    await sql`
      UPDATE products 
      SET video_status = 'PROCESSING', 
          updated_at = NOW() 
      WHERE id = ${productId}
    `;

    // Prepare payload for n8n webhook
    const n8nWebhookUrl = process.env.N8N_VIDEO_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      throw new Error('N8N_VIDEO_WEBHOOK_URL environment variable is not set');
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/video-callback`;

    // Generate video prompt based on product category
    let videoPrompt = '';
    const category = product.category || 'Other';
    const productName = product.name;
    const description = product.description || '';

    if (category === 'Textiles & Fabrics' || category === 'Traditional Wear') {
      videoPrompt = `Create a professional product demonstration video showing a person wearing the exact ${productName} as shown in the reference image. The model elegantly wears this specific product, matching the exact fabric texture, colors, patterns, and design from the reference. Show the product from multiple angles, capturing how it drapes and fits. Close-up shots reveal intricate details matching the original design. Professional lighting, aesthetic background. Duration 7 seconds. Style: Professional product photography. Use the reference image to ensure accuracy. ${description}`;
    } else if (category === 'Jewelry & Accessories') {
      videoPrompt = `Create a professional jewelry showcase video featuring the exact ${productName} as shown in the reference image. Show hands and model wearing this specific jewelry piece, matching the exact design, color, and style from the reference. Capture light reflections and material quality identical to the original. Multiple angles showing craftsmanship and elegant movements. Professional studio lighting. Duration 7 seconds. Style: Luxury jewelry advertising. Use reference image for accurate representation. ${description}`;
    } else if (category === 'Pottery & Ceramics' || category === 'Home Decor') {
      videoPrompt = `Create a lifestyle product video showing the exact ${productName} as depicted in the reference image. Show a person using or interacting with this specific product, matching the exact design, color, and style from the reference. Demonstrate functionality in a home setting that complements the product's aesthetic. Warm, inviting environment. Duration 7 seconds. Style: Lifestyle home product photography. Use reference image to ensure product accuracy. ${description}`;
    } else if (category === 'Wood Crafts' || category === 'Metal Work' || category === 'Sculptures') {
      videoPrompt = `Create an artistic product showcase video for the exact ${productName} as shown in the reference image. Show a person examining this specific piece, matching the exact design, texture, and craftsmanship from the reference. Hands gently touch and rotate the product showing intricate details. Professional studio or gallery setting. Duration 7 seconds. Style: Art gallery product showcase. Use reference image for precise representation. ${description}`;
    } else if (category === 'Paintings & Art') {
      videoPrompt = `Create an art appreciation video featuring the exact ${productName} as shown in the reference image. Show a person viewing and admiring this specific artwork, matching the exact colors, composition, and style from the reference. Slow pan across the artwork capturing authentic details. Professional gallery or home setting. Duration 7 seconds. Style: Art gallery presentation. Use reference image for accurate artwork representation. ${description}`;
    } else {
      videoPrompt = `Create a professional product demonstration video for the exact ${productName} as shown in the reference image. Show a person interacting naturally with this specific product, matching the exact design, color, and features from the reference. Close-up shots of key details must match the original. Professional setting. Duration 7 seconds. Style: Professional e-commerce product video. Use reference image to ensure product accuracy. ${description}`;
    }

    const payload = {
      prompt: videoPrompt,
      productId: product.id,
      productImage: product.image_url,
      productName: product.name,
      productDescription: product.description,
      callbackUrl: callbackUrl
    };

    console.log('Triggering n8n video generation workflow:', {
      productId: product.id,
      productName: product.name,
      prompt: videoPrompt.substring(0, 100) + '...',
      webhookUrl: n8nWebhookUrl
    });

    // Trigger n8n workflow
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook failed:', errorText);
      
      // Revert status on failure
      await sql`
        UPDATE products 
        SET video_status = 'FAILED', 
            updated_at = NOW() 
        WHERE id = ${productId}
      `;

      throw new Error(`Failed to trigger video generation: ${errorText}`);
    }

    const n8nResult = await n8nResponse.json();
    console.log('n8n workflow triggered successfully:', n8nResult);

    return NextResponse.json({
      success: true,
      message: 'Video generation started successfully',
      productId: product.id,
      status: 'PROCESSING',
      workflowResponse: n8nResult
    });

  } catch (error: any) {
    console.error('Generate video error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start video generation',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
