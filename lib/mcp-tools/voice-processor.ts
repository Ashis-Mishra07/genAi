import OpenAI from 'openai';

export class VoiceProcessorTool {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async execute(args: { audioData: string; language?: string }) {
    try {
      const { audioData, language = 'auto' } = args;
      
      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // Create a file-like object for Whisper
      const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });
      
      // Transcribe using Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: language === 'auto' ? undefined : language,
      });

      // Translate to English if not already in English
      let translation = null;
      if (language !== 'en' && transcription.text) {
        translation = await this.translateText(transcription.text, 'en');
      }

      return {
        success: true,
        transcription: transcription.text,
        translation: translation?.translation || null,
        language: language,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async translateText(text: string, targetLanguage: string = 'en') {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return {
        success: true,
        translation: completion.choices[0].message.content,
        originalText: text,
        targetLanguage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Translation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}
