import { NextRequest, NextResponse } from 'next/server';
import { MarketingGeneratorTool } from '@/lib/mcp-tools/marketing-generator';

const marketingGenerator = new MarketingGeneratorTool();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productData, platform, imageData, prompt, target_audience } = body;

    // Handle both productData format and simple prompt format
    let finalProductData;
    
    if (productData) {
      // Direct productData provided
      finalProductData = productData;
    } else if (prompt) {
      // Convert prompt to productData format
      finalProductData = {
        name: prompt,
        description: prompt,
        category: 'artisan_craft',
        prompt: prompt
      };
    } else {
      return NextResponse.json(
        { error: 'Either productData or prompt is required' },
        { status: 400 }
      );
    }

    const result = await marketingGenerator.execute({ 
      productData: finalProductData, 
      platform: platform || 'multi-platform', 
      imageData 
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Marketing generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
