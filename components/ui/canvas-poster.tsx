'use client';

import React, { useRef, useEffect } from 'react';

export interface PosterTheme {
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

export const POSTER_THEMES: PosterTheme[] = [
  {
    id: 'luxe-gold',
    name: 'Luxe Gold',
    backgroundColor: '#0a0a0a',
    primaryColor: '#FFD700',
    secondaryColor: '#FFA500',
    accentColor: '#FFFFFF',
    gradientColors: ['#0a0a0a', '#1a1a1a', '#2a2a2a'],
    fontFamily: 'Georgia, serif',
    layout: 'luxe',
    description: 'Premium luxury design with gold accents'
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    backgroundColor: '#001a2e',
    primaryColor: '#4fc3f7',
    secondaryColor: '#81c784',
    accentColor: '#ffffff',
    gradientColors: ['#001a2e', '#004d70', '#0078a3'],
    fontFamily: 'Montserrat, sans-serif',
    layout: 'ocean',
    description: 'Fresh ocean-inspired design'
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    backgroundColor: '#2d1b69',
    primaryColor: '#ff6b6b',
    secondaryColor: '#ffa726',
    accentColor: '#ffffff',
    gradientColors: ['#2d1b69', '#c62828', '#ff8f00'],
    fontFamily: 'Playfair Display, serif',
    layout: 'sunset',
    description: 'Warm sunset colors with elegant typography'
  },
  {
    id: 'forest-zen',
    name: 'Forest Zen',
    backgroundColor: '#1b5e20',
    primaryColor: '#81c784',
    secondaryColor: '#a5d6a7',
    accentColor: '#ffffff',
    gradientColors: ['#1b5e20', '#2e7d32', '#4caf50'],
    fontFamily: 'Lora, serif',
    layout: 'forest',
    description: 'Peaceful forest-inspired design'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    backgroundColor: '#4a148c',
    primaryColor: '#ba68c8',
    secondaryColor: '#ce93d8',
    accentColor: '#ffffff',
    gradientColors: ['#4a148c', '#7b1fa2', '#9c27b0'],
    fontFamily: 'Crimson Text, serif',
    layout: 'royal',
    description: 'Regal purple theme with sophisticated styling'
  }
];

interface CanvasPosterProps {
  productName: string;
  productImage: string;
  productStory?: string;
  theme: PosterTheme;
  width?: number;
  height?: number;
  showDMButton?: boolean;
}

export default function CanvasPoster({ 
  productName, 
  productImage, 
  productStory = "Handcrafted with love and tradition, this unique piece tells a story of cultural heritage and artisan mastery. Each detail reflects generations of skill passed down through time.",
  theme, 
  width = 800, 
  height = 400,
  showDMButton = true 
}: CanvasPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to wrap text
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

  // Draw beautiful gradient background
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    
    switch (theme.layout) {
      case 'luxe':
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a1a');
        gradient.addColorStop(1, '#2a2a2a');
        break;
      case 'ocean':
        gradient.addColorStop(0, '#001a2e');
        gradient.addColorStop(0.5, '#004d70');
        gradient.addColorStop(1, '#0078a3');
        break;
      case 'sunset':
        gradient.addColorStop(0, '#2d1b69');
        gradient.addColorStop(0.5, '#c62828');
        gradient.addColorStop(1, '#ff8f00');
        break;
      case 'forest':
        gradient.addColorStop(0, '#1b5e20');
        gradient.addColorStop(0.5, '#2e7d32');
        gradient.addColorStop(1, '#4caf50');
        break;
      case 'royal':
        gradient.addColorStop(0, '#4a148c');
        gradient.addColorStop(0.5, '#7b1fa2');
        gradient.addColorStop(1, '#9c27b0');
        break;
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  // Draw decorative patterns
  const drawPatterns = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    
    switch (theme.layout) {
      case 'luxe':
        // Draw subtle diamond pattern
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
          for (let j = 0; j < height; j += 50) {
            ctx.beginPath();
            ctx.moveTo(i + 25, j);
            ctx.lineTo(i + 50, j + 25);
            ctx.lineTo(i + 25, j + 50);
            ctx.lineTo(i, j + 25);
            ctx.closePath();
            ctx.stroke();
          }
        }
        break;
      case 'ocean':
        // Draw wave pattern
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 2;
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 10) {
            const waveY = y + Math.sin(x * 0.02) * 10;
            if (x === 0) ctx.moveTo(x, waveY);
            else ctx.lineTo(x, waveY);
          }
          ctx.stroke();
        }
        break;
      case 'sunset':
        // Draw radiating lines
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 1;
        const centerX = width / 2;
        const centerY = height / 2;
        for (let i = 0; i < 24; i++) {
          const angle = (i * Math.PI * 2) / 24;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + Math.cos(angle) * Math.max(width, height),
            centerY + Math.sin(angle) * Math.max(width, height)
          );
          ctx.stroke();
        }
        break;
      case 'forest':
        // Draw leaf pattern
        ctx.fillStyle = theme.primaryColor;
        for (let i = 0; i < width; i += 60) {
          for (let j = 0; j < height; j += 60) {
            ctx.beginPath();
            ctx.ellipse(i + 30, j + 30, 8, 15, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'royal':
        // Draw ornate pattern
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 80) {
          for (let j = 0; j < height; j += 80) {
            ctx.beginPath();
            ctx.arc(i + 40, j + 40, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(i + 40, j + 40, 30, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        break;
    }
    
    ctx.restore();
  };

  // Draw stylish product title
  const drawProductTitle = (ctx: CanvasRenderingContext2D, title: string, x: number, y: number, maxWidth: number) => {
    ctx.save();
    
    // Title shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Title text
    ctx.fillStyle = theme.primaryColor;
    ctx.font = `bold 28px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const lines = wrapText(ctx, title, maxWidth);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * 35);
    });
    
    // Decorative underline
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = theme.secondaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + lines.length * 35 + 10);
    ctx.lineTo(x + Math.min(ctx.measureText(lines[0] || title).width, maxWidth * 0.6), y + lines.length * 35 + 10);
    ctx.stroke();
    
    ctx.restore();
  };

  // Draw beautiful story text
  const drawStoryText = (ctx: CanvasRenderingContext2D, story: string, x: number, y: number, maxWidth: number, maxHeight: number) => {
    ctx.save();
    
    ctx.fillStyle = theme.accentColor;
    ctx.font = `16px ${theme.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const lines = wrapText(ctx, story, maxWidth);
    const lineHeight = 24;
    const maxLines = Math.floor(maxHeight / lineHeight);
    
    lines.slice(0, maxLines).forEach((line, index) => {
      // Add subtle text shadow for readability
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(line, x, y + index * lineHeight);
    });
    
    ctx.restore();
  };

  // Draw stylish DM button
  const drawDMButton = (ctx: CanvasRenderingContext2D, x: number, y: number, maxWidth: number) => {
    ctx.save();
    
    const buttonWidth = Math.min(180, maxWidth * 0.6);
    const buttonHeight = 50;
    const buttonX = x;
    
    // Button shadow
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Button background gradient
    const buttonGradient = ctx.createLinearGradient(buttonX, y, buttonX, y + buttonHeight);
    buttonGradient.addColorStop(0, theme.secondaryColor);
    buttonGradient.addColorStop(1, theme.primaryColor);
    
    ctx.fillStyle = buttonGradient;
    ctx.fillRect(buttonX, y, buttonWidth, buttonHeight);
    
    // Button border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(buttonX, y, buttonWidth, buttonHeight);
    
    // // Button text
    // ctx.fillStyle = theme.accentColor;
    // ctx.font = `bold 18px ${theme.fontFamily}`;
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle';
    // ctx.fillText('💬 DM to Buy', buttonX + buttonWidth / 2, y + buttonHeight / 2);
    
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPoster = async () => {
      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw beautiful background
      drawBackground(ctx);
      
      // Add decorative patterns
      drawPatterns(ctx);

      // Load and draw product image on the left side
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = productImage;
        });

        // Left side for product image (45% of width)
        const leftWidth = width * 0.45;
        const imageSize = Math.min(leftWidth * 0.75, height * 0.75);
        const imageX = (leftWidth - imageSize) / 2;
        const imageY = (height - imageSize) / 2;

        // Draw elegant image frame with shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // Frame background
        ctx.fillStyle = theme.accentColor + '20';
        ctx.fillRect(imageX - 15, imageY - 15, imageSize + 30, imageSize + 30);
        
        ctx.restore();
        
        // Draw product image with rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imageX, imageY, imageSize, imageSize, 12);
        ctx.clip();
        ctx.drawImage(img, imageX, imageY, imageSize, imageSize);
        ctx.restore();

        // Add elegant border
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(imageX, imageY, imageSize, imageSize, 12);
        ctx.stroke();

      } catch (error) {
        console.error('Failed to load image:', error);
        // Draw beautiful placeholder
        const leftWidth = width * 0.45;
        const imageSize = Math.min(leftWidth * 0.75, height * 0.75);
        const imageX = (leftWidth - imageSize) / 2;
        const imageY = (height - imageSize) / 2;
        
        ctx.fillStyle = theme.primaryColor + '30';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        
        ctx.fillStyle = theme.primaryColor;
        ctx.font = 'bold 18px ' + theme.fontFamily;
        ctx.textAlign = 'center';
        ctx.fillText('Product Image', imageX + imageSize/2, imageY + imageSize/2);
      }

      // Right side for story and details (55% of width)
      const rightX = width * 0.45;
      const rightWidth = width * 0.55;
      const contentX = rightX + 30;
      const contentWidth = rightWidth - 60;

      // Draw product name with beautiful typography
      drawProductTitle(ctx, productName, contentX, 40, contentWidth);

      // Draw story text with elegant formatting
      drawStoryText(ctx, productStory, contentX, 120, contentWidth, height - 200);

      // Draw "DM to buy" button at bottom
      if (showDMButton) {
        drawDMButton(ctx, contentX, height - 70, contentWidth);
      }
    };

    drawPoster();
  }, [productName, productImage, productStory, theme, width, height, showDMButton]);

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full h-auto rounded-lg shadow-lg"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}
