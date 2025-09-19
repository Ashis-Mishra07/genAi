import { NextRequest, NextResponse } from 'next/server';
import { ContentGeneratorTool } from '@/lib/mcp-tools/content-generator';

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

    const result = await contentGenerator.execute({ 
      type: finalType, 
      input: finalInput, 
      context 
    });
    
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
