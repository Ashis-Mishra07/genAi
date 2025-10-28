import { NextRequest, NextResponse } from 'next/server';
import { PricingAnalyzerTool } from '@/lib/mcp-tools/pricing-analyzer';
import { getCache, setCache } from '@/lib/redis';

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

    // Create cache key for market insights
    const cacheKey = `pricing:insights:${category}:${region}`;
    
    // Try to get from cache first
    try {
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        console.log(`Pricing Insights: Cache hit for key: ${cacheKey}`);
        return NextResponse.json(cachedResult);
      }
    } catch (cacheError) {
      console.log('Pricing Insights: Cache retrieval failed, continuing with fresh analysis');
    }

    const result = await pricingAnalyzer.getMarketInsights(category, region);
    
    // Cache the result for 30 minutes (market insights don't change frequently)
    try {
      await setCache(cacheKey, result, 1800); // 30 minutes
      console.log(`Pricing Insights: Cached result for key: ${cacheKey}`);
    } catch (cacheError) {
      console.log('Pricing Insights: Failed to cache result, continuing without cache');
    }
    
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
