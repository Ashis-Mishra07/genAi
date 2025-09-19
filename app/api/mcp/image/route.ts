import { NextRequest, NextResponse } from 'next/server';
import { ImageAnalyzerTool } from '@/lib/mcp-tools/image-analyzer';

const imageAnalyzer = new ImageAnalyzerTool();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const prompt = formData.get('prompt') as string || 'Analyze this product image for marketplace listing';
    const action = formData.get('action') as string || 'analyze'; // 'analyze', 'refine', or 'poster'
    const productDetailsString = formData.get('productDetails') as string;
    
    let productDetails = null;
    if (productDetailsString) {
      try {
        productDetails = JSON.parse(productDetailsString);
      } catch (e) {
        console.error('Failed to parse product details:', e);
      }
    }

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Convert file to base64 for the image analyzer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const mimeType = imageFile.type;
    const imageData = `data:${mimeType};base64,${base64Image}`;

    let result;
    
    switch (action) {
      case 'refine':
        result = await imageAnalyzer.getImageRefinementSuggestions(imageData);
        break;
      case 'poster':
        result = await imageAnalyzer.generateSocialMediaPoster(imageData, productDetails);
        break;
      case 'analyze':
      default:
        result = await imageAnalyzer.execute({ imageData, prompt, action: 'analyze' });
        break;
    }
    
    console.log('MCP Image API result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      success: result.success,
      content: result.success 
        ? ('result' in result && result.result?.analysis ? result.result.analysis : 'Poster generated successfully!') 
        : ('error' in result ? result.error : 'Analysis failed'),
      error: !result.success && 'error' in result ? result.error : undefined,
      imageData: result.success && 'result' in result && result.result?.poster 
        ? (
            'imageData' in result.result.poster 
              ? result.result.poster.imageData 
              : ('imageUrl' in result.result.poster ? result.result.poster.imageUrl : undefined)
          )
        : undefined,
      tool: 'Image Analyzer',
      processingTime: result.timestamp,
      intent: action,
      poster: result.success && 'result' in result ? result.result?.poster : undefined
    });
  } catch (error) {
    console.error('Image analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
