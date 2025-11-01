'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  FileText, 
  Sparkles, 
  Upload,
  Loader2,
  User,
  Bot,
  Camera,
  Share2,
  Wand2,
  DollarSign,
  BookOpen,
  Megaphone,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CanvasPoster, { PosterTheme, POSTER_THEMES } from '@/components/ui/canvas-poster';
import ThemeSelector from '@/components/ui/theme-selector';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  canvasPoster?: {
    productName: string;
    productImage: string;
    theme: PosterTheme;
  };
  metadata?: {
    tool?: string;
    processingTime?: number;
    intent?: string;
    confidence?: number;
  };
}

interface MCPResponse {
  success: boolean;
  result?: any;
  content?: string;
  error?: string;
  processingTime?: number;
  type?: string;
  tool?: string;
  intent?: string;
  confidence?: number;
  suggestion?: string;
  imageData?: string; // Add this
  htmlContent?: string; // Add this
  poster?: any; // Add this
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI-powered marketplace assistant. I\'m here to help you create beautiful posters for your artisan business! 🎨\n\nI can assist you with:\n\n📸 **Canvas Poster Creation** - Upload product photos and choose from professional themes\n🎨 **Cultural Storytelling** - Create authentic stories showcasing your craft\'s heritage\n💰 **Smart Pricing** - Get pricing suggestions based on market trends\n📢 **Marketing Content** - Generate compelling marketing copy\n\nTo create a poster: Upload a product image and I\'ll show you theme options to choose from!',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageAction, setImageAction] = useState<'analyze' | 'refine' | 'poster'>('analyze');
  const [contentType, setContentType] = useState<'general' | 'story' | 'pricing' | 'marketing' | 'poster'>('general');
  const [showContentOptions, setShowContentOptions] = useState(false);
  
  // Theme selection state
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme | null>(null);
  const [posterImageFile, setPosterImageFile] = useState<File | null>(null);
  const [productName, setProductName] = useState('');
  
  // Instagram sharing
  const [isInstagramSharing, setIsInstagramSharing] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceModalData, setPriceModalData] = useState<{
    canvasPoster: {
      theme: PosterTheme;
      productName: string;
      imageFile: File;
      dataUrl: string;
    };
    caption: string;
  } | null>(null);
  const [priceForm, setPriceForm] = useState({
    price: '',
    currency: 'INR',
    artistName: '',
    category: 'Handcrafted',
    materials: '',
    dimensions: '',
    description: ''
  });

  const handleInstagramShare = (imageData: string, caption: string, productInfo?: any) => {
    // Open price setting modal
    setPriceModalData({ imageData, caption, productInfo });
    setShowPriceModal(true);
    
    // Pre-fill form with existing product info if available
    if (productInfo) {
      setPriceForm({
        price: productInfo.price?.toString() || '',
        currency: productInfo.currency || 'INR',
        artistName: productInfo.artistName || '',
        category: productInfo.category || 'Handcrafted',
        materials: productInfo.materials || '',
        dimensions: productInfo.dimensions || '',
        description: productInfo.description || ''
      });
    }
  };

  const handlePosterPriceSubmit = async () => {
    if (!posterImageFile) return;
    
    setShowPosterPriceModal(false);
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', posterImageFile);
      formData.append('action', 'poster');
      
      // Add price and product details to the request
      formData.append('productDetails', JSON.stringify({
        price: parseFloat(priceForm.price) || 0,
        currency: priceForm.currency,
        artistName: priceForm.artistName,
        category: priceForm.category,
        materials: priceForm.materials,
        dimensions: priceForm.dimensions,
        description: priceForm.description
      }));

      const response = await fetch('/api/mcp/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.content || 'Poster generated successfully!',
          timestamp: new Date(),
          imageData: result.result?.poster?.imageData || result.result?.poster?.imageUrl || result.imageData,
          metadata: {
            tool: result.tool,
            processingTime: result.processingTime,
            intent: result.intent,
            poster: result.result?.poster || result.poster
          }
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.error || 'Failed to generate poster');
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ Failed to generate poster: ${error.message}`,
        timestamp: new Date(),
        metadata: {
          tool: 'Image Generator',
          intent: 'error'
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setPosterImageFile(null);
      // Reset form
      setPriceForm({
        price: '',
        currency: 'INR',
        artistName: '',
        category: 'Handcrafted',
        materials: '',
        dimensions: '',
        description: ''
      });
    }
  };

  const handlePriceSubmit = async () => {
    if (!priceModalData) return;
    
    setIsInstagramSharing(true);
    setShowPriceModal(false);
    
    try {
      // Find the message that contains the poster information
      const currentMessage = messages.find(msg => msg.imageData === priceModalData.imageData);
      const posterInfo = currentMessage?.metadata?.poster;
      
      const productInfo = {
        ...priceModalData.productInfo,
        price: parseFloat(priceForm.price) || 0,
        currency: priceForm.currency,
        artistName: priceForm.artistName,
        category: priceForm.category,
        materials: priceForm.materials,
        dimensions: priceForm.dimensions,
        description: priceForm.description,
        poster: posterInfo // Include the poster generation result
      };
      
      const response = await fetch('/api/instagram/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: priceModalData.imageData,
          caption: priceModalData.caption,
          productInfo: productInfo
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        let message = `🎉 Successfully posted to Instagram!\n\n📱 Media ID: ${result.mediaId}\n🔗 Check your Instagram account to see the post!\n\n✨ Caption used:\n${result.caption}`;
        
        if (result.productPageUrl) {
          message += `\n\n🛍️ Product page created: ${result.productPageUrl}\n\n💡 Customers can now DM you or visit the product page to inquire!`;
        }
        
        const successMessage: Message = {
          id: (Date.now() + Math.random()).toString(),
          type: 'assistant',
          content: message,
          timestamp: new Date(),
          metadata: {
            tool: 'Instagram Poster',
            intent: 'social_media_sharing'
          }
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(result.error || 'Failed to post to Instagram');
      }
    } catch (error: any) {
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + Math.random()).toString(),
        type: 'assistant',
        content: `❌ Failed to post to Instagram: ${error.message}\n\n💡 Please check:\n• Instagram Business Account is connected\n• Access tokens are valid\n• Account has posting permissions`,
        timestamp: new Date(),
        metadata: {
          tool: 'Instagram Poster',
          intent: 'error'
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsInstagramSharing(false);
      setPriceModalData(null);
      // Reset form
      setPriceForm({
        price: '',
        currency: 'INR',
        artistName: '',
        category: 'Handcrafted',
        materials: '',
        dimensions: '',
        description: ''
      });
    }
  };  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: selectedFile 
        ? `[Image: ${selectedFile?.name} - ${imageAction}]`
        : contentType !== 'general' 
          ? `[${contentType.toUpperCase()}] ${inputValue}`
          : inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response: MCPResponse;
      
      if (selectedFile) {
        // Handle file upload with selected action
        if (selectedFile.type.startsWith('image/')) {
          response = await handleImageAnalysis(selectedFile);
        } else {
          response = { success: false, error: 'Unsupported file type' };
        }
      } else {
        // Handle text message with selected content type
        response = await handleTextMessage(inputValue, contentType);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.success ? 
          (response.result?.analysis || response.content || 'I apologize, but I couldn\'t generate a proper response.') :
          `Sorry, I encountered an error: ${response.error}`,
        timestamp: new Date(),
        // Handle poster generation results - check nested structure
        imageData: response.result?.poster?.imageData || response.result?.poster?.imageUrl || response.imageData || undefined,
        htmlContent: response.result?.poster?.htmlContent || response.htmlContent || undefined,
        metadata: {
          tool: response.tool || response.type,
          processingTime: response.processingTime,
          intent: response.intent,
          confidence: response.confidence,
          poster: response.result?.poster || response.poster || undefined
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSelectedFile(null);
      setContentType('general');
      setShowContentOptions(false);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `I apologize, but I encountered an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageAnalysis = async (file: File): Promise<MCPResponse> => {
    // If it's a poster action, show price modal first
    if (imageAction === 'poster') {
      setPosterImageFile(file);
      setShowPosterPriceModal(true);
      return { success: true, content: 'Please set your product details for the poster.' };
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('action', imageAction);

    const response = await fetch('/api/mcp/image', {
      method: 'POST',
      body: formData,
    });

    return await response.json();
  };

  const handleTextMessage = async (message: string, type: string): Promise<MCPResponse> => {
    try {
      // If a specific content type is selected, route to appropriate MCP tool
      if (type !== 'general') {
        return await handleSpecificContentType(message, type);
      }

      // Otherwise use the general chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: messages
            .slice(-10)
            .map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.content
            }))
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        success: false,
        error: 'Failed to process message'
      };
    }
  };

  const handleSpecificContentType = async (message: string, type: string): Promise<MCPResponse> => {
    try {
      let endpoint = '';
      let payload = {};

      switch (type) {
        case 'story':
          endpoint = '/api/mcp/content';
          payload = {
            prompt: message,
            type: 'cultural_story'
          };
          break;

        case 'pricing':
          endpoint = '/api/mcp/pricing';
          payload = {
            query: message,
            region: 'India'
          };
          break;

        case 'marketing':
          endpoint = '/api/mcp/marketing';
          payload = {
            prompt: message,
            target_audience: 'art lovers',
            platform: 'social_media'
          };
          break;

        case 'poster':
          endpoint = '/api/mcp/marketing';
          payload = {
            prompt: `Create social media poster content for: ${message}`,
            target_audience: 'art lovers',
            platform: 'instagram'
          };
          break;

        default:
          return { success: false, error: 'Unknown content type' };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      return {
        success: result.success,
        content: result.success ? (result.result?.content || result.result || result.content) : undefined,
        error: result.error,
        tool: `MCP ${type.charAt(0).toUpperCase() + type.slice(1)} Tool`,
        type: type
      };
    } catch (error) {
      console.error(`${type} content generation error:`, error);
      return {
        success: false,
        error: `Failed to generate ${type} content`
      };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: '[Voice Message]',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');

      const response = await fetch('/api/mcp/voice', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.success ? 
          `I heard: "${result.transcription}"\n\n${result.response || 'Processing your voice message...'}` :
          `Sorry, I couldn't process your voice message: ${result.error}`,
        timestamp: new Date(),
        metadata: {
          tool: 'voice',
          processingTime: result.processingTime
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error processing voice message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const contentTypeOptions = [
    { value: 'general', label: 'General Chat', icon: Bot, color: 'bg-gray-600' },
    { value: 'story', label: 'Cultural Story', icon: BookOpen, color: 'bg-orange-600' },
    { value: 'pricing', label: 'Pricing Help', icon: DollarSign, color: 'bg-green-600' },
    { value: 'marketing', label: 'Marketing Copy', icon: Megaphone, color: 'bg-blue-600' },
    { value: 'poster', label: 'Social Poster', icon: Share2, color: 'bg-purple-600' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Marketplace Assistant</h1>
            <p className="text-sm text-gray-600">Image refinement • Social media posters • Cultural storytelling</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-900'}`}>
                    {message.content.split('\n').map((line, index) => (
                      <div key={index} className={line.startsWith('**') && line.endsWith('**') ? 'font-semibold' : ''}>{
                        line.replace(/\*\*(.*?)\*\*/g, '$1')
                      }</div>
                    ))}
                  </div>
                  
                  {/* Display generated poster image */}
                  {message.imageData && (
                    <div className="mt-3">
                      <img 
                        src={message.imageData} 
                        alt="Generated poster"
                        className="max-w-md rounded-lg border shadow-sm"
                      />
                      
                      {/* Instagram sharing buttons */}
                      <div className="mt-3 flex space-x-2">
                        <button 
                          onClick={() => handleInstagramShare(message.imageData!, message.content, message.metadata?.poster?.productInfo)}
                          disabled={isInstagramSharing}
                          className={`flex items-center space-x-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg transition-all ${
                            isInstagramSharing 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:from-purple-600 hover:to-pink-600'
                          }`}
                        >
                          {isInstagramSharing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Posting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              <span>📱 Share to Instagram</span>
                            </>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = message.imageData!;
                            link.download = `artisan-poster-${Date.now()}.jpg`;
                            link.click();
                          }}
                          className="flex items-center space-x-2 text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>💾 Download</span>
                        </button>
                        
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'Artisan Product Poster',
                                text: 'Check out this beautiful handcrafted product!',
                                files: [dataURLtoFile(message.imageData!, 'artisan-poster.jpg')]
                              }).catch(console.error);
                            } else {
                              // Fallback for browsers that don't support Web Share API
                              navigator.clipboard.writeText(message.imageData!);
                              alert('Image data copied to clipboard!');
                            }
                          }}
                          className="flex items-center space-x-2 text-xs bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          <span>🔗 Share</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Display HTML poster */}
                  {message.htmlContent && (
                    <div className="mt-3">
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-xs text-gray-600 mb-2">📱 Social Media Poster (HTML Preview)</p>
                        <div 
                          className="transform scale-50 origin-top-left border rounded"
                          style={{ width: '200%', height: '400px', overflow: 'hidden' }}
                          dangerouslySetInnerHTML={{ __html: message.htmlContent }}
                        />
                        <div className="mt-2 flex space-x-2">
                          <button 
                            onClick={() => {
                              const blob = new Blob([message.htmlContent!], { type: 'text/html' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'poster.html';
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                          >
                            📥 Download HTML
                          </button>
                          <button 
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: 'Artisan Product Poster',
                                  text: 'Check out this handcrafted product!',
                                  url: window.location.href
                                });
                              }
                            }}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          >
                            📤 Share
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={`text-xs mt-2 flex items-center justify-between ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.metadata?.tool && (
                      <span className="flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {message.metadata.tool}
                      </span>
                    )}
                    {message.metadata?.intent && message.metadata?.confidence && (
                      <span className="text-xs opacity-75">
                        {message.metadata.intent} ({Math.round(message.metadata.confidence * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-xs">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-800 font-medium">Selected: {selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </div>
            
            {/* Image Action Selection */}
            <div className="flex space-x-2">
              <button
                onClick={() => setImageAction('analyze')}
                className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 transition-colors ${
                  imageAction === 'analyze' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon className="h-3 w-3" />
                <span>Analyze</span>
              </button>
              
              <button
                onClick={() => setImageAction('refine')}
                className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 transition-colors ${
                  imageAction === 'refine' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="h-3 w-3" />
                <span>Refine Photo</span>
              </button>
              
              <button
                onClick={() => setImageAction('poster')}
                className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 transition-colors ${
                  imageAction === 'poster' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Share2 className="h-3 w-3" />
                <span>Social Poster</span>
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-600">
              {imageAction === 'analyze' && '🔍 Get detailed product analysis and cultural insights'}
              {imageAction === 'refine' && '📸 Get photography improvement suggestions'}
              {imageAction === 'poster' && '📱 Generate social media poster content'}
            </div>
          </div>
        )}

        {/* Content Type Selection */}
        {!selectedFile && showContentOptions && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-800 font-medium">Choose content type:</span>
              <button
                onClick={() => {
                  setShowContentOptions(false);
                  setContentType('general');
                }}
                className="text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {contentTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setContentType(option.value as any)}
                    className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 transition-colors ${
                      contentType === option.value 
                        ? `${option.color} text-white` 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="h-3 w-3" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-2 text-xs text-gray-600">
              {contentType === 'general' && '💬 General conversation and assistance'}
              {contentType === 'story' && '📚 Create cultural stories about your craft'}
              {contentType === 'pricing' && '💰 Get pricing suggestions for your products'}
              {contentType === 'marketing' && '📢 Generate marketing content and copy'}
              {contentType === 'poster' && '🎨 Create social media poster content'}
            </div>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                selectedFile 
                  ? `Image selected - choose analysis type above...`
                  : contentType !== 'general'
                    ? `Describe your ${contentType === 'story' ? 'craft for cultural storytelling' : 
                        contentType === 'pricing' ? 'product for pricing analysis' :
                        contentType === 'marketing' ? 'product for marketing content' :
                        'product for social media poster'}...`
                    : "Ask me about cultural stories, pricing, marketing, or upload an image..."
              }
              className="w-full min-h-[80px] resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              title="Upload Image"
            >
              <Upload className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setShowContentOptions(!showContentOptions)}
              variant="outline"
              size="icon"
              className={showContentOptions ? 'bg-green-50 border-green-200' : ''}
              title="Choose Content Type"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant="outline"
              size="icon"
              className={isRecording ? 'bg-red-50 border-red-200' : ''}
              title="Voice Message"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4 text-red-600" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || (!inputValue.trim() && !selectedFile)}
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.txt,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      {/* Poster Price Setting Modal */}
      {showPosterPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Set Product Details for Poster</h2>
            <p className="text-gray-600 mb-4">
              Add your product details to create a professional sales poster with pricing information.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); handlePosterPriceSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({...priceForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={priceForm.currency}
                    onChange={(e) => setPriceForm({...priceForm, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Name *
                </label>
                <input
                  type="text"
                  required
                  value={priceForm.artistName}
                  onChange={(e) => setPriceForm({...priceForm, artistName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name or artist name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={priceForm.category}
                    onChange={(e) => setPriceForm({...priceForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Handcrafted">Handcrafted</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Metalwork">Metalwork</option>
                    <option value="Painting">Painting</option>
                    <option value="Sculpture">Sculpture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materials
                  </label>
                  <input
                    type="text"
                    value={priceForm.materials}
                    onChange={(e) => setPriceForm({...priceForm, materials: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Clay, Wood, Silver"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={priceForm.dimensions}
                  onChange={(e) => setPriceForm({...priceForm, dimensions: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10cm x 15cm, 6 inches tall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={priceForm.description}
                  onChange={(e) => setPriceForm({...priceForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the product..."
                />
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 mb-1">What happens next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Professional poster will be generated with your pricing</li>
                  <li>• Artist name and price will be prominently displayed</li>
                  <li>• You can then share to Instagram or download</li>
                  <li>• Currency symbol (₹) will be shown correctly</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPosterPriceModal(false);
                    setPosterImageFile(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Price Setting Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Set Product Details for Instagram</h2>
            <p className="text-gray-600 mb-4">
              Adding price and product details will create a product page that customers can visit when they DM about your post.
            </p>
            
            <form onSubmit={(e) => { e.preventDefault(); handlePriceSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({...priceForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={priceForm.currency}
                    onChange={(e) => setPriceForm({...priceForm, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={priceForm.artistName}
                  onChange={(e) => setPriceForm({...priceForm, artistName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name or artist name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={priceForm.category}
                    onChange={(e) => setPriceForm({...priceForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Handcrafted">Handcrafted</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Pottery">Pottery</option>
                    <option value="Textiles">Textiles</option>
                    <option value="Woodwork">Woodwork</option>
                    <option value="Metalwork">Metalwork</option>
                    <option value="Painting">Painting</option>
                    <option value="Sculpture">Sculpture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materials
                  </label>
                  <input
                    type="text"
                    value={priceForm.materials}
                    onChange={(e) => setPriceForm({...priceForm, materials: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Clay, Wood, Silver"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={priceForm.dimensions}
                  onChange={(e) => setPriceForm({...priceForm, dimensions: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10cm x 15cm, 6 inches tall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={priceForm.description}
                  onChange={(e) => setPriceForm({...priceForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the product..."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">What happens next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Post will be shared to Instagram with pricing info</li>
                  <li>• A product page will be created automatically</li>
                  <li>• Customers can DM you or visit the product page</li>
                  <li>• You can manage inquiries through the dashboard</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceModal(false);
                    setPriceModalData(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInstagramSharing}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isInstagramSharing ? 'Posting...' : 'Post to Instagram'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
