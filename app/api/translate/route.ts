import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang } = await request.json();
    
    console.log('Translation API called:', { text, targetLang });
    
    if (!text || targetLang === 'en') {
      console.log('Translation API: Early return for English request');
      return NextResponse.json({ translatedText: text });
    }

    // Map our locale codes to Google Translate language codes
    const languageCodeMap: Record<string, string> = {
      'hi': 'hi', // Hindi
      'bn': 'bn', // Bengali
      'te': 'te', // Telugu
      'ta': 'ta', // Tamil
      'ml': 'ml', // Malayalam
      'kn': 'kn', // Kannada
      'gu': 'gu', // Gujarati
      'mr': 'mr', // Marathi
      'or': 'or'  // Odia
    };

    const googleLangCode = languageCodeMap[targetLang];
    if (!googleLangCode) {
      console.log('Translation API: Unsupported language code:', targetLang);
      return NextResponse.json({ translatedText: text });
    }

    // Option 1: Google Translate (Free but limited)
    try {
      console.log(`Attempting Google Translate to ${googleLangCode}...`);
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${googleLangCode}&dt=t&q=${encodeURIComponent(text)}`);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        const translatedText = data[0][0][0];
        console.log(`Google Translate: "${text}" -> "${translatedText}"`);
        return NextResponse.json({ translatedText });
      }
    } catch (googleError) {
      console.error('Google Translate error:', googleError);
    }

    // Option 2: MyMemory Translation API (Free) - Limited language support
    if (['hi', 'bn', 'te', 'ta', 'gu', 'mr'].includes(targetLang)) {
      try {
        console.log('Attempting MyMemory Translate...');
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${googleLangCode}`);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
          const translatedText = data.responseData.translatedText;
          console.log(`MyMemory: "${text}" -> "${translatedText}"`);
          return NextResponse.json({ translatedText });
        }
      } catch (mymemoryError) {
        console.error('MyMemory Translate error:', mymemoryError);
      }
    }

    // Option 3: LibreTranslate (Free, open source) - Limited language support
    if (['hi', 'bn', 'te', 'ta', 'gu', 'mr'].includes(targetLang)) {
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
            target: googleLangCode,
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
    }

    console.log(`All translation services failed for "${text}" to ${targetLang}, returning original text`);
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
    supportedLanguages: ["en", "hi", "bn", "te", "ta", "ml", "kn", "gu", "mr", "or"],
    translationServices: ["Google Translate", "MyMemory", "LibreTranslate"]
  });
}