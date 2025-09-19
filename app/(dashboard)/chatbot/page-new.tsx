'use client';

import { useState, useRef } from 'react';
import { Send, Upload, Palette, Camera, Share2, Download, Copy, Info } from 'lucide-react';
import CanvasPoster, { PosterTheme } from '@/components/ui/canvas-poster';
import ThemeSelector from '@/components/ui/theme-selector';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  canvasPoster?: {
    theme: PosterTheme;
    productName: string;
    imageFile: File;
    dataUrl: string;
  };
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI-powered marketplace assistant. I\'m here to help you create beautiful posters for your artisan business! 🎨\n\nTo create a poster:\n1. Upload a product image\n2. Tell me the product name\n3. Choose from beautiful themes\n4. Get your poster with "DM to buy" message!\n\nLet\'s get started!',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Theme selection state
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<PosterTheme | null>(null);
  const [productName, setProductName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      // Add user message with uploaded image
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: `Uploaded image: ${file.name}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Show assistant response asking for product name
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Great! I can see your product image. Now please tell me the product name so I can create a beautiful poster for you.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantResponse]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // If we have an image but no product name, treat input as product name
    if (selectedFile && !productName) {
      setProductName(inputValue.trim());
      setShowThemeSelector(true);
      
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Perfect! Now please choose a theme for your "${inputValue.trim()}" poster:`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      return;
    }

    // Regular chat response
    setIsLoading(true);
    
    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I understand! To create a poster, please upload an image of your product first using the upload button, then tell me the product name.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleThemeSelect = async (theme: PosterTheme) => {
    if (!selectedFile || !productName) return;

    setSelectedTheme(theme);
    setShowThemeSelector(false);
    setIsLoading(true);

    try {
      // Create canvas poster
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size
      canvas.width = 400;
      canvas.height = 400;

      // Load and draw the image
      const img = new Image();
      img.onload = () => {
        // Create poster using CanvasPoster logic
        const posterCanvas = document.createElement('canvas');
        const posterCtx = posterCanvas.getContext('2d')!;
        posterCanvas.width = 400;
        posterCanvas.height = 400;

        // Draw background
        const gradient = posterCtx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, theme.primaryColor);
        gradient.addColorStop(1, theme.secondaryColor);
        posterCtx.fillStyle = gradient;
        posterCtx.fillRect(0, 0, 400, 400);

        // Draw product image in center
        const imageSize = 180;
        const imageX = (400 - imageSize) / 2;
        const imageY = 80;
        
        posterCtx.save();
        posterCtx.beginPath();
        posterCtx.roundRect(imageX, imageY, imageSize, imageSize, 10);
        posterCtx.clip();
        posterCtx.drawImage(img, imageX, imageY, imageSize, imageSize);
        posterCtx.restore();

        // Draw product name
        posterCtx.fillStyle = theme.primaryColor;
        posterCtx.font = 'bold 20px Arial';
        posterCtx.textAlign = 'center';
        posterCtx.fillText(productName, 200, 300);

        // Draw "DM to buy" button
        const buttonWidth = 120;
        const buttonHeight = 40;
        const buttonX = (400 - buttonWidth) / 2;
        const buttonY = 320;

        posterCtx.fillStyle = theme.secondaryColor;
        posterCtx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        posterCtx.fillStyle = '#ffffff';
        posterCtx.font = 'bold 14px Arial';
        posterCtx.textAlign = 'center';
        posterCtx.fillText('DM to buy', 200, 345);

        // Convert to data URL
        const dataUrl = posterCanvas.toDataURL('image/png');

        // Create message with poster
        const posterMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `Here's your beautiful ${theme.name} poster for "${productName}"! 🎨\n\nYour poster is ready with the "DM to buy" message. You can download it or share it directly!`,
          timestamp: new Date(),
          canvasPoster: {
            theme,
            productName,
            imageFile: selectedFile,
            dataUrl
          }
        };

        setMessages(prev => [...prev, posterMessage]);
        setIsLoading(false);
        
        // Reset state
        setSelectedFile(null);
        setProductName('');
        setSelectedTheme(null);
      };
      
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error creating poster:', error);
      setIsLoading(false);
    }
  };

  const downloadPoster = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      alert('Poster copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy poster');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">AI Poster Creator</h1>
            <p className="text-sm text-gray-600">Create beautiful posters with themes</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-12'
                  : 'bg-white shadow-sm border border-gray-100 mr-12'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Canvas Poster Display */}
              {message.canvasPoster && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-700">
                      {message.canvasPoster.theme.name} Theme
                    </span>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <img
                      src={message.canvasPoster.dataUrl}
                      alt={`Poster for ${message.canvasPoster.productName}`}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => downloadPoster(
                        message.canvasPoster!.dataUrl,
                        `${message.canvasPoster!.productName}-poster.png`
                      )}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(message.canvasPoster!.dataUrl)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border border-gray-100 p-4 rounded-2xl mr-12">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-gray-500 text-sm ml-2">Creating your poster...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Choose a Theme</h2>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <ThemeSelector
              onThemeSelect={handleThemeSelect}
              productName={productName}
              selectedTheme={selectedTheme}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-t border-purple-100">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Upload className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedFile && !productName ? "Enter product name..." : "Type your message..."}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {selectedFile && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Camera className="w-4 h-4" />
            <span>Image uploaded: {selectedFile.name}</span>
            {productName && (
              <>
                <span className="mx-2">•</span>
                <span>Product: {productName}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
