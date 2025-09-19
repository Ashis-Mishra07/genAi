import { NextRequest, NextResponse } from 'next/server';
import { PricingAnalyzerTool } from '@/lib/mcp-tools/pricing-analyzer';

const pricingAnalyzer = new PricingAnalyzerTool();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productData, category, userPrice } = body;

    if (!productData || !category) {
      return NextResponse.json(
        { error: 'Product data and category are required' },
        { status: 400 }
      );
    }

    const result = await pricingAnalyzer.execute({ productData, category, userPrice });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Pricing analysis API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region') || 'global';

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const result = await pricingAnalyzer.getMarketInsights(category, region);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Market insights API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
