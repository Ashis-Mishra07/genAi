import { NextRequest, NextResponse } from 'next/server';
import { VoiceProcessorTool } from '@/lib/mcp-tools/voice-processor';

const voiceProcessor = new VoiceProcessorTool();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'auto';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Convert file to base64 for the voice processor
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Audio = buffer.toString('base64');
    const mimeType = audioFile.type;
    const audioData = `data:${mimeType};base64,${base64Audio}`;

    const result = await voiceProcessor.execute({ audioData, language });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Voice processing API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
