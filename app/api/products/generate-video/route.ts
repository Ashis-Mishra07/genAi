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
      videoPrompt = `A professional product demonstration video showing a person wearing ${productName}. The model elegantly wears the product, capturing the fabric texture, colors, and draping. Close-up shots show intricate details. The person moves naturally to demonstrate comfort and fit. Professional lighting, aesthetic background. Duration 7 seconds. Style: Professional product photography. ${description}`;
    } else if (category === 'Jewelry & Accessories') {
      videoPrompt = `A professional jewelry showcase video featuring ${productName}. Hands and model wearing the jewelry piece, capturing light reflections and material quality. Multiple angles showing craftsmanship and elegant hand movements. Professional studio lighting. Duration 7 seconds. Style: Luxury jewelry advertising. ${description}`;
    } else if (category === 'Pottery & Ceramics' || category === 'Home Decor') {
      videoPrompt = `A lifestyle product video showing ${productName} in use. A person using or interacting with the product in a home setting, demonstrating functionality and aesthetic appeal. Warm, inviting home environment. Duration 7 seconds. Style: Lifestyle home product photography. ${description}`;
    } else if (category === 'Wood Crafts' || category === 'Metal Work' || category === 'Sculptures') {
      videoPrompt = `An artistic product showcase video for ${productName}. A person examining and appreciating the craftsmanship, hands gently touching and rotating the product. Close-ups of intricate details and textures. Professional studio or gallery-like setting. Duration 7 seconds. Style: Art gallery product showcase. ${description}`;
    } else if (category === 'Paintings & Art') {
      videoPrompt = `An art appreciation video featuring ${productName}. A person viewing and admiring the artwork. Slow pan across the artwork capturing details. Professional gallery or home setting with natural reactions of appreciation. Duration 7 seconds. Style: Art gallery presentation. ${description}`;
    } else {
      videoPrompt = `A professional product demonstration video for ${productName}. A person interacting naturally with the product, demonstrating features and quality. Close-up shots of key details. Professional setting. Duration 7 seconds. Style: Professional e-commerce product video. ${description}`;
    }

    const payload = {
      prompt: videoPrompt,
      productId: product.id,
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
