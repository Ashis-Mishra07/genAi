import { NextRequest, NextResponse } from 'next/server';
import { ContentGeneratorTool } from '@/lib/mcp-tools/content-generator';
import { getCache, setCache } from '@/lib/redis';

const contentGenerator = new ContentGeneratorTool();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, input, context, prompt } = body;

    // Handle both direct input and prompt formats
    let finalType = type;
    let finalInput = input;
    
    if (!type && !input && prompt) {
      // Convert prompt format to expected format
      finalType = 'cultural_story';
      finalInput = {
        productDescription: prompt,
        prompt: prompt
      };
    } else if (prompt && type) {
      // Use provided type with prompt as input
      finalType = type;
      finalInput = {
        productDescription: prompt,
        prompt: prompt
      };
    } else if (!finalType || !finalInput) {
      return NextResponse.json(
        { error: 'Either (type and input) or prompt is required' },
        { status: 400 }
      );
    }

    // Create cache key based on content type and input hash
    const inputString = JSON.stringify({ type: finalType, input: finalInput, context });
    const inputHash = Buffer.from(inputString).toString('base64').substring(0, 50);
    const cacheKey = `content:${finalType}:${inputHash}`;
    
    // Try to get from cache first (content generation can be expensive)
    try {
      const cachedResult = await getCache(cacheKey);
      if (cachedResult) {
        console.log(`Content Generation: Cache hit for key: ${cacheKey}`);
        return NextResponse.json(cachedResult);
      }
    } catch (cacheError) {
      console.log('Content Generation: Cache retrieval failed, continuing with fresh generation');
    }

    const result = await contentGenerator.execute({ 
      type: finalType, 
      input: finalInput, 
      context 
    });
    
    // Cache the result for 1 hour (generated content is relatively stable)
    try {
      await setCache(cacheKey, result, 3600); // 1 hour
      console.log(`Content Generation: Cached result for key: ${cacheKey}`);
    } catch (cacheError) {
      console.log('Content Generation: Failed to cache result, continuing without cache');
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Content generation API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
