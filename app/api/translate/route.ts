import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();
    
    console.log('Translation API called:', { text, targetLang });
    
    if (!text || targetLang !== 'hi') {
      console.log('Translation API: Early return for non-Hindi request');
      return NextResponse.json({ translatedText: text });
    }

    // Option 1: Google Translate (Free but limited)
    try {
      console.log('Attempting Google Translate...');
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translatedText = data[0][0][0];
        console.log(`Google Translate: "${text}" -> "${translatedText}"`);
        return NextResponse.json({ translatedText });
      }
    } catch (googleError) {
      console.error('Google Translate error:', googleError);
    }

    // Option 2: MyMemory Translation API (Free)
    try {
      console.log('Attempting MyMemory Translate...');
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`);
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        console.log(`MyMemory: "${text}" -> "${translatedText}"`);
        return NextResponse.json({ translatedText });
      }
    } catch (mymemoryError) {
      console.error('MyMemory Translate error:', mymemoryError);
    }

    // Option 3: LibreTranslate (Free, open source)
    try {
      console.log('Attempting LibreTranslate...');
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'hi',
          format: 'text'
        })
      });
      
      const data = await response.json();
      if (data && data.translatedText) {
        const translatedText = data.translatedText;
        console.log(`LibreTranslate: "${text}" -> "${translatedText}"`);
        return NextResponse.json({ translatedText });
      }
    } catch (libreError) {
      console.error('LibreTranslate error:', libreError);
    }

    console.log(`All translation services failed for "${text}", returning original text`);
    // Fallback: return original text if all translation services fail
    return NextResponse.json({ translatedText: text });
    
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ translatedText: '' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Dynamic Translation API is working",
    supportedLanguages: ["en", "hi"],
    translationServices: ["Google Translate", "MyMemory", "LibreTranslate"]
  });
}