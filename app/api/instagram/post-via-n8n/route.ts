import { NextRequest, NextResponse } from 'next/server';

// Function to transform Cloudinary URLs for social media platforms
function transformCloudinaryForSocialMedia(originalUrl: string, platform: 'facebook' | 'instagram' = 'facebook'): string {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  // Platform-specific transformations
  const transformations = {
    facebook: 'w_1200,h_628,c_fill,q_auto,f_auto', // 1.91:1 aspect ratio for Facebook
    instagram: 'w_1080,h_1080,c_fill,q_auto,f_auto' // 1:1 aspect ratio for Instagram
  };

  const transformation = transformations[platform];
  
  // Insert transformation parameters into Cloudinary URL
  return originalUrl.replace('/image/upload/', `/image/upload/${transformation}/`);
}

export async function POST(request: NextRequest) {
  try {
    const { productId, cloudinaryUrl, videoUrl, caption } = await request.json();

    // Determine post type based on available media
    const postType = videoUrl ? 'CAROUSEL' : 'SINGLE_IMAGE';

    console.log('🚀 ===============================================');
    console.log(`🚀 STARTING INSTAGRAM ${postType} POST VIA N8N WORKFLOW`);
    console.log('📦 Product ID:', productId);
    console.log('📸 Poster Image URL:', cloudinaryUrl);
    console.log('🎬 Video URL:', videoUrl || 'Not available (posting single image)');
    console.log('📝 Caption Length:', caption?.length || 0);
    console.log('🎯 Post Type:', postType);
    console.log('===============================================');

    if (!cloudinaryUrl) {
      throw new Error('Poster image URL is required');
    }

    if (!caption) {
      throw new Error('Caption is required');
    }

    // Transform Cloudinary URL for Facebook (since Instagram uses Facebook's API)
    const transformedImageUrl = transformCloudinaryForSocialMedia(cloudinaryUrl, 'facebook');
    
    console.log('🔄 Media URL Transformation:');
    console.log('📸 Original Poster URL:', cloudinaryUrl);
    console.log('✨ Transformed Poster URL:', transformedImageUrl);
    if (videoUrl) {
      console.log('🎬 Video URL:', videoUrl);
    }

    // Your n8n webhook URL - different endpoints for single image vs carousel
    const webhookPath = videoUrl ? 'instagram-post' : 'instagram-single-image';
    const n8nWebhookUrl = process.env.N8N_INSTAGRAM_WEBHOOK_URL || `http://localhost:5678/webhook/${webhookPath}`;

    // Prepare data for n8n workflow
    const n8nPayload: any = {
      imageURL: transformedImageUrl,  // Poster image (required)
      captionText: caption,
      Node: "17841477359386904", // Your Instagram business account ID
      productId: productId,
      timestamp: new Date().toISOString()
    };

    // Add video URL only if it exists (for carousel posts)
    if (videoUrl) {
      n8nPayload.videoURL = videoUrl;
      n8nPayload.postType = 'CAROUSEL';
    } else {
      n8nPayload.postType = 'SINGLE_IMAGE';
    }

    console.log('📤 Sending payload to n8n workflow:');
    console.log('🌐 n8n Webhook URL:', n8nWebhookUrl);
    console.log('📊 Payload:', {
      imageURL: n8nPayload.imageURL,
      videoURL: n8nPayload.videoURL || 'N/A (single image post)',
      captionText: n8nPayload.captionText.substring(0, 100) + '...',
      Node: n8nPayload.Node,
      productId: n8nPayload.productId,
      postType: n8nPayload.postType
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
    console.log(`🎉 INSTAGRAM ${postType} POST COMPLETED SUCCESSFULLY!`);
    console.log('📸 Posted Poster URL:', transformedImageUrl);
    if (videoUrl) {
      console.log('🎬 Posted Video URL:', videoUrl);
    }
    console.log('📱 Instagram Business Account:', n8nPayload.Node);
    console.log('🆔 Creation ID:', n8nResult?.id || 'Unknown');
    console.log('===============================================');

    return NextResponse.json({
      success: true,
      message: videoUrl 
        ? 'Posted carousel to Instagram via n8n successfully' 
        : 'Posted single image to Instagram via n8n successfully',
      postType: postType,
      data: {
        n8nResult: n8nResult,
        originalCloudinaryUrl: cloudinaryUrl,
        transformedImageUrl: transformedImageUrl,
        videoUrl: videoUrl || null,
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