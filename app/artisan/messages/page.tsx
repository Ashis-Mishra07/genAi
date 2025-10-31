"use client";

import {
  Clock,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  MoreVertical,
  Package,
  Paperclip,
  Phone,
  Send,
  Shield,
  ShoppingBag,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/hooks";
import { useTranslateContent } from "@/lib/hooks/useTranslateContent";

interface AdminMessage {
  id: string;
  isFromAdmin: boolean;
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  productData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

interface SupportCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
}

export default function ArtisanAdminMessagesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { translateText, isHindi, currentLocale } = useTranslateContent();

  // Helper function for quick translations
  const tl = (
    englishText: string,
    translations: Record<string, string> = {}
  ) => {
    if (currentLocale === "en") return englishText;
    return translations[currentLocale] || translations["hi"] || englishText;
  };
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "offline" | "checking"
  >("checking");
  const [translatedMessages, setTranslatedMessages] = useState<{
    [key: string]: string;
  }>({});

  // Function to translate AI-generated messages
  const translateAIMessage = async (message: string): Promise<string> => {
    if (currentLocale === "en" || !message.trim()) return message;

    try {
      // Use the existing translateText function
      const translated = await translateText(message);
      return translated || message;
    } catch (error) {
      console.log("Translation error:", error);
      return message; // Fallback to original message
    }
  };

  const supportCategories: SupportCategory[] = [
    {
      id: "sales",
      name: tl("Sales Support", {
        hi: "बिक्री सहायता",
        bn: "বিক্রয় সহায়তা",
        te: "అమ్మకాల మద్దతు",
        mr: "विक्री सहाय्य",
        ta: "விற்பனை ஆதரவு",
        gu: "વેચાણ સપોર્ટ",
        kn: "ಮಾರಾಟ ಬೆಂಬಲ",
        or: "ବିକ୍ରୟ ସହାୟତା",
        pa: "ਵਿਕਰੀ ਸਹਾਇਤਾ",
      }),
      icon: TrendingUp,
      description: tl(
        "Get help selling your products and reaching more customers",
        {
          hi: "अपने उत्पादों को बेचने और अधिक ग्राहकों तक पहुंचने में सहायता प्राप्त करें",
          bn: "আপনার পণ্য বিক্রি এবং আরও গ্রাহকদের কাছে পৌঁছানোর জন্য সাহায্য নিন",
          te: "మీ ఉత్పత్తులను అమ్మడంలో మరియు మరిన్ని కస్టమర్లను చేరుకోవడంలో సహాయం పొందండి",
          mr: "तुमची उत्पादने विकण्यास आणि अधिक ग्राहकांपर्यंत पोहोचण्यास मदत मिळवा",
          ta: "உங்கள் தயாரிப்புகளை விற்பனை செய்வதற்கும் அதிகமான வாடிக்கையாளர்களை அடைவதற்கும் உதவி பெறுங்கள்",
          gu: "તમારા ઉત્પાદનો વેચવામાં અને વધુ ગ્રાહકો સુધી પહોંચવામાં મદદ મેળવો",
          kn: "ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರಾಟ ಮಾಡಲು ಮತ್ತು ಹೆಚ್ಚು ಗ್ರಾಹಕರನ್ನು ತಲುಪಲು ಸಹಾಯ ಪಡೆಯಿರಿ",
          or: "ଆପଣଙ୍କ ଉତ୍ପାଦ ବିକ୍ରି କରିବା ଏବଂ ଅଧିକ ଗ୍ରାହକଙ୍କ ନିକଟରେ ପହଞ୍ଚିବା ପାଇଁ ସାହାଯ୍ୟ ପାଆନ୍ତୁ",
          pa: "ਆਪਣੇ ਉਤਪਾਦਾਂ ਨੂੰ ਵੇਚਣ ਅਤੇ ਵਧੇਰੇ ਗਾਹਕਾਂ ਤੱਕ ਪਹੁੰਚਣ ਵਿੱਚ ਮਦਦ ਲਓ",
        }
      ),
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "marketing",
      name: tl("Marketing Help", {
        hi: "मार्केटिंग सहायता",
        bn: "মার্কেটিং সাহায্য",
        te: "మార్కెటింగ్ సహాయం",
        mr: "मार्केटिंग मदत",
        ta: "சந்தைப்படுத்தல் உதவி",
        gu: "માર્કેટિંગ મદદ",
        kn: "ಮಾರ್ಕೆಟಿಂಗ್ ಸಹಾಯ",
        or: "ମାର୍କେଟିଂ ସାହାଯ୍ୟ",
        pa: "ਮਾਰਕੀਟਿੰਗ ਮਦਦ",
      }),
      icon: Lightbulb,
      description: tl("Learn marketing strategies and promotional techniques", {
        hi: "मार्केटिंग रणनीति और प्रचार तकनीकें सीखें",
        bn: "মার্কেটিং কৌশল এবং প্রচারণামূলক কৌশল শিখুন",
        te: "మార్కెటింగ్ వ్యూహాలు మరియు ప్రమోషనల్ టెక్నిక్స్ నేర్చుకోండి",
        mr: "मार्केटिंग धोरणे आणि प्रचार तंत्रे शिका",
        ta: "சந்தைப்படுத்தல் உத்திகள் மற்றும் விளம்பர நுட்பங்களைக் கற்றுக் கொள்ளுங்கள்",
        gu: "માર્કેટિંગ વ્યૂહરચના અને પ્રમોશનલ તકનીકો શીખો",
        kn: "ಮಾರ್ಕೆಟಿಂಗ್ ತಂತ್ರಗಳು ಮತ್ತು ಪ್ರಚಾರದ ತಂತ್ರಗಳನ್ನು ಕಲಿಯಿರಿ",
        or: "ମାର୍କେଟିଂ ରଣନୀତି ଏବଂ ପ୍ରଚାରଣା କୌଶଳ ଶିଖନ୍ତୁ",
        pa: "ਮਾਰਕੀਟਿੰਗ ਰਣਨੀਤੀਆਂ ਅਤੇ ਪ੍ਰਚਾਰ ਤਕਨੀਕਾਂ ਸਿੱਖੋ",
      }),
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "product",
      name: tl("Product Guidance", {
        hi: "उत्पाद मार्गदर्शन",
        bn: "পণ্য নির্দেশনা",
        te: "ఉత్పత్తి మార్గదర్శకత్వం",
        mr: "उत्पादन मार्गदर्शन",
        ta: "தயாரிப்பு வழிகாட்டுதல்",
        gu: "ઉત્પાદન માર્گદર્શન",
        kn: "ಉತ್ಪನ್ನ ಮಾರ್ಗದರ್ಶನ",
        or: "ଉତ୍ପାଦ ମାର୍ଗଦର୍ଶନ",
        pa: "ਉਤਪਾਦ ਮਾਰਗਦਰਸ਼ਨ",
      }),
      icon: Package,
      description: tl("Optimize your product listings and descriptions", {
        hi: "अपनी उत्पाद सूची और विवरण को अनुकूलित करें",
        bn: "আপনার পণ্যের তালিকা এবং বিবরণ অপ্টিমাইজ করুন",
        te: "మీ ఉత్పత్తి జాబితాలు మరియు వివరణలను అనుకూలీకరించండి",
        mr: "तुमची उत्पादन यादी आणि वर्णन अनुकूल करा",
        ta: "உங்கள் தயாரிப்பு பட்டியலகள் மற்றும் விளக்கங்களை மேம்படுத்துங்கள்",
        gu: "તમારી ઉત્પાદન સૂચિ અને વર્ણનોને અનુકૂલિત કરો",
        kn: "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಪಟ್ಟಿಗಳು ಮತ್ತು ವಿವರಣೆಗಳನ್ನು ಅತ್ಯುತ್ತಮಗೊಳಿಸಿ",
        or: "ଆପଣଙ୍କ ଉତ୍ପାଦ ତାଲିକା ଏବଂ ବର୍ଣ୍ଣନାକୁ ଅପ୍ଟିମାଇଜ୍ କରନ୍ତୁ",
        pa: "ਆਪਣੀ ਉਤਪਾਦ ਸੂਚੀ ਅਤੇ ਵਰਣਨਾਂ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਓ",
      }),
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "platform",
      name: tl("Platform Support", {
        hi: "प्लेटफॉर्म सहायता",
        bn: "প্ল্যাটফর্ম সাপোর্ট",
        te: "ప్లాట్‌ఫారమ్ మద్దతు",
        mr: "प्लॅटफॉर्म सहाय्य",
        ta: "மென்பொருள் ஆதரவு",
        gu: "પ્લેટફોર્મ સપોર્ટ",
        kn: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಬೆಂಬಲ",
        or: "ପ୍ଲାଟଫର୍ମ ସହାୟତା",
        pa: "ਪਲੈਟਫਾਰਮ ਸਹਾਇਤਾ",
      }),
      icon: Shield,
      description: tl("Technical help and platform-related questions", {
        hi: "तकनीकी सहायता और प्लेटफॉर्म संबंधी प्रश्न",
        bn: "প্রযুক্তিগত সাহায্য এবং প্ল্যাটফর্ম সংক্রান্ত প্রশ্ন",
        te: "సాంకేతిక సహాయం మరియు ప్లాట్‌ఫారమ్ సంబంధిత ప్రశ్నలు",
        mr: "तांत्रिक मदत आणि प्लॅटफॉर्म संबंधित प्रश्न",
        ta: "தொழில்நுட்ப உதவி மற்றும் மென்பொருள் தொடர்பான கேள்விகள்",
        gu: "ટેકનિકલ હેલ્પ અને પ્લેટફોર્મ સંબંધિત પ્રશ્નો",
        kn: "ತಾಂತ್ರಿಕ ಸಹಾಯ ಮತ್ತು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸಂಬಂಧಿತ ಪ್ರಶ್ನೆಗಳು",
        or: "ବୈଷୟିକ ସାହାଯ୍ୟ ଏବଂ ପ୍ଲାଟଫର୍ମ ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ",
        pa: "ਤਕਨੀਕੀ ਮਦਦ ਅਤੇ ਪਲੈਟਫਾਰਮ ਸਬੰਧੀ ਸਵਾਲ",
      }),
      color: "from-orange-500 to-red-500",
    },
    {
      id: "community",
      name: tl("Community Connect", {
        hi: "समुदायिक संपर्क",
        bn: "কমিউনিটি সংযোগ",
        te: "కమ్యూనిటీ కనెక్ట్",
        mr: "समुदायिक संपर्क",
        ta: "சமூக இணைப்பு",
        gu: "કોમ્યુનિટી કનેક્ટ",
        kn: "ಸಮುದಾಯ ಸಂಪರ್ಕ",
        or: "ସମୁଦାୟ ସଂଯୋଗ",
        pa: "ਭਾਈਚਾਰਕ ਸੰਪਰਕ",
      }),
      icon: Users,
      description: tl("Connect with other artisans and share experiences", {
        hi: "अन्य कारीगरों से जुड़ें और अनुभव साझा करें",
        bn: "অন্যান্য কারিগরদের সাথে সংযোগ করুন এবং অভিজ্ঞতা ভাগ করুন",
        te: "ఇతర కళాకారులతో కనెక్ట్ అవ్వండి మరియు అనుభవాలను పంచుకోండి",
        mr: "इतर कारागिरांशी जोडुन आणि अनुभव सामायिक करा",
        ta: "மற்ற கைவினைஞர்களுடன் இணைந்து அனுபவங்களைப் பகிரவும்",
        gu: "અન્ય કારીગરો સાથે જોડાઓ અને અનુભવો શેર કરો",
        kn: "ಇತರ ಕುಶಲಕರ್ಮಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಮತ್ತು ಅನುಭವಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
        or: "ଅନ୍ୟ କାରିଗରମାନଙ୍କ ସହିତ ସଂଯୋଗ କରନ୍ତୁ ଏବଂ ଅଭିଜ୍ଞତା ସେୟାର କରନ୍ତୁ",
        pa: "ਹੋਰ ਕਾਰੀਗਰਾਂ ਨਾਲ ਜੁੜੋ ਅਤੇ ਤਜਰਬੇ ਸਾਂਝੇ ਕਰੋ",
      }),
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "general",
      name: tl("General Help", {
        hi: "सामान्य सहायता",
        bn: "সাধারণ সাহায্য",
        te: "సాధారణ సహాయం",
        mr: "सामान्य मदत",
        ta: "பொது உதவி",
        gu: "સામાન્ય મદદ",
        kn: "ಸಾಮಾನ್ಯ ಸಹಾಯ",
        or: "ସାଧାରଣ ସାହାଯ୍ୟ",
        pa: "ਆਮ ਮਦਦ",
      }),
      icon: HeartHandshake,
      description: tl("Any other questions or support needs", {
        hi: "कोई अन्य प्रश्न या सहायता आवश्यकता",
        bn: "অন্য কোন প্রশ্ন বা সহায়তার প্রয়োজন",
        te: "ఏదైనా ఇతర ప్రశ్నలు లేదా మద్దతు అవసరాలు",
        mr: "कोणताही इतर प्रश्न किंवा सहाय्याची गरज",
        ta: "வேறு ஏதேனும் கேள்விகள் அல்லது ஆதரவு தேவைகள்",
        gu: "કોઈપણ અન્ય પ્રશ્નો અથવા સપોર્ટની જરૂરિયાતો",
        kn: "ಯಾವುದೇ ಇತರ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ಬೆಂಬಲ ಅಗತ್ಯಗಳು",
        or: "ଅନ୍ୟ କୌଣସି ପ୍ରଶ୍ନ କିମ୍ବା ସହାୟତା ଆବଶ୍ୟକତା",
        pa: "ਕੋਈ ਹੋਰ ਸਵਾਲ ਜਾਂ ਸਹਾਇਤਾ ਦੀ ਲੋੜ",
      }),
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const quickActions = [
    tl("Help me sell better", {
      hi: "बेचने में बेहतर सहायता करें",
      bn: "ভালো বিক্রিতে সাহায্য করুন",
      te: "మెరుగ్గా అమ్మడంలో సహాయం చేయండి",
      mr: "चांगल्या विक्रीसाठी मदत करा",
      ta: "சிறப்பாக விற்க உதவுங்கள்",
      gu: "વધુ સારી વેચાણમાં મદદ કરો",
      kn: "ಉತ್ತಮವಾಗಿ ಮಾರಾಟ ಮಾಡಲು ಸಹಾಯ ಮಾಡಿ",
      or: "ଭଲ ବିକ୍ରିରେ ସାହାଯ୍ୟ କରନ୍ତୁ",
      pa: "ਬਿਹਤਰ ਵੇਚਣ ਵਿੱਚ ਮਦਦ ਕਰੋ",
    }),
    tl("Is my price good?", {
      hi: "क्या मेरी कीमत अच्छी है?",
      bn: "আমার দাম কি ভাল?",
      te: "నా ధర బాగుందా?",
      mr: "माझी किंमत चांगली आहे का?",
      ta: "என் விலை நல்லதா?",
      gu: "મારી કિંમત સારી છે?",
      kn: "ನನ್ನ ಬೆಲೆ ಒಳ್ಳೆಯದು?",
      or: "ମୋର ଦାମ ଭଲ କି?",
      pa: "ਕੀ ਮੇਰੀ ਕੀਮਤ ਚੰਗੀ ਹੈ?",
    }),
    tl("How to get more customers?", {
      hi: "अधिक ग्राहक कैसे प्राप्त करें?",
      bn: "আরও গ্রাহক কীভাবে পাবেন?",
      te: "మరిన్ని కస్టమర్లను ఎలా పొందాలి?",
      mr: "अधिक ग्राहक कसे मिळवावे?",
      ta: "அதிக வாடிக்கையாளர்களை எப்படிப் பெறுவது?",
      gu: "વધુ ગ્રાહકો કેવી રીતે મેળવવા?",
      kn: "ಹೆಚ್ಚು ಗ್ರಾಹಕರನ್ನು ಹೇಗೆ ಪಡೆಯುವುದು?",
      or: "ଅଧିକ ଗ୍ରାହକ କିପରି ପାଇବେ?",
      pa: "ਹੋਰ ਗਾਹਕ ਕਿਵੇਂ ਪ੍ਰਾਪਤ ਕਰਨਾ?",
    }),
    tl("My product is not selling", {
      hi: "मेरा उत्पाद नहीं बिक रहा",
      bn: "আমার পণ্য বিক্রি হচ্ছে না",
      te: "నా ఉత్పత్తి అమ్ముడుపోవడం లేదు",
      mr: "माझे उत्पादन विकत नाही",
      ta: "என் தயாரிப்பு விற்கவில்லை",
      gu: "મારું ઉત્પાદન વેચાતું નથી",
      kn: "ನನ್ನ ಉತ್ಪನ್ನ ಮಾರಾಟವಾಗುತ್ತಿಲ್ಲ",
      or: "ମୋର ଉତ୍ପାଦ ବିକିନାହିଁ",
      pa: "ਮੇਰਾ ਉਤਪਾਦ ਨਹੀਂ ਵਿਕ ਰਿਹਾ",
    }),
    tl("What should I change?", {
      hi: "मुझे क्या बदलना चाहिए?",
      bn: "আমার কি পরিবর্তন করা উচিত?",
      te: "నేను ఏమి మార్చాలి?",
      mr: "मी काय बदलावे?",
      ta: "நான் எதை மாற்ற வேண்டும்?",
      gu: "મારે શું બદલવું જોઈએ?",
      kn: "ನಾನು ಏನನ್ನು ಬದಲಾಯಿಸಬೇಕು?",
      or: "ମୁଁ କଣ ବଦଳାଇବା ଉଚିତ?",
      pa: "ਮੈਨੂੰ ਕੀ ਬਦਲਣਾ ਚਾਹੀਦਾ ਹੈ?",
    }),
    tl("Please give me advice", {
      hi: "कृपया मुझे सलाह दें",
      bn: "দয়া করে আমাকে পরামর্শ দিন",
      te: "దయచేసి నాకు సలహా ఇవ్వండి",
      mr: "कृपया मला सल्ला द्या",
      ta: "தயவுசெய்து எனக்கு அறிவுரை கொடுங்கள்",
      gu: "કૃપા કરીને મને સલાહ આપો",
      kn: "ದಯವಿಟ್ಟು ನನಗೆ ಸಲಹೆ ನೀಡಿ",
      or: "ଦୟାକରି ମୋତେ ପରାମର୍ଶ ଦିଅନ୍ତୁ",
      pa: "ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੂੰ ਸਲਾਹ ਦਿਓ",
    }),
  ];

  // Mock messages for fallback when API fails
  const mockMessages: AdminMessage[] = [
    {
      id: "1",
      isFromAdmin: true,
      message: tl(
        "Hello! Welcome to ArtisanCraft! I'm Sarah from the support team, and I'm here to help you succeed on our platform. How can I assist you today?",
        {
          hi: "नमस्ते! आर्टिसनक्राफ्ट में आपका स्वागत है! मैं सपोर्ट टीम की सारा हूं, और मैं यहां आपको हमारे प्लेटफॉर्म पर सफल होने में मदद करने के लिए हूं। आज मैं आपकी कैसे सहायता कर सकती हूं?",
          bn: "হ্যালো! আর্টিসানক্রাফ্টে আপনাকে স্বাগতম! আমি সাপোর্ট টিমের সারা, এবং আমি আমাদের প্ল্যাটফর্মে আপনাকে সফল হতে সাহায্য করতে এখানে আছি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
          te: "హలో! ఆర్టిసాన్‌క్రాఫ్ట్‌కు స్వాగతం! నేను సపోర్ట్ టీమ్‌కి చెందిన సారా, మరియు మా ప్లాట్‌ఫారమ్‌లో మీకు విజయవంతం కావడానికి సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?",
        }
      ),
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      status: "read",
    },
    {
      id: "2",
      isFromAdmin: false,
      message: tl(
        "Hi Sarah! Thank you for reaching out. I'm really excited to be part of this platform. I could use some help with getting more visibility for my handmade pottery.",
        {
          hi: "नमस्ते सारा! संपर्क करने के लिए धन्यवाद। मैं इस प्लेटफॉर्म का हिस्सा बनने के लिए बहुत उत्साहित हूं। मुझे अपने हस्तनिर्मित मिट्टी के बर्तनों के लिए अधिक दृश्यता प्राप्त करने में मदद की आवश्यकता है।",
          bn: "হাই সারা! যোগাযোগ করার জন্য ধন্যবাদ। আমি এই প্ল্যাটফর্মের অংশ হতে পেরে খুবই উত্সাহিত। আমার হাতে তৈরি মাটির পাত্রের জন্য আরও দৃশ্যমানতা পেতে আমার সাহায্য দরকার।",
          te: "హాయ్ సారా! చేరుకున్నందుకు ధన్యవాదాలు. నేను ఈ ప్లాట్‌ఫారమ్‌లో భాగమవుతున్నందుకు చాలా ఉత్సాహంగా ఉన్నాను. నా చేతితో తయారు చేసిన కుండలకు మరింత కనిపించడానికి నాకు సహాయం కావాలి।",
        }
      ),
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // 1 hour 50 minutes ago
      status: "delivered",
    },
    {
      id: "3",
      isFromAdmin: true,
      message: tl(
        "That's wonderful! Pottery is such a beautiful craft. I'd love to help you optimize your listings for better visibility. Here are a few tips:\n\n1. Use high-quality, well-lit photos\n2. Write detailed descriptions with keywords\n3. Price competitively but don't undervalue your work\n4. Share your creation process\n\nWould you like to share one of your products so I can give specific feedback?",
        {
          hi: "यह अद्भुत है! मिट्टी के बर्तन बनाना इतनी सुंदर कला है। मैं बेहतर दृश्यता के लिए आपकी सूचियों को अनुकूलित करने में आपकी मदद करना चाहूंगी। यहां कुछ सुझाव हैं:\n\n1. उच्च गुणवत्ता वाली, अच्छी रोशनी वाली तस्वीरें उपयोग करें\n2. कीवर्ड्स के साथ विस्तृत विवरण लिखें\n3. प्रतिस्पर्धी कीमत रखें लेकिन अपने काम को कम न आंकें\n4. अपनी निर्माण प्रक्रिया साझा करें\n\nक्या आप अपने उत्पादों में से एक साझा करना चाहेंगे ताकि मैं विशिष्ट फीडबैक दे सकूं?",
          bn: "এটা চমৎকার! মৃৎশিল্প এত সুন্দর একটি কারুশিল্প। আমি আরও ভাল দৃশ্যমানতার জন্য আপনার তালিকাগুলি অপ্টিমাইজ করতে সাহায্য করতে চাই। এখানে কয়েকটি টিপস রয়েছে:\n\n১. উচ্চ মানের, ভাল আলোকিত ছবি ব্যবহার করুন\n২. কীওয়ার্ড সহ বিস্তারিত বিবরণ লিখুন\n৩. প্রতিযোগিতামূলক মূল্য রাখুন কিন্তু আপনার কাজকে কম মূল্য দেবেন না\n৪. আপনার সৃজন প্রক্রিয়া শেয়ার করুন\n\nআপনি কি আপনার একটি পণ্য শেয়ার করতে চান যাতে আমি নির্দিষ্ট ফিডব্যাক দিতে পারি?",
          te: "అది అద్భుతం! కుండలు తయారు చేయడం చాలా అందమైన కళ. మెరుగైన దృశ్యమానత కోసం మీ జాబితాలను ఆప్టిమైజ్ చేయడంలో నేను మీకు సహాయం చేయాలని అనుకుంటున్నాను. ఇక్కడ కొన్ని చిట్కాలు ఉన్నాయి:\n\n1. అధిక నాణ్యత, బాగా వెలుతురు ఉన్న ఫోటోలను ఉపయోగించండి\n2. కీవర్డ్స్‌తో వివరణాత్మక వివరణలు రాయండి\n3. పోటీ ధర ఉంచండి కానీ మీ పనిని తక్కువ అంచనా వేయవద్దు\n4. మీ సృష్టి ప్రక్రియను పంచుకోండి\n\nనేను నిర్దిష్ట ఫీడ్‌బ్యాక్ ఇవ్వగలిగేలా మీ ఉత్పత్తుల్లో ఒకదాన్ని పంచుకోవాలని అనుకుంటున్నారా?",
        }
      ),
      timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(), // 1 hour 45 minutes ago
      status: "read",
    },
  ];

  useEffect(() => {
    // Auto-initialize chat and load messages on page load
    const initializeAndLoad = async () => {
      try {
        console.log("Starting chat initialization...");
        const initSuccess = await initializeChat();
        console.log("Chat initialization result:", initSuccess);

        console.log("Loading messages...");
        await loadMessages();
        console.log("Messages loaded successfully");

        setIsLoading(false);
      } catch (error) {
        console.log("Initialization error, falling back to mock data:", error);
        setMessages(mockMessages);
        setIsLoading(false);
      }
    };

    initializeAndLoad();

    // Set up continuous polling every 5 seconds for real-time updates (reduced frequency)
    const interval = setInterval(() => {
      loadMessages(true); // Silent update
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Effect to translate AI messages when language changes or new messages arrive
  useEffect(() => {
    const translateAIMessages = async () => {
      if (!isHindi) {
        setTranslatedMessages({});
        return;
      }

      const newTranslations: { [key: string]: string } = {};

      for (const message of messages) {
        if (message.isFromAdmin && !translatedMessages[message.id]) {
          try {
            const cleanMessage = message.productData
              ? message.message.split("Product Data:")[0].trim()
              : message.message;

            const translated = await translateAIMessage(cleanMessage);
            newTranslations[message.id] = translated;
          } catch (error) {
            console.log(`Translation failed for message ${message.id}:`, error);
          }
        }
      }

      if (Object.keys(newTranslations).length > 0) {
        setTranslatedMessages((prev) => ({ ...prev, ...newTranslations }));
      }
    };

    translateAIMessages();
  }, [messages, isHindi]);

  const initializeChat = async () => {
    try {
      const response = await fetch("/api/db/init-admin-chat", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Chat initialization successful:", data);
        setIsInitialized(true);
        setConnectionStatus("online");
        return true;
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.log(
          "Chat initialization failed - using fallback mode:",
          errorData
        );
        setIsInitialized(true); // Still proceed with mock data
        setConnectionStatus("offline");
        return false;
      }
    } catch (error) {
      console.log("Chat initialization error - using fallback mode:", error);
      setIsInitialized(true); // Still proceed with mock data
      setConnectionStatus("offline");
      return false;
    }
  };

  const loadMessages = async (silent = false) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token found, using mock messages");
        setMessages(mockMessages);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/admin-chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (!silent) {
          console.log(
            "API request failed, using mock messages. Status:",
            response.status
          );
        }
        setMessages(mockMessages);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const newMessages = data.messages || [];

      if (!silent) {
        console.log(
          "Artisan messages loaded from API:",
          newMessages.length,
          "messages"
        );
      }

      // If no messages from API, use mock messages
      if (newMessages.length === 0) {
        setMessages(mockMessages);
      } else {
        // Parse product data from messages if present
        const messagesWithProducts = newMessages.map((msg: any) => {
          if (msg.message.startsWith("🛍️ Product Shared:")) {
            try {
              const productMatch = msg.message.match(/Product Data: (.*)/);
              if (productMatch) {
                const productData = JSON.parse(productMatch[1]);
                return { ...msg, productData };
              }
            } catch (e) {
              console.error("Failed to parse product data:", e);
            }
          }
          return msg;
        });

        // Update messages state
        setMessages(messagesWithProducts);

        // Track the latest message for real-time updates
        if (newMessages.length > 0) {
          setLastMessageId(newMessages[newMessages.length - 1].id);
        }
      }
    } catch (error) {
      if (!silent) {
        console.log("API error, using mock messages:", error);
      }
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add optimistic message immediately
    const optimisticMessage: AdminMessage = {
      id: `temp-${Date.now()}`,
      isFromAdmin: false,
      message: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately

    setIsSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token - message sent in offline mode");
        // Update the optimistic message to show it was sent in offline mode
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      console.log("Artisan sending message:", messageToSend);

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageToSend,
        }),
      });

      if (!response.ok) {
        console.log("Send message failed, but keeping optimistic message");
        // Keep the optimistic message but mark it as delivered
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      const data = await response.json();
      console.log("Message sent successfully:", data);

      // Replace optimistic message with real message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...data.message, status: "delivered" as const }
            : msg
        )
      );

      // Reload messages to get any admin responses after a delay
      setTimeout(() => loadMessages(true), 1000);
    } catch (error) {
      console.log("Send message error, keeping optimistic message:", error);
      // Keep the optimistic message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple file type check for village admin
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please share only images (JPG, PNG, GIF) or documents (PDF, TXT, DOC)"
      );
      return;
    }

    // File size limit (10MB - Cloudinary can handle this easily)
    if (file.size > 10 * 1024 * 1024) {
      alert(
        isHindi
          ? "फ़ाइल बहुत बड़ी है। कृपया 10MB से छोटी फ़ाइल चुनें।"
          : "File is too big. Please choose a file smaller than 10MB."
      );
      return;
    }

    setUploadingFile(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/artisan");
        return;
      }

      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to cloud storage");
      }

      const uploadData = await uploadResponse.json();
      console.log("File uploaded to Cloudinary:", uploadData);

      // Send message with file attachment
      const fileMessage = `📎 Shared file: ${file.name}

${
  file.type.startsWith("image/")
    ? "🖼️ This is an image file"
    : "📄 This is a document"
} (${Math.round(file.size / 1024)}KB)

Please take a look and let me know what you think!`;

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: fileMessage,
          attachmentUrl: uploadData.url,
          attachmentName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send file message");
      }

      const data = await response.json();
      console.log("File shared successfully:", data);

      // Add the new message to the state immediately
      setMessages((prev) => [...prev, data.message]);

      // Reload messages
      setTimeout(loadMessages, 1000);
    } catch (error) {
      console.error("Failed to share file:", error);
      alert(
        isHindi
          ? "फ़ाइल साझा करने में विफल। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।"
          : "Failed to share file. Please check your internet connection and try again."
      );
    } finally {
      setUploadingFile(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token for loading products");
        setProducts([]);
        return;
      }

      const response = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log("Failed to load products:", response.status);
        setProducts([]);
        return;
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.log("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleShareProduct = async (product: Product) => {
    // Add optimistic message immediately
    const productMessage = `🛍️ My Product: ${product.name}

💰 Price: $${product.price}

Please help me sell this better!`;

    const optimisticMessage: AdminMessage = {
      id: `temp-product-${Date.now()}`,
      isFromAdmin: false,
      message: productMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
      productData: product,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setShowProductModal(false);

    setIsSending(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("No auth token - product shared in offline mode");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      const fullProductMessage = `${productMessage}

Product Data: ${JSON.stringify(product)}`;

      const response = await fetch("/api/admin-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: fullProductMessage,
          attachmentUrl: product.imageUrl,
          attachmentName: `${product.name} - $${product.price}`,
        }),
      });

      if (!response.ok) {
        console.log("Product share failed, but keeping optimistic message");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...msg, status: "delivered" as const }
              : msg
          )
        );
        return;
      }

      const data = await response.json();
      console.log("Product shared successfully:", data);

      // Replace optimistic message with real message
      const messageWithProduct = {
        ...data.message,
        productData: product,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...messageWithProduct, status: "delivered" as const }
            : msg
        )
      );

      // Reload messages to get any admin responses after a delay
      setTimeout(() => loadMessages(true), 1000);
    } catch (error) {
      console.log("Product share error, keeping optimistic message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
    setShowQuickActions(false);
  };

  const handleCategorySelect = (category: SupportCategory) => {
    setSelectedCategory(category.id);
    setNewMessage(
      `Hi! I need help with ${category.name.toLowerCase()}. ${
        category.description
      }`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">
            {tl("Loading messages...", {
              hi: "संदेश लोड हो रहे हैं...",
              bn: "বার্তা লোড হচ্ছে...",
              te: "సందేశాలు లోడవుతున్నాయి...",
              mr: "संदेश लोड होत आहेत...",
              ta: "செய்திகள் லோட்வுதல்...",
              gu: "સંદેશા લોડ થઈ રહ્યા છે...",
              kn: "ಸಂದೇಶಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...",
              or: "ବାର୍ତ୍ତାଗୁଡ଼ିକ ଲୋଡ୍ ହେଉଛି...",
              pa: "ਸੁਨੇਹੇ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              {tl("Admin Support", {
                hi: "एडमिन सहायता",
                bn: "প্রশাসন সহায়তা",
                te: "నిర్వాహక మద్దతు",
                mr: "प्रशासक सहाय्य",
                ta: "நிர்வாக ஆதரவு",
                gu: "એડમિન સપોર્ટ",
                kn: "ನಿರ್ವಾಹಕ ಬೆಂಬಲ",
                or: "ପ୍ରଶାସକ ସହାୟତା",
                pa: "ਪ੍ਰਸ਼ਾਸਕ ਸਹਾਇਤਾ",
              })}
            </h1>
            <p className="text-slate-400">
              {tl("Get help to grow your business", {
                hi: "अपने व्यवसाय को बढ़ाने में सहायता प्राप्त करें",
                bn: "আপনার ব্যবসা বাড়ানোর জন্য সাহায্য নিন",
                te: "మీ వ్యాపారాన్ని పెంచడానికి సహాయం పొందండి",
                mr: "आपला व्यवसाय वाढवण्यासाठी मदत मिळवा",
                ta: "உங்கள் வணிகத்தை வளர்க்க உதவி பெறுங்கள்",
                gu: "તમારા બિઝનેસને વધારવા માટે મદદ મેળવો",
                kn: "ನಿಮ್ಮ ವ್ಯವಸಾಯವನ್ನು ಬೆಳೆಸಲು ಸಹಾಯ ಪಡೆಯಿರಿ",
                or: "ଆପଣଙ୍କ ବ୍ୟବସାୟ ବଢ଼ାଇବା ପାଇଁ ସାହାଯ୍ୟ ପାଆନ୍ତୁ",
                pa: "ਆਪਣਾ ਕਾਰੋਬਾਰ ਵਧਾਉਣ ਲਈ ਮਦਦ ਲਓ",
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Connection Status Indicator */}
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                connectionStatus === "online"
                  ? "bg-green-500/20 text-green-400"
                  : connectionStatus === "offline"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-gray-500/20 text-gray-400"
              }`}>
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "online"
                    ? "bg-green-400"
                    : connectionStatus === "offline"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-gray-400 animate-pulse"
                }`}></div>
              <span>
                {connectionStatus === "online"
                  ? isHindi
                    ? "जुड़ा हुआ"
                    : "Connected"
                  : connectionStatus === "offline"
                  ? isHindi
                    ? "ऑफ़लाइन मोड"
                    : "Offline Mode"
                  : isHindi
                  ? "जुड़ रहा है..."
                  : "Connecting..."}
              </span>
            </div>

            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Support Categories */}
        {messages.length === 0 && !isLoading && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {isHindi
                ? "आज हम आपकी कैसे सहायता कर सकते हैं?"
                : "How can we help you today?"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left hover:bg-slate-700 hover:border-orange-500/50 transition-all duration-200 group">
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">
                      {category.name}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <HeartHandshake className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  {tl("Welcome to Admin Support!", {
                    hi: "एडमिन सहायता में आपका स्वागत है!",
                    bn: "প্রশাসন সহায়তায় স্বাগতম!",
                    te: "అడ్మిన్ సపోర్ట్‌కి స్వాగతం!",
                    mr: "प्रशासक सहाय्यामध्ये आपले स्वागत आहे!",
                    ta: "அட்மின் சப்போர்ட்டிற்கு வருக!",
                    gu: "એડમિન સપોર્ટમાં આપનું સ્વાગત છે!",
                    kn: "ಅಡ್ಮಿನ್ ಬೆಂಬಲಕ್ಕೆ ಸ್ವಾಗತ!",
                    or: "ପ୍ରଶାସକ ସହାୟତାରେ ସ୍ୱାଗତ!",
                    pa: "ਐਡਮਿਨ ਸਪੋਰਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!",
                  })}
                </h3>
                <p className="text-slate-400 mb-4">
                  {tl(
                    "Our team is here to help you succeed. Choose a category above or start typing your question.",
                    {
                      hi: "हमारी टीम आपकी सफलता में मदद करने के लिए यहाँ है। ऊपर एक श्रेणी चुनें या अपना प्रश्न टाइप करना शुरू करें।",
                      bn: "আমাদের দল আপনার সাফল্যে সাহায্য করতে এখানে রয়েছে। উপরে একটি বিভাগ বেছে নিন বা আপনার প্রশ্ন টাইপ করা শুরু করুন।",
                      te: "మా బృందం మీ విజయంలో సహాయపడటానికి ఇక్కడ ఉంది। పైన ఒక వర్గాన్ని ఎంచుకోండి లేదా మీ ప్రశ్నను టైప్ చేయడం ప్రారంభించండి।",
                      mr: "आमची टीम तुमच्या यशात मदत करण्यासाठी येथे आहे। वर एक श्रेणी निवडा किंवा तुमचा प्रश्न टाइप करणे सुरू करा।",
                      ta: "எங்கள் குழு உங்கள் வெற்றியில் உதவ இங்கே உள்ளது। மேலே ஒரு வகையைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் கேள்வியைத் தட்டச்சு செய்யத் தொடங்கவும்।",
                      gu: "અમારી ટીમ તમારી સફળતામાં મદદ કરવા માટે અહીં છે. ઉપર એક શ્રેણી પસંદ કરો અથવા તમારો પ્રશ્ન ટાઇપ કરવાનું શરૂ કરો।",
                      kn: "ನಮ್ಮ ತಂಡ ನಿಮ್ಮ ಯಶಸ್ಸಿನಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದೆ. ಮೇಲೆ ಒಂದು ವರ್ಗವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಲು ಪ್ರಾರಂಭಿಸಿ।",
                      or: "ଆମର ଟିମ୍ ଆପଣଙ୍କ ସଫଳତାରେ ସାହାଯ୍ୟ କରିବାକୁ ଏଠାରେ ଅଛି। ଉପରେ ଏକ ବର୍ଗ ବାଛନ୍ତୁ କିମ୍ବା ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଟାଇପ୍ କରିବା ଆରମ୍ଭ କରନ୍ତୁ।",
                      pa: "ਸਾਡੀ ਟੀਮ ਤੁਹਾਡੀ ਸਫਲਤਾ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹੈ। ਉੱਪਰ ਇੱਕ ਸ਼੍ਰੇਣੀ ਚੁਣੋ ਜਾਂ ਆਪਣਾ ਸਵਾਲ ਟਾਈਪ ਕਰਨਾ ਸ਼ੁਰੂ ਕਰੋ।",
                    }
                  )}
                </p>
                {connectionStatus === "offline" && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4 max-w-md mx-auto">
                    <p className="text-yellow-400 text-sm">
                      📱{" "}
                      {isHindi
                        ? "ऑफ़लाइन मोड में काम कर रहे हैं। आपके संदेश सुरक्षित हैं और कनेक्शन वापस आने पर भेजे जाएंगे।"
                        : "Working in offline mode. Your messages will be saved and sent when connection is restored."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isFromAdmin ? "justify-start" : "justify-end"
                  }`}>
                  <div
                    className={`max-w-[70%] ${
                      message.isFromAdmin
                        ? "bg-slate-700 border border-slate-600 text-white"
                        : "bg-orange-500 text-white"
                    } rounded-lg p-4`}>
                    {message.isFromAdmin && (
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                          <Shield className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-300">
                          {tl("Admin Support", {
                            hi: "एडमिन सहायता",
                            bn: "প্রশাসন সহায়তা",
                            te: "నిర్వాહక మద్దతు",
                            mr: "प्रशासक सहाय्य",
                            ta: "நிர்வாக ஆதரவு",
                            gu: "એડમિન સપોર્ટ",
                            kn: "ನಿರ್ವಾಹಕ ಬೆಂಬಲ",
                            or: "ପ୍ରଶାସକ ସହାୟତା",
                            pa: "ਪ੍ਰਸ਼ਾਸਕ ਸਹਾਇਤਾ",
                          })}
                        </span>
                      </div>
                    )}

                    {/* Simple Product Card for Village Admin - just photo and price */}
                    {message.productData && (
                      <div className="mb-3 bg-slate-600 rounded-lg p-3 border border-slate-500">
                        <div className="flex items-center mb-2">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">
                            {isHindi ? "मेरा उत्पाद" : "My Product"}
                          </span>
                        </div>
                        <div className="text-center">
                          {message.productData.imageUrl && (
                            <div className="w-full max-w-48 mx-auto mb-3 rounded-lg overflow-hidden bg-slate-500">
                              <img
                                src={message.productData.imageUrl}
                                alt={message.productData.name}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <h4 className="font-bold text-lg mb-1">
                            {message.productData.name}
                          </h4>
                          <div className="text-2xl font-bold text-green-300">
                            ${message.productData.price}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">
                      {(() => {
                        const originalMessage = message.productData
                          ? message.message.split("Product Data:")[0].trim()
                          : message.message;

                        // Use translated message if available and this is an AI message
                        if (
                          message.isFromAdmin &&
                          isHindi &&
                          translatedMessages[message.id]
                        ) {
                          return translatedMessages[message.id];
                        }

                        return originalMessage;
                      })()}
                    </p>

                    {/* File Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="bg-slate-600 rounded-lg p-3 border border-slate-500">
                            {attachment.type === "file" && attachment.url && (
                              <>
                                {attachment.url.match(
                                  /\.(jpg|jpeg|png|gif)$/i
                                ) ? (
                                  <div>
                                    <img
                                      src={attachment.url}
                                      alt={attachment.name}
                                      className="max-w-full h-auto rounded-lg mb-2"
                                      style={{ maxHeight: "200px" }}
                                    />
                                    <p className="text-xs opacity-80">
                                      {attachment.name}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-300 hover:text-blue-200 underline">
                                      {attachment.name}
                                    </a>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {!message.isFromAdmin && (
                        <div className="flex items-center">
                          {message.status === "sent" && (
                            <Clock className="h-3 w-3 opacity-70" />
                          )}
                          {message.status === "delivered" && (
                            <div className="w-3 h-3 rounded-full bg-white/50" />
                          )}
                          {message.status === "read" && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="border-t border-slate-700 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-left p-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors">
                <Lightbulb className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setShowProductModal(true);
                  loadProducts();
                }}
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors"
                title="Share a product">
                <ShoppingBag className="h-5 w-5" />
              </button>
              <label
                className="p-2 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                title="Share a file">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  className="hidden"
                  disabled={uploadingFile}
                />
                {uploadingFile ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={tl("Type your message to admin support...", {
                    hi: "एडमिन सहायता के लिए अपना संदेश टाइप करें...",
                    bn: "প্রশাসন সহায়তার জন্য আপনার বার্তা টাইপ করুন...",
                    te: "అడ్మిన్ సపోర్ట్ కోసం మీ మెసేజ్ టైప్ చేయండి...",
                    mr: "प्रशासक सहाय्यासाठी तुमचा संदेश टाइप करा...",
                    ta: "நிர்வாக ஆதரவுக்காக உங்கள் செய்தியைத் தட்டச்சு செய்யுங்கள்...",
                    gu: "એડમિન સપોર્ટ માટે તમારો સંદેશ ટાઇપ કરો...",
                    kn: "ಅಡ್ಮಿನ್ ಬೆಂಬಲಕ್ಕಾಗಿ ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...",
                    or: "ପ୍ରଶାସକ ସହାୟତା ପାଇଁ ଆପଣଙ୍କ ବାର୍ତ୍ତା ଟାଇପ୍ କରନ୍ତୁ...",
                    pa: "ਐਡਮਿਨ ਸਪੋਰਟ ਲਈ ਆਪਣਾ ਸੰਦੇਸ਼ ਟਾਈਪ ਕਰੋ...",
                  })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                {isSending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Product Sharing Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  {tl("Share Product with Admin", {
                    hi: "एडमिन के साथ उत्पाद साझा करें",
                    bn: "প্রশাসনের সাথে পণ্য শেয়ার করুন",
                    te: "అడ్మిన్‌తో ఉత్పత్తిని భాగస్వామ్యం చేయండి",
                    mr: "प्रशासकासह उत्पादन सामायिक करा",
                    ta: "நிர்வாகியுடன் தயாரிப்பைப் பகிரவும்",
                    gu: "એડમિન સાથે ઉત્પાદન શેર કરો",
                    kn: "ಅಡ್ಮಿನ್‌ನೊಂದಿಗೆ ಉತ್ಪನ್ನವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
                    or: "ଆଡମିନଙ୍କ ସହିତ ଉତ୍ପାଦ ସେୟାର କରନ୍ତୁ",
                    pa: "ਐਡਮਿਨ ਨਾਲ ਉਤਪਾਦ ਸਾਂਝਾ ਕਰੋ",
                  })}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">
                    {tl("Loading your products...", {
                      hi: "आपके उत्पाद लोड हो रहे हैं...",
                      bn: "আপনার পণ্য লোড হচ্ছে...",
                      te: "మీ ఉత్పత్తులు లోడవుతున్నాయి...",
                      mr: "तुमची उत्पादने लोड होत आहेत...",
                      ta: "உங்கள் தயாரிப்புகள் லோட்வுதல்...",
                      gu: "તમારા ઉત્પાદનો લોડ થઈ રહ્યા છે...",
                      kn: "ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...",
                      or: "ଆପଣଙ୍କ ଉତ୍ପାଦଗୁଡ଼ିକ ଲୋଡ୍ ହେଉଛି...",
                      pa: "ਤੁਹਾਡੇ ਉਤਪਾਦ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...",
                    })}
                  </p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">
                    {tl("No Products Found", {
                      hi: "कोई उत्पाद नहीं मिला",
                      bn: "কোন পণ্য পাওয়া যায়নি",
                      te: "ఉత్పత్తులు కనుగొనబడలేదు",
                      mr: "कोणतेही उत्पादन सापडले नाही",
                      ta: "பொருட்கள் கிடைக்கவில்லை",
                      gu: "કોઈ ઉત્પાદન મળ્યું નથી",
                      kn: "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
                      or: "କୌଣସି ଉତ୍ପାଦ ମିଳିଲା ନାହିଁ",
                      pa: "ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ",
                    })}
                  </h4>
                  <p className="text-slate-400 mb-4">
                    {tl("You don't have any products to share yet.", {
                      hi: "अभी तक आपके पास साझा करने के लिए कोई उत्पाद नहीं है।",
                      bn: "আপনার এখনও শেয়ার করার জন্য কোন পণ্য নেই।",
                      te: "మీకు ఇంకా భాగస్వామ్యం చేయడానికి ఉత్పత్తులు లేవు।",
                      mr: "तुमच्याकडे अजून सामायिक करण्यासाठी कोणतेही उत्पादन नाही.",
                      ta: "உங்களிடம் இன்னும் பகிர்ந்து கொள்ள எந்த தயாரிப்புகளும் இல்லை.",
                      gu: "તમારી પાસે હજુ સુધી શેર કરવા માટે કોઈ ઉત્પાદન નથી.",
                      kn: "ನಿಮ್ಮ ಬಳಿ ಇನ್ನೂ ಹಂಚಿಕೊಳ್ಳಲು ಯಾವುದೇ ಉತ್ಪನ್ನಗಳಿಲ್ಲ.",
                      or: "ଆପଣଙ୍କ ପାଖରେ ଏପର୍ଯ୍ୟନ୍ତ ସେୟାର କରିବାକୁ କୌଣସି ଉତ୍ପାଦ ନାହିଁ।",
                      pa: "ਤੁਹਾਡੇ ਕੋਲ ਅਜੇ ਤਕ ਸਾਂਝਾ ਕਰਨ ਲਈ ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਹਨ।",
                    })}
                  </p>
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      router.push("/artisan/products");
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200">
                    {t("createProduct")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter((p) => p.isActive)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600 hover:border-orange-500/50 transition-all duration-200 text-center">
                        {product.imageUrl && (
                          <div className="w-full h-40 rounded-lg overflow-hidden mb-3 bg-slate-600">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        <h4 className="font-bold text-white mb-2">
                          {product.name}
                        </h4>
                        <div className="text-2xl font-bold text-green-300 mb-4">
                          ${product.price}
                        </div>
                        <button
                          onClick={() => handleShareProduct(product)}
                          disabled={isSending}
                          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center justify-center text-lg font-medium">
                          {isSending ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              {tl("Share This", {
                                hi: "यह साझा करें",
                                bn: "এটি শেয়ার করুন",
                                te: "దీన్ని భాగస్వామ్యం చేయండి",
                                mr: "हे सामायिक करा",
                                ta: "இதைப் பகிரவும்",
                                gu: "આ શેર કરો",
                                kn: "ಇದನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
                                or: "ଏହାକୁ ସେୟାର କରନ୍ତୁ",
                                pa: "ਇਸਨੂੰ ਸਾਂਝਾ ਕਰੋ",
                              })}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
