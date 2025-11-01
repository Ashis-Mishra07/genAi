'use client';

import { useTranslation } from '@/lib/i18n/hooks';
import { MessageCircle, Mic, Send, X, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { t, currentLocale } = useTranslation();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: getWelcomeMessage(currentLocale),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [currentLocale]);

  const getWelcomeMessage = (locale: string) => {
    const welcomeMessages: Record<string, string> = {
      en: `🙏 Namaste! I'm your AI assistant here to help you with your artisan business.

I can help you with:
📦 **Product Management** - Check your products, sales, and inventory
📊 **Business Analytics** - View your sales, orders, and performance
💰 **Financial Information** - Track earnings and payment details
📝 **Order Management** - Check customer orders and their status
❓ **General Questions** - Answer any questions about your business

Feel free to ask me anything in your preferred language!`,
      hi: `🙏 नमस्ते! मैं आपका AI सहायक हूं और आपके कारीगर व्यवसाय में मदद के लिए यहां हूं।

मैं आपकी मदद कर सकता हूं:
📦 **उत्पाद प्रबंधन** - अपने उत्पाद, बिक्री और इन्वेंटरी देखें
📊 **व्यापार विश्लेषण** - अपनी बिक्री, ऑर्डर और प्रदर्शन देखें
💰 **वित्तीय जानकारी** - कमाई और भुगतान विवरण ट्रैक करें
📝 **ऑर्डर प्रबंधन** - ग्राहक ऑर्डर और उनकी स्थिति जांचें
❓ **सामान्य प्रश्न** - आपके व्यवसाय के बारे में कोई भी प्रश्न का उत्तर दें

अपनी पसंदीदा भाषा में मुझसे कुछ भी पूछने के लिए स्वतंत्र महसूस करें!`,
      bn: `🙏 নমস্কার! আমি আপনার AI সহায়ক এবং আপনার কারুশিল্প ব্যবসায়ে সাহায্য করতে এখানে আছি।

আমি আপনাকে সাহায্য করতে পারি:
📦 **পণ্য ব্যবস্থাপনা** - আপনার পণ্য, বিক্রয় এবং ইনভেন্টরি দেখুন
📊 **ব্যবসায়িক বিশ্লেষণ** - আপনার বিক্রয়, অর্ডার এবং কর্মক্ষমতা দেখুন
💰 **আর্থিক তথ্য** - আয় এবং পেমেন্ট বিবরণ ট্র্যাক করুন
📝 **অর্ডার ব্যবস্থাপনা** - গ্রাহক অর্ডার এবং তাদের স্থিতি চেক করুন
❓ **সাধারণ প্রশ্ন** - আপনার ব্যবসা সম্পর্কে যেকোনো প্রশ্নের উত্তর দিন

আপনার পছন্দের ভাষায় আমাকে যেকোনো কিছু জিজ্ঞাসা করতে নির্দ্বিধায়!`,
      te: `🙏 నమస్కారం! నేను మీ AI సహాయకుడిని మరియు మీ కళాకారుల వ్యాపారంలో సహాయం చేయడానికి ఇక్కడ ఉన్నాను।

నేను మీకు సహాయం చేయగలను:
📦 **ఉత్పత్తి నిర్వహణ** - మీ ఉత్పత్తులు, అమ్మకాలు మరియు ఇన్వెంటరీని చూడండి
📊 **వ్యాపార విశ్లేషణ** - మీ అమ్మకాలు, ఆర్డర్లు మరియు పనితీరును చూడండి
💰 **ఆర్థిక సమాచారం** - ఆదాయం మరియు చెల్లింపు వివరాలను ట్రాక్ చేయండి
📝 **ఆర్డర్ నిర్వహణ** - కస్టమర్ ఆర్డర్లు మరియు వాటి స్థితిని తనిఖీ చేయండి
❓ **సాధారణ ప్రశ్నలు** - మీ వ్యాపారం గురించి ఏదైనా ప్రశ్నకు సమాధానం

మీకు ఇష్టమైన భాషలో నన్ను ఏదైనా అడగడానికి సంకోచించకండి!`,
      ta: `🙏 வணக்கம்! நான் உங்கள் AI உதவியாளர், உங்கள் கைவினைஞர் வணிகத்திற்கு உதவ இங்கே இருக்கிறேன்।

நான் உங்களுக்கு உதவ முடியும்:
📦 **தயாரிப்பு நிர்வாகம்** - உங்கள் தயாரிப்புகள், விற்பனை மற்றும் சரக்குகளைப் பார்க்கவும்
📊 **வணிக பகுப்பாய்வு** - உங்கள் விற்பனை, ஆர்டர்கள் மற்றும் செயல்திறனைப் பார்க்கவும்
💰 **நிதி தகவல்** - வருமானம் மற்றும் பணம் செலுத்தும் விவரங்களைக் கண்காணிக்கவும்
📝 **ஆர்டர் நிர்வாகம்** - வாடிக்கையாளர் ஆர்டர்களையும் அவற்றின் நிலையையும் சரிபார்க்கவும்
❓ **பொது கேள்விகள்** - உங்கள் வணிகம் பற்றிய எந்த கேள்விக்கும் பதிலளிக்கவும்

உங்கள் விருப்பமான மொழியில் என்னிடம் எதையும் கேட்க தயங்க வேண்டாம்!`,
      ml: `🙏 നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI സഹായകനാണ്, നിങ്ങളുടെ കരകൗശല ബിസിനസിനെ സഹായിക്കാൻ ഇവിടെയുണ്ട്।

എനിക്ക് നിങ്ങളെ സഹായിക്കാം:
📦 **ഉൽപ്പന്ന നിർവഹണം** - നിങ്ങളുടെ ഉൽപ്പന്നങ്ങൾ, വിൽപ്പന, ഇൻവെന്ററി കാണുക
📊 **ബിസിനസ് അനാലിറ്റിക്സ്** - നിങ്ങളുടെ വിൽപ്പന, ഓർഡറുകൾ, പ്രകടനം കാണുക
💰 **സാമ്പത്തിക വിവരം** - വരുമാനവും പേയ്മെന്റ് വിശദാംശങ്ങളും ട്രാക്ക് ചെയ്യുക
📝 **ഓർഡർ മാനേജ്മെന്റ്** - ഉപഭോക്തൃ ഓർഡറുകളും അവയുടെ നിലയും പരിശോധിക്കുക
❓ **പൊതു ചോദ്യങ്ങൾ** - നിങ്ങളുടെ ബിസിനസിനെക്കുറിച്ചുള്ള ഏത് ചോദ്യത്തിനും ഉത്തരം

നിങ്ങളുടെ ഇഷ്ട ഭാഷയിൽ എന്തും എന്നോട് ചോദിക്കാൻ മടിക്കേണ്ടതില്ല!`,
      kn: `🙏 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ ಮತ್ತು ನಿಮ್ಮ ಕರಕೌಶಲ ವ್ಯವಹಾರಕ್ಕೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ।

ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು:
📦 **ಉತ್ಪನ್ನ ನಿರ್ವಹಣೆ** - ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳು, ಮಾರಾಟ ಮತ್ತು ದಾಸ್ತಾನು ನೋಡಿ
📊 **ವ್ಯಾಪಾರ ವಿಶ್ಲೇಷಣೆ** - ನಿಮ್ಮ ಮಾರಾಟ, ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ಷಮತೆ ನೋಡಿ
💰 **ಹಣಕಾಸಿನ ಮಾಹಿತಿ** - ಆದಾಯ ಮತ್ತು ಪಾವತಿ ವಿವರಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ
📝 **ಆರ್ಡರ್ ನಿರ್ವಹಣೆ** - ಗ್ರಾಹಕ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಅವುಗಳ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ
❓ **ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು** - ನಿಮ್ಮ ವ್ಯವಹಾರದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಿ

ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ನನ್ನನ್ನು ಏನು ಬೇಕಾದರೂ ಕೇಳಲು ಮುಕ್ತವಾಗಿರಿ!`,
      gu: `🙏 નમસ્તે! હું તમારો AI સહાયક છું અને તમારા કારીગર વ્યવસાયમાં મદદ કરવા માટે અહીં છું।

હું તમને મદદ કરી શકું છું:
📦 **ઉત્પાદન વ્યવસ્થાપન** - તમારા ઉત્પાદનો, વેચાણ અને ઇન્વેન્ટરી જુઓ
📊 **વ્યાપાર વિશ્લેષણ** - તમારું વેચાણ, ઓર્ડર અને પ્રદર્શન જુઓ
💰 **નાણાકીય માહિતી** - કમાણી અને ચુકવણી વિગતો ટ્રેક કરો
📝 **ઓર્ડર વ્યવસ્થાપન** - ગ્રાહક ઓર્ડર અને તેમની સ્થિતિ તપાસો
❓ **સામાન્ય પ્રશ્નો** - તમારા વ્યવસાય વિશે કોઈપણ પ્રશ્નનો જવાબ આપો

તમારી પસંદની ભાષામાં મને કંઈપણ પૂછવા માટે નિઃસંકોચ!`,
      mr: `🙏 नमस्कार! मी तुमचा AI सहाय्यक आहे आणि तुमच्या कारागीर व्यवसायात मदत करण्यासाठी येथे आहे।

मी तुम्हाला मदत करू शकतो:
📦 **उत्पादन व्यवस्थापन** - तुमची उत्पादने, विक्री आणि इन्व्हेंटरी पहा
📊 **व्यवसाय विश्लेषण** - तुमची विक्री, ऑर्डर आणि कामगिरी पहा
💰 **आर्थिक माहिती** - कमाई आणि पेमेंट तपशील ट्रॅक करा
📝 **ऑर्डर व्यवस्थापन** - ग्राहक ऑर्डर आणि त्यांची स्थिती तपासा
❓ **सामान्य प्रश्न** - तुमच्या व्यवसायाबद्दल कोणत्याही प्रश्नाचे उत्तर द्या

तुमच्या आवडत्या भाषेत मला काहीही विचारण्यास मोकळे व्हा!`,
      or: `🙏 ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର AI ସହାୟକ ଏବଂ ଆପଣଙ୍କ କାରୁଶିଳ୍ପୀ ବ୍ୟବସାୟରେ ସାହାଯ୍ୟ କରିବାକୁ ଏଠାରେ ଅଛି।

ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି:
📦 **ଉତ୍ପାଦ ପରିଚାଳନା** - ଆପଣଙ୍କ ଉତ୍ପାଦ, ବିକ୍ରୟ ଏବଂ ଇନ୍‌ଭେଣ୍ଟରି ଦେଖନ୍ତୁ
📊 **ବ୍ୟବସାୟ ବିଶ୍ଳେଷଣ** - ଆପଣଙ୍କ ବିକ୍ରୟ, ଅର୍ଡର ଏବଂ ପ୍ରଦର୍ଶନ ଦେଖନ୍ତୁ
💰 **ଆର୍ଥିକ ସୂଚନା** - ଆୟ ଏବଂ ପେମେଣ୍ଟ ବିବରଣୀ ଟ୍ରାକ କରନ୍ତୁ
📝 **ଅର୍ଡର ପରିଚାଳନା** - ଗ୍ରାହକ ଅର୍ଡର ଏବଂ ସେମାନଙ୍କ ସ୍ଥିତି ଯାଞ୍ଚ କରନ୍ତୁ
❓ **ସାଧାରଣ ପ୍ରଶ୍ନ** - ଆପଣଙ୍କ ବ୍ୟବସାୟ ବିଷୟରେ ଯେକୌଣସି ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଅନ୍ତୁ

ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷାରେ ମୋତେ କିଛି ପୂଛିବାକୁ ମୁକ୍ତ ଅନୁଭବ କରନ୍ତୁ!`,
    };
    return welcomeMessages[locale] || welcomeMessages.en;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/artisan/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          message: inputValue,
          language: currentLocale,
          conversationHistory: messages.slice(-5).map((msg) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.content || 'I apologize, I could not process your request.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Format markdown text to HTML-like JSX
  const formatMessage = (text: string) => {
    // Split by lines to handle each line separately
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-base font-bold mt-3 mb-2 text-orange-300">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-lg font-bold mt-3 mb-2 text-orange-300">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-xl font-bold mt-3 mb-2 text-orange-300">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Handle bullet points
      if (line.match(/^[•\-\*]\s/)) {
        const content = line.replace(/^[•\-\*]\s/, '');
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1">
            <span className="text-orange-400 mt-1">•</span>
            <span className="flex-1">{formatInlineText(content)}</span>
          </div>
        );
      }

      // Handle numbered lists
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^(\d+)\.\s(.+)/);
        if (match) {
          return (
            <div key={lineIndex} className="flex items-start gap-2 my-1">
              <span className="text-orange-400 font-semibold">{match[1]}.</span>
              <span className="flex-1">{formatInlineText(match[2])}</span>
            </div>
          );
        }
      }

      // Handle emoji lines (like 📦, 💰, etc.)
      if (line.match(/^[📦💰📊📝❓🎨🌍🎤💬🙏✨]/)) {
        return (
          <div key={lineIndex} className="my-2">
            {formatInlineText(line)}
          </div>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }

      // Regular paragraphs
      return (
        <p key={lineIndex} className="my-1">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Match **bold**, *italic*, `code`, and emojis
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|[📦💰📊📝❓🎨🌍🎤💬🙏✨🔔📱🎯🚀⚡️✅❌🌟💡🎉])/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      const matchedText = match[0];
      
      // Bold text **text**
      if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-orange-300">
            {matchedText.slice(2, -2)}
          </strong>
        );
      }
      // Italic text *text*
      else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-orange-200">
            {matchedText.slice(1, -1)}
          </em>
        );
      }
      // Code text `code`
      else if (matchedText.startsWith('`') && matchedText.endsWith('`')) {
        parts.push(
          <code key={match.index} className="bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono text-orange-300">
            {matchedText.slice(1, -1)}
          </code>
        );
      }
      // Emoji
      else {
        parts.push(
          <span key={match.index} className="text-lg">
            {matchedText}
          </span>
        );
      }

      currentIndex = match.index + matchedText.length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    // Add a loading message
    const loadingMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Processing your voice message...',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', currentLocale);

      const response = await fetch('/api/artisan/chatbot/voice', {
        method: 'POST',
        headers: {
          // No Content-Type header - browser sets it automatically for FormData
        },
        credentials: 'include', // Include cookies for authentication
        body: formData,
      });

      const data = await response.json();

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));

      if (data.success && data.transcription) {
        // Add transcribed message as user message
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          content: `🎤 ${data.transcription}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Add assistant response
        if (data.response) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } else {
        throw new Error(data.error || 'Failed to process voice');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I could not process your voice message. Please try typing instead.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 animate-bounce"
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-8 h-8 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-600 to-orange-500 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">AI Assistant</h3>
                <p className="text-xs text-orange-100">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-orange-600/50 p-1.5 rounded-lg transition-colors"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-orange-600/50 p-1.5 rounded-lg transition-colors"
                aria-label="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                          : 'bg-slate-700 text-slate-100 shadow-lg border border-slate-600'
                      } ${message.isLoading ? 'animate-pulse' : ''}`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.type === 'user' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="space-y-1">{formatMessage(message.content)}</div>
                        )}
                      </div>
                      <span className="text-xs opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString(currentLocale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-slate-100 p-3 rounded-2xl flex items-center gap-2 shadow-lg border border-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                      <span className="text-sm text-slate-300">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <button
                    type="button"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`flex-shrink-0 p-3 rounded-xl transition-all shadow-md ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/50'
                        : 'bg-slate-700 hover:bg-slate-600 hover:shadow-slate-600/50'
                    } text-white`}
                    aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t('search') || 'Type your message...'}
                    className="flex-1 px-4 py-3 bg-slate-700/80 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-100 placeholder-slate-400 transition-all"
                    disabled={isLoading || isRecording}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim() || isRecording}
                    className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-orange-400/40 hover:scale-105 active:scale-95"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.8);
        }
      `}</style>
    </>
  );
}
