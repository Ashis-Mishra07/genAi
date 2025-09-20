'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Send, Upload, Palette, Camera, Share2, Download, Copy, Info, Package, Plus, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ThemeSelector from '@/components/ui/theme-selector';
import ProfessionalPoster from '@/components/ui/canvas-poster-professional';

interface PosterTheme {
  id: string;
  name: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientColors: string[];
  fontFamily: string;
  layout: 'luxe' | 'ocean' | 'sunset' | 'forest' | 'royal';
  description: string;
}

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
    productStory: string;
  };
}

// Loading component for Suspense fallback
function ChatbotLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-orange-200">Loading chatbot...</p>
      </div>
    </div>
  );
}

// Main component that uses useSearchParams
function ChatbotContent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI-powered marketplace assistant. I\'m here to help you create stunning product posters for your artisan business! 🎨\n\n✨ **What I Create For You:**\n\n📸 **Product Showcase** - Your beautiful product image on the left\n� **Product Description** - Concise, focused details about your product on the right  \n🎨 **Professional Themes** - Choose from luxury, ocean, sunset, forest, or royal designs\n✨ **Premium Design** - Professional layouts with elegant typography\n\n**How It Works:**\n1. Upload your product image\n2. Tell me the product name\n3. Choose your favorite theme\n4. Get a stunning poster with description!\n\nLet\'s create something amazing together!',
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
  const [showProfessionalPoster, setShowProfessionalPoster] = useState(false);
  const [currentPosterData, setCurrentPosterData] = useState<{
    theme: PosterTheme;
    productName: string;
    productStory: string;
    imageFile: File;
  } | null>(null);
  
  // Artisan information for product creation
  const [artisanInfo, setArtisanInfo] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Handle poster creation mode from admin chat
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'poster-creation') {
      const imageDataStr = sessionStorage.getItem('posterImageData');
      if (imageDataStr) {
        try {
          const imageData = JSON.parse(imageDataStr);
          console.log('Poster creation image data:', imageData);
          
          // Fetch artisan information
          if (imageData.artisan_id) {
            console.log('Fetching info for artisan ID:', imageData.artisan_id);
            fetchArtisanInfo(imageData.artisan_id);
          } else {
            console.log('No artisan_id found in image data');
            // Set a default artisan info so the button still works
            setArtisanInfo({
              id: 'unknown',
              name: 'Artisan',
              email: ''
            });
          }
          
          // Create a welcome message for poster creation
          const posterWelcomeMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `🎨 **Poster Creation Mode Activated!**

I see you want to create a professional poster for the artisan's product image: **${imageData.filename}**

Let me help you create an amazing marketing poster! Here's what I need from you:

📝 **Product Name** - What should we call this product?
💰 **Price** - What's the selling price?
🎨 **Style Preference** - Any specific theme or colors?

The image is ready! Just tell me the product details and I'll create a stunning poster that will help the artisan sell better! ✨

💡 **Pro Tip**: Once the poster is ready, I can also help you create a product listing directly for the artisan!`,
            timestamp: new Date()
          };

          // Auto-load the image from URL
          fetch(imageData.url)
            .then(response => response.blob())
            .then(blob => {
              const file = new File([blob], imageData.filename, { type: 'image/jpeg' });
              setSelectedFile(file);
              
              // Add the poster creation message
              setMessages(prev => [...prev, posterWelcomeMessage]);
              
              // Clear the session storage
              sessionStorage.removeItem('posterImageData');
            })
            .catch(error => {
              console.error('Failed to load image:', error);
              // Still show the message even if image loading fails
              setMessages(prev => [...prev, posterWelcomeMessage]);
            });

        } catch (error) {
          console.error('Failed to parse image data:', error);
        }
      }
    }
  }, [searchParams]);

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
      // Generate enhanced story using Gemini API
      const storyResponse = await fetch('/api/mcp/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productName,
          prompt: `Create a concise, product-focused description for "${productName}". 
          Requirements:
          - Focus ONLY on the product itself - its features, materials, design, quality
          - Be terse and direct - maximum 2-3 short sentences
          - Describe what makes THIS specific product special
          - Mention tangible product qualities (materials, craftsmanship, functionality)
          - NO background stories, heritage, or emotional narratives
          - Sound professional but brief
          
          Example format: "Premium [material] construction with [specific features]. [Key benefit/quality]. [What makes it unique]."
          
          Keep it factual, product-specific, and concise.`
        }),
      });

      let productStory = "Premium quality construction with attention to detail. Designed for durability and functionality. Each piece showcases superior craftsmanship and materials.";
      
      if (storyResponse.ok) {
        const storyData = await storyResponse.json();
        productStory = storyData.content || productStory;
      }

      // Set up professional poster data
      setCurrentPosterData({
        theme,
        productName,
        productStory,
        imageFile: selectedFile
      });
      setShowProfessionalPoster(true);

    } catch (error) {
      console.error('Error creating poster:', error);
      setIsLoading(false);
    }
  };

  const handlePosterReady = (dataUrl: string) => {
    if (!currentPosterData) return;

    // Create message with the professional poster
    const posterMessage: Message = {
      id: (Date.now() + 2).toString(),
      type: 'assistant',
      content: `🎨 **Your Premium ${currentPosterData.theme.name} Poster is Ready!** ✨

This isn't just a poster - it's a **premium marketing masterpiece** crafted with professional design techniques:

🏆 **Ultra-High Resolution** - 3600x1800px for crystal-clear quality
📝 **Product-Focused Content** - Concise, direct description that highlights key features  
🌟 **Professional Visual Effects** - Advanced gradients, shadows, textures, and patterns
💎 **Sophisticated Typography** - Premium fonts with elegant text treatments
🎨 **Theme-Specific Artistry** - Unique visual elements tailored to your chosen style
📱 **Optimized for Social Media** - Perfect dimensions for Instagram, Facebook, and more

Your poster combines **artisan authenticity** with **marketing sophistication** - exactly what premium brands need to stand out in today's market!

Ready to **elevate your brand** and **attract discerning customers**? 🚀`,
      timestamp: new Date(),
      canvasPoster: {
        theme: currentPosterData.theme,
        productName: currentPosterData.productName,
        imageFile: currentPosterData.imageFile,
        dataUrl,
        productStory: currentPosterData.productStory
      }
    };

    setMessages(prev => [...prev, posterMessage]);
    setIsLoading(false);
    setShowProfessionalPoster(false);
    setCurrentPosterData(null);
    
    // Reset state
    setSelectedFile(null);
    setProductName('');
    setSelectedTheme(null);
  };

  // Advanced background drawing function
  const drawAdvancedBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    switch (theme.layout) {
      case 'luxe':
        // Sophisticated gradient with multiple stops
        const luxeGradient = ctx.createRadialGradient(width/3, height/3, 0, width/2, height/2, Math.max(width, height));
        luxeGradient.addColorStop(0, '#1a1a1a');
        luxeGradient.addColorStop(0.3, '#2d2d2d');
        luxeGradient.addColorStop(0.7, '#1a1a1a');
        luxeGradient.addColorStop(1, '#000000');
        ctx.fillStyle = luxeGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add subtle noise texture
        addNoiseTexture(ctx, width, height, 0.05);
        break;
        
      case 'ocean':
        const oceanGradient = ctx.createLinearGradient(0, 0, width, height);
        oceanGradient.addColorStop(0, '#001122');
        oceanGradient.addColorStop(0.3, '#002244');
        oceanGradient.addColorStop(0.7, '#003366');
        oceanGradient.addColorStop(1, '#004488');
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add wave patterns
        drawWavePatterns(ctx, width, height, theme.primaryColor);
        break;
        
      case 'sunset':
        const sunsetGradient = ctx.createLinearGradient(0, 0, width, height);
        sunsetGradient.addColorStop(0, '#1a0033');
        sunsetGradient.addColorStop(0.4, '#cc3366');
        sunsetGradient.addColorStop(0.8, '#ff6699');
        sunsetGradient.addColorStop(1, '#ffaa00');
        ctx.fillStyle = sunsetGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add sunburst effect
        drawSunburstEffect(ctx, width, height, theme.primaryColor);
        break;
        
      case 'forest':
        const forestGradient = ctx.createRadialGradient(width/4, height/4, 0, width/2, height/2, Math.max(width, height));
        forestGradient.addColorStop(0, '#2d4a2d');
        forestGradient.addColorStop(0.5, '#1a331a');
        forestGradient.addColorStop(1, '#0d1a0d');
        ctx.fillStyle = forestGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add organic patterns
        drawOrganicPatterns(ctx, width, height, theme.secondaryColor);
        break;
        
      case 'royal':
        const royalGradient = ctx.createLinearGradient(0, 0, width, height);
        royalGradient.addColorStop(0, '#2d1b69');
        royalGradient.addColorStop(0.5, '#4a148c');
        royalGradient.addColorStop(1, '#6a1b9a');
        ctx.fillStyle = royalGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add royal ornaments
        drawRoyalOrnaments(ctx, width, height, theme.primaryColor);
        break;
    }
  };

  // Advanced product showcase function
  const drawProductShowcase = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, leftWidth: number, height: number, theme: PosterTheme) => {
    const padding = 60;
    const showcaseWidth = leftWidth - padding * 2;
    const showcaseHeight = height - padding * 2;
    
    // Calculate image dimensions maintaining aspect ratio
    const imgAspect = img.width / img.height;
    let displayWidth = showcaseWidth * 0.8;
    let displayHeight = displayWidth / imgAspect;
    
    if (displayHeight > showcaseHeight * 0.8) {
      displayHeight = showcaseHeight * 0.8;
      displayWidth = displayHeight * imgAspect;
    }
    
    const imgX = (leftWidth - displayWidth) / 2;
    const imgY = (height - displayHeight) / 2;
    
    // Draw sophisticated shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 15;
    ctx.shadowOffsetY = 15;
    
    // Create gradient frame
    const frameGradient = ctx.createLinearGradient(imgX - 20, imgY - 20, imgX + displayWidth + 20, imgY + displayHeight + 20);
    frameGradient.addColorStop(0, theme.primaryColor + '40');
    frameGradient.addColorStop(0.5, theme.secondaryColor + '60');
    frameGradient.addColorStop(1, theme.primaryColor + '40');
    
    ctx.fillStyle = frameGradient;
    ctx.fillRect(imgX - 20, imgY - 20, displayWidth + 40, displayHeight + 40);
    
    ctx.restore();
    
    // Draw product image with rounded corners and border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, displayWidth, displayHeight, 20);
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, displayWidth, displayHeight);
    ctx.restore();
    
    // Add premium border
    ctx.strokeStyle = theme.primaryColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, displayWidth, displayHeight, 20);
    ctx.stroke();
    
    // Add highlight effect
    const highlight = ctx.createLinearGradient(imgX, imgY, imgX, imgY + displayHeight/3);
    highlight.addColorStop(0, 'rgba(255,255,255,0.3)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, displayWidth, displayHeight/3, 20);
    ctx.fill();
  };

  // Advanced story section function
  const drawStorySection = (ctx: CanvasRenderingContext2D, productName: string, story: string, rightStart: number, rightWidth: number, height: number, theme: PosterTheme) => {
    const padding = 60;
    const contentX = rightStart + padding;
    const contentWidth = rightWidth - padding * 2;
    
    // Draw product name with premium typography
    ctx.save();
    ctx.fillStyle = theme.primaryColor;
    ctx.font = `bold 48px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Add text shadow for depth
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    const titleLines = wrapText(ctx, productName.toUpperCase(), contentWidth);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, contentX, 80 + index * 60);
    });
    
    // Add decorative line under title
    ctx.shadowColor = 'transparent';
    const lineY = 80 + titleLines.length * 60 + 20;
    const lineGradient = ctx.createLinearGradient(contentX, lineY, contentX + contentWidth * 0.6, lineY);
    lineGradient.addColorStop(0, theme.primaryColor);
    lineGradient.addColorStop(0.7, theme.secondaryColor);
    lineGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(contentX, lineY);
    ctx.lineTo(contentX + contentWidth * 0.6, lineY);
    ctx.stroke();
    
    ctx.restore();
    
    // Draw story text with elegant typography and proper formatting
    ctx.save();
    ctx.fillStyle = theme.accentColor;
    ctx.font = `18px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const storyStartY = lineY + 60;
    const storyLines = wrapText(ctx, story, contentWidth - 60); // Increased padding to prevent overflow
    const lineHeight = 26;
    const maxStoryLines = Math.floor((height - storyStartY - 80) / lineHeight); // More bottom space reserved
    
    // Only display lines that fit within the canvas
    const displayLines = storyLines.slice(0, maxStoryLines);
    
    displayLines.forEach((line, index) => {
      // Add subtle text shadow for better readability
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(line, contentX + 30, storyStartY + index * lineHeight);
    });
    
    ctx.restore();
  };

  // Helper functions for advanced effects
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const addNoiseTexture = (ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * opacity * 255;
      data[i] += noise;     // Red
      data[i + 1] += noise; // Green
      data[i + 2] += noise; // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const drawWavePatterns = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    for (let y = 0; y < height; y += 80) {
      ctx.beginPath();
      for (let x = 0; x < width; x += 20) {
        const waveY = y + Math.sin(x * 0.02) * 20;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawSunburstEffect = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const centerX = width * 0.8;
    const centerY = height * 0.3;
    
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * 200,
        centerY + Math.sin(angle) * 200
      );
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawOrganicPatterns = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = color;
    
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 15 + 5;
      
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 1.5, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawRoyalOrnaments = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Corner ornaments
    const ornamentSize = 80;
    const positions = [
      { x: 50, y: 50 },
      { x: width - 50, y: 50 },
      { x: 50, y: height - 50 },
      { x: width - 50, y: height - 50 }
    ];
    
    positions.forEach(pos => {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ornamentSize - i * 20, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    ctx.restore();
  };

  const drawTextureOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Add subtle texture based on theme
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = theme.primaryColor;
    
    for (let x = 0; x < width; x += 4) {
      for (let y = 0; y < height; y += 4) {
        if (Math.random() > 0.7) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    
    ctx.restore();
  };

  const drawPremiumAccents = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Add corner accents
    ctx.save();
    ctx.strokeStyle = theme.primaryColor + '60';
    ctx.lineWidth = 3;
    
    // Top left corner
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(80, 30);
    ctx.moveTo(30, 30);
    ctx.lineTo(30, 80);
    ctx.stroke();
    
    // Top right corner
    ctx.beginPath();
    ctx.moveTo(width - 30, 30);
    ctx.lineTo(width - 80, 30);
    ctx.moveTo(width - 30, 30);
    ctx.lineTo(width - 30, 80);
    ctx.stroke();
    
    // Bottom left corner
    ctx.beginPath();
    ctx.moveTo(30, height - 30);
    ctx.lineTo(80, height - 30);
    ctx.moveTo(30, height - 30);
    ctx.lineTo(30, height - 80);
    ctx.stroke();
    
    // Bottom right corner
    ctx.beginPath();
    ctx.moveTo(width - 30, height - 30);
    ctx.lineTo(width - 80, height - 30);
    ctx.moveTo(width - 30, height - 30);
    ctx.lineTo(width - 30, height - 80);
    ctx.stroke();
    
    ctx.restore();
  };

  const downloadPoster = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchArtisanInfo = async (artisanId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching artisan info for ID:', artisanId);
      
      // Try multiple approaches to get artisan info
      
      // Method 1: Direct API call to get artisan conversations
      const response = await fetch(`/api/admin-chat`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin chat response:', data);
        
        // Find the specific artisan in conversations
        if (data.conversations && data.conversations.length > 0) {
          const artisanConversation = data.conversations.find((conv: any) => 
            conv.artisan_id === artisanId
          );
          
          if (artisanConversation) {
            console.log('Found artisan conversation:', artisanConversation);
            setArtisanInfo({
              id: artisanId,
              name: artisanConversation.artisan_name || 'Unknown Artisan',
              email: artisanConversation.artisan_email || ''
            });
            return;
          }
        }
      }
      
      // Method 2: Fallback - set basic info with ID
      console.log('Using fallback artisan info');
      setArtisanInfo({
        id: artisanId,
        name: `Artisan ${artisanId.slice(-4)}`, // Use last 4 chars of ID
        email: ''
      });
      
    } catch (error) {
      console.error('Failed to fetch artisan info:', error);
      // Still set basic info so the button works
      setArtisanInfo({
        id: artisanId,
        name: 'Artisan',
        email: ''
      });
    }
  };

  const createProductForArtisan = async (posterData: any, price: string) => {
    if (!artisanInfo) {
      // Try to get artisan info from sessionStorage as fallback
      const imageDataStr = sessionStorage.getItem('posterImageData');
      if (imageDataStr) {
        try {
          const imageData = JSON.parse(imageDataStr);
          if (imageData.artisan_id) {
            // Set basic artisan info and proceed
            setArtisanInfo({
              id: imageData.artisan_id,
              name: 'Artisan',
              email: ''
            });
          }
        } catch (e) {
          console.error('Failed to parse stored image data:', e);
        }
      }
      
      if (!artisanInfo) {
        alert('Unable to identify the artisan. Please try going back to the chat and creating the poster again.');
        return;
      }
    }

    try {
      console.log('Creating product for artisan:', artisanInfo);
      const token = localStorage.getItem('accessToken');
      
      // Create product data
      const productData = {
        name: posterData.productName || 'Artisan Product',
        description: posterData.productStory || `Beautiful ${posterData.productName || 'handcrafted item'} created by ${artisanInfo.name}`,
        price: parseFloat(price) || 0,
        category: 'Handmade',
        imageUrl: posterData.dataUrl, // Use the poster image directly
        artisanName: artisanInfo.name,
        artisanId: artisanInfo.id,
        createdByAdmin: true
      };

      console.log('Product data to create:', productData);

      const createResponse = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const responseData = await createResponse.json();
      console.log('Product creation response:', responseData);

      if (createResponse.ok) {
        alert(`🎉 Product "${productData.name}" created successfully for ${artisanInfo.name}!\n\nPrice: $${price}\nThe product is now live with your beautiful poster!`);
        
        // Optionally send success message to artisan
        try {
          const successMessage = `🎉 **Product Created Successfully!**

✨ I've created a product listing for you:

📦 **Product Name**: ${productData.name}
💰 **Price**: $${price}
🎨 **Marketing Poster**: Professional poster included
👨‍🎨 **Artisan**: ${artisanInfo.name}

Your product is now live and ready for customers! The beautiful poster we created together will help attract buyers. 🌟`;

          await fetch('/api/admin-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              message: successMessage,
              recipient_id: artisanInfo.id
            })
          });
        } catch (msgError) {
          console.log('Note: Could not send notification to artisan, but product was created successfully');
        }
        
      } else {
        throw new Error(responseData.error || 'Failed to create product');
      }

    } catch (error) {
      console.error('Failed to create product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to create product: ${errorMessage}. Please try again.`);
    }
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
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-gray-900 to-orange-900">
      {/* Professional Poster Creator */}
      {showProfessionalPoster && currentPosterData && (
        <ProfessionalPoster
          theme={currentPosterData.theme}
          productName={currentPosterData.productName}
          productStory={currentPosterData.productStory}
          imageFile={currentPosterData.imageFile}
          onPosterReady={handlePosterReady}
        />
      )}
      
      {/* Header */}
      <div className="flex-shrink-0 p-6 bg-black/90 backdrop-blur-sm border-b border-orange-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Palette className="w-6 h-6 text-black font-bold" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-orange-400">
              {searchParams.get('mode') === 'poster-creation' ? '🎨 Admin Poster Creator' : 'AI Poster Creator'}
            </h1>
            <p className="text-sm text-orange-200">
              {searchParams.get('mode') === 'poster-creation' 
                ? artisanInfo 
                  ? `Creating marketing poster for ${artisanInfo.name}` 
                  : 'Creating marketing poster for artisan'
                : 'Create stunning storytelling posters'}
            </p>
            {/* Artisan Info Badge */}
            {searchParams.get('mode') === 'poster-creation' && artisanInfo && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full w-fit">
                <User className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300 font-medium">
                  Helping: {artisanInfo.name}
                </span>
              </div>
            )}
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
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-black font-medium ml-12 shadow-lg shadow-orange-500/30'
                  : 'bg-gray-800/90 backdrop-blur-sm text-orange-100 mr-12 border border-orange-500/20 shadow-lg'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* Canvas Poster Display */}
              {message.canvasPoster && (
                <div className="mt-4 p-4 bg-black/60 backdrop-blur-sm rounded-xl border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-orange-300">
                      {message.canvasPoster.theme.name} Theme
                    </span>
                  </div>
                  
                  <div className="bg-gray-900/80 p-4 rounded-lg shadow-lg border border-orange-500/20">
                    <img
                      src={message.canvasPoster.dataUrl}
                      alt={`Poster for ${message.canvasPoster.productName}`}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-2xl shadow-orange-500/20 border border-orange-500/30"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => downloadPoster(
                        message.canvasPoster!.dataUrl,
                        `${message.canvasPoster!.productName}-poster.png`
                      )}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-black font-medium rounded-lg hover:from-orange-500 hover:to-orange-400 transition-all duration-200 text-sm shadow-lg shadow-orange-500/30"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(message.canvasPoster!.dataUrl)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-orange-200 rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm border border-orange-500/30"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    
                    {/* Create Product Button - only show in poster creation mode */}
                    {searchParams.get('mode') === 'poster-creation' && (
                      <button
                        onClick={() => {
                          if (!artisanInfo) {
                            alert('Artisan information is still loading. Please wait a moment and try again.');
                            return;
                          }
                          const price = prompt('Enter the product price (in $):', '25');
                          if (price && message.canvasPoster) {
                            createProductForArtisan(message.canvasPoster, price);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium rounded-lg hover:from-green-500 hover:to-emerald-400 transition-all duration-200 text-sm shadow-lg shadow-green-500/30"
                      >
                        <Package className="w-4 h-4" />
                        {artisanInfo ? `Create Product for ${artisanInfo.name}` : 'Create Product'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/90 backdrop-blur-sm text-orange-100 p-4 rounded-2xl mr-12 border border-orange-500/20 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-orange-200 text-sm ml-2">Creating your stunning poster...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-orange-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-orange-400">Choose Your Theme</h2>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="text-orange-300 hover:text-orange-400 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-500/20 transition-all duration-200"
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
      <div className="flex-shrink-0 p-6 bg-black/90 backdrop-blur-sm border-t border-orange-500/30">
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
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-black font-bold rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-400/40 hover:scale-105"
          >
            <Upload className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedFile && !productName ? "Enter product name..." : "Type your message..."}
            className="flex-1 px-4 py-3 bg-gray-800/90 border border-orange-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-orange-100 placeholder-orange-300/70 backdrop-blur-sm"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-black font-bold rounded-xl hover:from-orange-500 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-400/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        
        {selectedFile && (
          <div className="mt-3 flex items-center gap-2 text-sm text-orange-200 bg-gray-800/50 p-3 rounded-lg border border-orange-500/20">
            <Camera className="w-4 h-4 text-orange-400" />
            <span>Image uploaded: <span className="text-orange-300 font-medium">{selectedFile.name}</span></span>
            {productName && (
              <>
                <span className="mx-2 text-orange-500">•</span>
                <span>Product: <span className="text-orange-300 font-medium">{productName}</span></span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary
export default function ChatbotPage() {
  return (
    <Suspense fallback={<ChatbotLoading />}>
      <ChatbotContent />
    </Suspense>
  );
}
