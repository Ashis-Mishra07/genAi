import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productId, cloudinaryUrl, caption } = await request.json();

    console.log('🚀 ===============================================');
    console.log('🚀 STARTING INSTAGRAM POST VIA N8N WORKFLOW');
    console.log('📦 Product ID:', productId);
    console.log('📸 Cloudinary Poster URL:', cloudinaryUrl);
    console.log('📝 Caption Length:', caption?.length || 0);
    console.log('===============================================');

    if (!cloudinaryUrl) {
      throw new Error('Cloudinary URL is required');
    }

    if (!caption) {
      throw new Error('Caption is required');
    }

    // Your n8n webhook URL - update this with your actual n8n URL
    const n8nWebhookUrl = process.env.N8N_INSTAGRAM_WEBHOOK_URL || 'http://localhost:5678/webhook/instagram-post';

    // Prepare data for n8n workflow (matching your n8n structure)
    const n8nPayload = {
      imageURL: cloudinaryUrl,  // ← Changed to imageURL (capital URL) to match n8n
      captionText: caption,
      Node: "17841477359386904", // Your Instagram business account ID
      productId: productId,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending payload to n8n workflow:');
    console.log('🌐 n8n Webhook URL:', n8nWebhookUrl);
    console.log('📊 Payload:', {
      imageURL: n8nPayload.imageURL,
      captionText: n8nPayload.captionText.substring(0, 100) + '...',
      Node: n8nPayload.Node,
      productId: n8nPayload.productId
    });

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ArtisanAI-Bot/1.0'
      },
      body: JSON.stringify(n8nPayload),
    });

    console.log('📡 n8n Response Status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('❌ n8n workflow failed:', errorText);
      throw new Error(`n8n workflow failed: ${n8nResponse.status} - ${errorText}`);
    }

    const n8nResult = await n8nResponse.json();
    console.log('✅ n8n workflow completed successfully:');
    console.log('📊 n8n Result:', n8nResult);

    console.log('🎉 ===============================================');
    console.log('🎉 INSTAGRAM POST COMPLETED SUCCESSFULLY!');
    console.log('📸 Posted Image URL:', cloudinaryUrl);
    console.log('📱 Instagram Business Account:', n8nPayload.Node);
    console.log('🆔 Creation ID:', n8nResult?.id || 'Unknown');
    console.log('===============================================');

    return NextResponse.json({
      success: true,
      message: 'Posted to Instagram via n8n successfully',
      data: {
        n8nResult: n8nResult,
        cloudinaryUrl: cloudinaryUrl,
        productId: productId,
        instagramAccountId: n8nPayload.Node,
        postedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ ===============================================');
    console.error('❌ N8N INSTAGRAM POST FAILED');
    console.error('💥 Error:', error);
    console.error('===============================================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to post to Instagram via n8n workflow'
      },
      { status: 500 }
    );
  }
}