import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '../../../../lib/db/products-neon';
import { getCache, setCache } from '../../../../lib/redis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Product IDs array is required' },
        { status: 400 }
      );
    }

    const heavyDataResults = [];

    for (const productId of productIds) {
      const cacheKey = `product:heavy:${productId}`;
      
      try {
        // Try cache first
        const cachedHeavyData = await getCache(cacheKey);
        if (cachedHeavyData) {
          heavyDataResults.push(cachedHeavyData);
          continue;
        }
      } catch (cacheError) {
        console.log(`Heavy data cache miss for product ${productId}`);
      }

      // Fetch from database
      const product = await getProductById(productId);
      if (product) {
        const heavyData = {
          id: product.id,
          imageUrl: product.imageUrl,
          description: product.description,
          story: product.story,
          // Add any other heavy fields
        };

        // Cache the heavy data for 30 minutes
        try {
          await setCache(cacheKey, heavyData, 1800);
        } catch (cacheError) {
          console.log(`Failed to cache heavy data for product ${productId}`);
        }

        heavyDataResults.push(heavyData);
      }
    }

    return NextResponse.json({
      success: true,
      heavyData: heavyDataResults
    });
  } catch (error: any) {
    console.error('Heavy data API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch heavy product data',
        details: error.message
      },
      { status: 500 }
    );
  }
}
