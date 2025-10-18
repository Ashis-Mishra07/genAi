# Artisan Multilingual Floating Chatbot

## Overview
A fully-featured AI-powered chatbot designed specifically for local artisans with multilingual support, complete database access, and voice input capabilities. The chatbot floats on all artisan pages and helps them manage their business easily.

## Features

### 🌍 Multilingual Support
- **Supported Languages**: English, Hindi, Bengali, Telugu, Tamil, Malayalam, Kannada, Gujarati, Marathi, Odia
- Automatically detects user's preferred language
- AI responds in the same language as the user's query
- Simple language for local artisans who may not be tech-savvy

### 🎤 Voice Input
- Voice-to-text transcription (ready for integration with Whisper API or similar services)
- Visual recording indicator
- Supports multiple Indian languages
- Fallback to text input if voice fails

### 💬 Conversational AI
- Powered by Google Gemini AI
- Maintains conversation context
- Friendly, supportive tone
- Encourages artisan business growth

### 📊 Database Integration
The chatbot has full access to artisan data:

#### Products
- View all products
- Check active/inactive status
- See product prices and descriptions
- Get product statistics

#### Orders & Sales
- View recent orders
- Track order status
- Calculate total earnings
- See order history

#### Analytics
- Total products count
- Active products count
- Total orders
- Total revenue
- Business performance metrics

#### Notifications
- Recent notifications
- Unread alerts
- Important updates

#### Customer Inquiries
- Customer questions
- Inquiry status
- Product-specific inquiries

### 🎨 UI/UX Features
- **Floating Button**: Always accessible, bottom-right corner
- **Minimize/Maximize**: Can minimize chat window while keeping it accessible
- **Smooth Animations**: Professional transitions and effects
- **Responsive Design**: Works on all screen sizes
- **Visual Indicators**: Loading states, typing indicators, message status

## Implementation Details

### Components

#### 1. FloatingChatbot Component
**Location**: `components/artisan/FloatingChatbot.tsx`

**Key Features**:
- Manages chat state
- Handles voice recording
- Sends messages to API
- Displays conversation history
- Supports minimize/maximize
- Multilingual UI

**Props**: None (self-contained)

**Usage**:
```tsx
import FloatingChatbot from '@/components/artisan/FloatingChatbot';

// Add to layout or page
<FloatingChatbot />
```

### API Endpoints

#### 1. Text Chat API
**Endpoint**: `POST /api/artisan/chatbot`

**Request**:
```json
{
  "message": "How many products do I have?",
  "language": "en",
  "conversationHistory": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "content": "You currently have 15 products in your store..."
}
```

**Features**:
- JWT authentication
- Fetches relevant database data based on query
- Creates context-aware AI responses
- Supports multilingual queries and responses

#### 2. Voice Chat API
**Endpoint**: `POST /api/artisan/chatbot/voice`

**Request**: FormData with audio file

**Response**:
```json
{
  "success": true,
  "transcription": "मेरे कितने उत्पाद हैं?",
  "response": "आपके पास वर्तमान में 15 उत्पाद हैं..."
}
```

**Note**: Voice transcription requires additional service configuration (OpenAI Whisper, Google Speech-to-Text, etc.)

### Database Queries

The chatbot intelligently queries the database based on user intent:

```typescript
// Products query
if (query.includes('product')) {
  data.products = await prisma.product.findMany({
    where: { artisanId },
    // ... additional filters
  });
}

// Orders query
if (query.includes('order') || query.includes('sale')) {
  data.orders = await prisma.order.findMany({
    where: {
      orderItems: {
        some: {
          product: { artisanId }
        }
      }
    }
  });
}

// Analytics query
if (query.includes('analytics') || query.includes('performance')) {
  data.analytics = {
    totalProducts: await prisma.product.count({ where: { artisanId } }),
    activeProducts: await prisma.product.count({ where: { artisanId, isActive: true } }),
    // ... more metrics
  };
}
```

## Configuration

### Environment Variables Required

```env
# JWT for authentication
JWT_SECRET=your_jwt_secret

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=your_postgres_connection_string

# Optional: For voice transcription
OPENAI_API_KEY=your_openai_api_key  # For Whisper API
# OR
GOOGLE_CLOUD_API_KEY=your_google_cloud_key  # For Google Speech-to-Text
```

### Installation Steps

1. **Install Dependencies** (already included in your project):
   - `@google/generative-ai` - For Gemini AI
   - `@prisma/client` - For database queries
   - `jsonwebtoken` - For authentication

2. **Add Chatbot to Artisan Layout** (already done):
   ```tsx
   // app/artisan/layout.tsx
   import FloatingChatbot from '@/components/artisan/FloatingChatbot';
   
   // Add inside layout
   <FloatingChatbot />
   ```

3. **Verify API Routes** (already created):
   - `/api/artisan/chatbot/route.ts` - Text chat
   - `/api/artisan/chatbot/voice/route.ts` - Voice chat

4. **Test the Implementation**:
   - Login as an artisan
   - Navigate to any artisan page
   - Click the floating chatbot button
   - Ask questions in any supported language

## Example Queries

### English
- "How many products do I have?"
- "What are my recent orders?"
- "Show me my earnings this month"
- "How is my business performing?"
- "What customer inquiries do I have?"

### Hindi
- "मेरे कितने उत्पाद हैं?"
- "मेरे हाल के ऑर्डर क्या हैं?"
- "इस महीने मेरी कमाई कितनी है?"
- "मेरा व्यापार कैसा चल रहा है?"
- "मुझे कौन से ग्राहक पूछताछ हैं?"

### Bengali
- "আমার কতগুলি পণ্য আছে?"
- "আমার সাম্প্রতিক অর্ডারগুলি কী?"
- "এই মাসে আমার আয় কত?"

### Telugu
- "నాకు ఎన్ని ఉత్పత్తులు ఉన్నాయి?"
- "నా ఇటీవలి ఆర్డర్లు ఏమిటి?"
- "ఈ నెలలో నా సంపాదన ఎంత?"

## Customization

### Adding More Languages

1. **Update Translations**:
   ```typescript
   // lib/i18n/translations.ts
   export const translations = {
     // ... existing languages
     pa: { // Punjabi
       chatbotTitle: 'AI ਸਹਾਇਕ',
       chatbotPlaceholder: 'ਆਪਣਾ ਸੁਨੇਹਾ ਲਿਖੋ...',
       // ... more translations
     }
   };
   ```

2. **Update Welcome Messages**:
   ```typescript
   // components/artisan/FloatingChatbot.tsx
   const welcomeMessages: Record<string, string> = {
     // ... existing languages
     pa: `🙏 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਸਹਾਇਕ ਹਾਂ...`
   };
   ```

### Customizing AI Behavior

Edit the system prompt in `/api/artisan/chatbot/route.ts`:

```typescript
const systemPrompt = `You are an AI assistant for ${user.name}.
Your custom instructions here...
- Be more formal/casual
- Focus on specific aspects
- Add domain-specific knowledge
etc.`;
```

### Adding New Database Queries

```typescript
// Add to fetchArtisanData function
if (lowerQuery.includes('your_keyword')) {
  data.yourData = await prisma.yourTable.findMany({
    where: { artisanId },
    // ... your query
  });
}

// Add to createDatabaseContext function
if (data.yourData) {
  context += `\n\n**Your Data:**\n`;
  // Format your data
}
```

## Performance Considerations

1. **Database Queries**: Limited to recent records (last 10-20) to avoid slow responses
2. **AI Context**: Keeps last 5 messages for context to manage token usage
3. **Caching**: Consider adding Redis cache for frequently asked queries
4. **Rate Limiting**: Implement rate limiting to prevent API abuse

## Security Features

- ✅ JWT authentication required
- ✅ Role-based access (ARTISAN only)
- ✅ User data isolation (can only see own data)
- ✅ Input validation
- ✅ Error handling with safe messages

## Future Enhancements

### Voice Transcription
To enable voice features, integrate a speech-to-text service:

**Option 1: OpenAI Whisper**
```typescript
const formDataForWhisper = new FormData();
formDataForWhisper.append('file', audioFile);
formDataForWhisper.append('model', 'whisper-1');
formDataForWhisper.append('language', language);

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  body: formDataForWhisper,
});
```

**Option 2: Google Speech-to-Text**
```typescript
import speech from '@google-cloud/speech';
const client = new speech.SpeechClient();
// ... implement Google Speech-to-Text
```

### Additional Features
- 📈 **Analytics Charts**: Generate visual charts based on queries
- 📄 **PDF Reports**: Generate downloadable business reports
- 🔔 **Proactive Notifications**: AI suggests actions based on business data
- 🤝 **Customer Chat Integration**: Connect with customer support
- 📱 **WhatsApp Integration**: Send chatbot responses via WhatsApp
- 🎯 **Smart Recommendations**: Product pricing, marketing suggestions

## Troubleshooting

### Chatbot Not Appearing
- Check if user is logged in as ARTISAN role
- Verify FloatingChatbot is added to artisan layout
- Check browser console for errors

### AI Not Responding
- Verify GEMINI_API_KEY is set correctly
- Check API rate limits
- Review server logs for errors

### Database Queries Not Working
- Verify DATABASE_URL is correct
- Check Prisma client generation: `npx prisma generate`
- Verify user has correct permissions

### Voice Recording Not Working
- Check microphone permissions in browser
- Verify HTTPS (required for getUserMedia)
- Check browser compatibility

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

**Note**: Voice recording requires getUserMedia API support

## Testing Checklist

- [ ] Login as artisan
- [ ] Chatbot button appears on all artisan pages
- [ ] Can open/close chatbot
- [ ] Can minimize/maximize chatbot
- [ ] Can send text messages
- [ ] Receives AI responses
- [ ] Language switching works
- [ ] Database queries work (products, orders, analytics)
- [ ] Voice recording button appears
- [ ] Conversation history maintained
- [ ] Works on mobile devices
- [ ] Error handling works properly

## Credits

- **AI**: Google Gemini
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Lucide Icons
- **Internationalization**: Custom i18n implementation
- **Voice Input**: Web Audio API (ready for transcription service)

## License

Part of the GenAI Artisan Marketplace platform.

---

**For Support**: Contact the development team or refer to the main project documentation.
