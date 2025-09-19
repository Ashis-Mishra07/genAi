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
  layout: 'luxe' | 'neon' | 'marble' | 'cosmic' | 'glass';
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
    description: 'Premium luxury design with gold accents and shadows'
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    backgroundColor: '#0d0221',
    primaryColor: '#00ffff',
    secondaryColor: '#ff00ff',
    accentColor: '#ffffff',
    gradientColors: ['#0d0221', '#1a0933', '#2d1b69'],
    fontFamily: 'Arial, sans-serif',
    layout: 'neon',
    description: 'Futuristic cyberpunk design with neon glows'
  },
  {
    id: 'marble-white',
    name: 'Marble Elite',
    backgroundColor: '#f8f9fa',
    primaryColor: '#2c3e50',
    secondaryColor: '#95a5a6',
    accentColor: '#e74c3c',
    gradientColors: ['#f8f9fa', '#ecf0f1', '#bdc3c7'],
    fontFamily: 'Playfair Display, serif',
    layout: 'marble',
    description: 'Sophisticated marble texture with elegant typography'
  },
  {
    id: 'cosmic-purple',
    name: 'Cosmic Dreams',
    backgroundColor: '#1a0033',
    primaryColor: '#9d4edd',
    secondaryColor: '#c77dff',
    accentColor: '#ffffff',
    gradientColors: ['#1a0033', '#3c096c', '#5a189a', '#7b2cbf'],
    fontFamily: 'Montserrat, sans-serif',
    layout: 'cosmic',
    description: 'Space-inspired design with cosmic gradients'
  },
  {
    id: 'glass-modern',
    name: 'Glass Modern',
    backgroundColor: '#f0f2f5',
    primaryColor: '#1c1c1e',
    secondaryColor: '#007aff',
    accentColor: '#ff3b30',
    gradientColors: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.5)'],
    fontFamily: 'SF Pro Display, system-ui, sans-serif',
    layout: 'glass',
    description: 'Modern glassmorphism design with blur effects'
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
  productStory = "Handcrafted with love and tradition, this unique piece tells a story of cultural heritage and artisan mastery.",
  theme, 
  width = 800, 
  height = 400,
  showDMButton = true 
}: CanvasPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawPoster = async () => {
      // Set canvas size to landscape for story layout
      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw beautiful gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (theme.gradientColors && theme.gradientColors.length >= 3) {
        gradient.addColorStop(0, theme.gradientColors[0]);
        gradient.addColorStop(0.5, theme.gradientColors[1]);
        gradient.addColorStop(1, theme.gradientColors[2]);
      } else {
        gradient.addColorStop(0, theme.backgroundColor);
        gradient.addColorStop(1, theme.primaryColor);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle pattern overlay based on theme
      addPatternOverlay(ctx, width, height, theme);

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
        const imageSize = Math.min(leftWidth * 0.75, height * 0.7);
        const imageX = (leftWidth - imageSize) / 2;
        const imageY = (height - imageSize) / 2;

        // Draw elegant image frame with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        ctx.fillStyle = theme.accentColor;
        ctx.fillRect(imageX - 15, imageY - 15, imageSize + 30, imageSize + 30);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw product image with rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imageX, imageY, imageSize, imageSize, 12);
        ctx.clip();
        ctx.drawImage(img, imageX, imageY, imageSize, imageSize);
        ctx.restore();

        // Add subtle border
        ctx.strokeStyle = theme.primaryColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(imageX, imageY, imageSize, imageSize, 12);
        ctx.stroke();

      } catch (error) {
        console.error('Failed to load image:', error);
        // Draw beautiful placeholder
        const leftWidth = width * 0.45;
        const imageSize = Math.min(leftWidth * 0.75, height * 0.7);
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
      const contentX = rightX + 40;
      const contentWidth = rightWidth - 80;

      // Draw product name with beautiful typography
      drawStylishProductTitle(ctx, productName, contentX, 50, contentWidth, theme);

      // Draw story text with elegant formatting
      drawBeautifulStoryText(ctx, productStory, contentX, 120, contentWidth, height - 200, theme);

      // Draw "DM to buy" button at bottom
      if (showDMButton) {
        drawStylishDMButton(ctx, contentX, height - 80, contentWidth, theme);
      }

      // Add decorative flourishes
      drawDecorativeFlourishes(ctx, width, height, theme);
    };
                centerX - drawWidth / 2 - frameWidth,
                centerY - drawHeight / 2 - frameWidth,
                drawWidth + frameWidth * 2,
                drawHeight + frameWidth * 2
              );
              
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              break;
              
            case 'neon':
              // Neon glow effect
              ctx.shadowColor = theme.primaryColor;
              ctx.shadowBlur = 40;
              break;
              
            case 'marble':
              // Elegant shadow
              ctx.shadowColor = 'rgba(0,0,0,0.3)';
              ctx.shadowBlur = 20;
              ctx.shadowOffsetX = 5;
              ctx.shadowOffsetY = 5;
              break;
              
            case 'cosmic':
              // Cosmic energy ring
              ctx.strokeStyle = theme.primaryColor;
              ctx.lineWidth = 4;
              ctx.globalAlpha = 0.8;
              ctx.beginPath();
              ctx.arc(centerX, centerY, Math.max(drawWidth, drawHeight) / 2 + 20, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1;
              break;
              
            case 'glass':
              // Glass reflection
              ctx.shadowColor = 'rgba(0,0,0,0.2)';
              ctx.shadowBlur = 15;
              ctx.shadowOffsetY = 8;
              break;
          }
          
          // Draw product image
          ctx.drawImage(
            img,
            centerX - drawWidth / 2,
            centerY - drawHeight / 2,
            drawWidth,
            drawHeight
          );

          // Add glass reflection overlay for glass theme
          if (theme.layout === 'glass') {
            const reflectionGradient = ctx.createLinearGradient(
              centerX - drawWidth / 2,
              centerY - drawHeight / 2,
              centerX - drawWidth / 2,
              centerY - drawHeight / 2 + drawHeight / 3
            );
            reflectionGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
            reflectionGradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.fillStyle = reflectionGradient;
            ctx.fillRect(
              centerX - drawWidth / 2,
              centerY - drawHeight / 2,
              drawWidth,
              drawHeight / 3
            );
          }

          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Draw product name
          drawProductName(ctx, productName, theme, width, height);
          
          // Draw DM button if enabled
          if (showDMButton) {
            drawDMButton(ctx, theme, width, height);
          }
        };
        img.src = productImage;
      } catch (error) {
        console.error('Error loading product image:', error);
        // Draw placeholder if image fails to load
        drawImagePlaceholder(ctx, theme, width, height);
        drawProductName(ctx, productName, theme, width, height);
        if (showDMButton) {
          drawDMButton(ctx, theme, width, height);
        }
      }
    };

    drawPoster();
  }, [productName, productImage, theme, width, height, showDMButton]);

  return (
    <canvas 
      ref={canvasRef} 
      className="border rounded-lg shadow-lg max-w-full h-auto"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

function drawBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  switch (theme.layout) {
    case 'luxe':
      drawLuxeBackground(ctx, theme, width, height);
      break;
    case 'neon':
      drawNeonBackground(ctx, theme, width, height);
      break;
    case 'marble':
      drawMarbleBackground(ctx, theme, width, height);
      break;
    case 'cosmic':
      drawCosmicBackground(ctx, theme, width, height);
      break;
    case 'glass':
      drawGlassBackground(ctx, theme, width, height);
      break;
  }
}

function drawLuxeBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Rich black gradient with subtle gold highlights
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(0.6, '#0a0a0a');
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add luxury texture overlay
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = theme.primaryColor;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function drawNeonBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Dark cyberpunk gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.gradientColors[0]);
  gradient.addColorStop(0.5, theme.gradientColors[1]);
  gradient.addColorStop(1, theme.gradientColors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add grid pattern
  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.2;
  
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawMarbleBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Elegant marble texture
  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Create marble veins
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = theme.secondaryColor;
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    
    for (let j = 0; j < 5; j++) {
      ctx.quadraticCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCosmicBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Cosmic space gradient
  const gradient = ctx.createRadialGradient(width/3, height/3, 0, width/2, height/2, Math.max(width, height));
  theme.gradientColors.forEach((color, index) => {
    gradient.addColorStop(index / (theme.gradientColors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    ctx.globalAlpha = Math.random();
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function drawGlassBackground(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Clean glass background
  ctx.fillStyle = theme.backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add glass reflection effect
  const gradient = ctx.createLinearGradient(0, 0, width, height/3);
  gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height/3);
}

function drawDecorations(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  switch (theme.layout) {
    case 'luxe':
      drawLuxeDecorations(ctx, theme, width, height);
      break;
    case 'neon':
      drawNeonDecorations(ctx, theme, width, height);
      break;
    case 'marble':
      drawMarbleDecorations(ctx, theme, width, height);
      break;
    case 'cosmic':
      drawCosmicDecorations(ctx, theme, width, height);
      break;
    case 'glass':
      drawGlassDecorations(ctx, theme, width, height);
      break;
  }
}

function drawLuxeDecorations(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Elegant gold borders with ornate corners
  const borderWidth = 6;
  const cornerSize = 40;
  
  // Main border
  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = borderWidth;
  ctx.shadowColor = theme.primaryColor;
  ctx.shadowBlur = 20;
  ctx.strokeRect(borderWidth/2, borderWidth/2, width - borderWidth, height - borderWidth);
  
  // Ornate corners
  ctx.fillStyle = theme.primaryColor;
  const corners = [
    [borderWidth, borderWidth],
    [width - borderWidth, borderWidth],
    [borderWidth, height - borderWidth],
    [width - borderWidth, height - borderWidth]
  ];
  
  corners.forEach(([x, y]) => {
    ctx.save();
    ctx.translate(x, y);
    drawOrnateCorner(ctx, cornerSize);
    ctx.restore();
  });
  
  ctx.shadowBlur = 0;
}

function drawNeonDecorations(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Glowing neon borders
  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 4;
  ctx.shadowColor = theme.primaryColor;
  ctx.shadowBlur = 30;
  
  // Outer glow
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner accent lines
  ctx.strokeStyle = theme.secondaryColor;
  ctx.shadowColor = theme.secondaryColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);
  
  // Corner accent dots
  ctx.fillStyle = theme.primaryColor;
  const dotPositions = [
    [40, 40], [width - 40, 40], [40, height - 40], [width - 40, height - 40]
  ];
  
  dotPositions.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  
  ctx.shadowBlur = 0;
}

function drawMarbleDecorations(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Elegant marble frame
  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 3;
  
  // Double border
  ctx.strokeRect(25, 25, width - 50, height - 50);
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 30, width - 60, height - 60);
  
  // Decorative elements
  ctx.fillStyle = theme.accentColor;
  const decorativeElements = [
    [width/2, 35],  // Top center
    [width/2, height - 35],  // Bottom center
    [35, height/2],  // Left center
    [width - 35, height/2]  // Right center
  ];
  
  decorativeElements.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCosmicDecorations(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Cosmic energy rings
  ctx.strokeStyle = theme.primaryColor;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2.5;
  
  for (let i = 1; i <= 3; i++) {
    const radius = (maxRadius / 3) * i;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Cosmic particles
  ctx.fillStyle = theme.secondaryColor;
  for (let i = 0; i < 50; i++) {
    const angle = (Math.PI * 2 * i) / 50;
    const radius = maxRadius + Math.random() * 50;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
}

function drawGlassDecorations(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  // Modern glass frame
  ctx.strokeStyle = theme.secondaryColor;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  
  // Glassmorphism border
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Corner accent lines
  const cornerLength = 25;
  const corners = [
    { x: 20, y: 20, angles: [0, Math.PI/2] },
    { x: width - 20, y: 20, angles: [Math.PI/2, Math.PI] },
    { x: width - 20, y: height - 20, angles: [Math.PI, 3*Math.PI/2] },
    { x: 20, y: height - 20, angles: [3*Math.PI/2, 2*Math.PI] }
  ];
  
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 3;
  
  corners.forEach(corner => {
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y);
    ctx.lineTo(corner.x + Math.cos(corner.angles[0]) * cornerLength, corner.y + Math.sin(corner.angles[0]) * cornerLength);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y);
    ctx.lineTo(corner.x + Math.cos(corner.angles[1]) * cornerLength, corner.y + Math.sin(corner.angles[1]) * cornerLength);
    ctx.stroke();
  });
  
  ctx.globalAlpha = 1;
}

function drawOrnateCorner(ctx: CanvasRenderingContext2D, size: number) {
  // Draw ornate corner decoration
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(-size/2, -size/2, -size, 0);
  ctx.quadraticCurveTo(-size/2, size/2, 0, size);
  ctx.quadraticCurveTo(size/2, size/2, size, 0);
  ctx.quadraticCurveTo(size/2, -size/2, 0, -size);
  ctx.fill();
}

function drawProductName(ctx: CanvasRenderingContext2D, productName: string, theme: PosterTheme, width: number, height: number) {
  const nameY = height * 0.15;
  
  switch (theme.layout) {
    case 'luxe':
      // Luxurious gold text with shadow
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `bold 32px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fillText(productName.toUpperCase(), width / 2, nameY);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      break;
      
    case 'neon':
      // Glowing neon text
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `bold 28px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.shadowColor = theme.primaryColor;
      ctx.shadowBlur = 30;
      ctx.fillText(productName.toUpperCase(), width / 2, nameY);
      
      // Double glow effect
      ctx.shadowColor = theme.secondaryColor;
      ctx.shadowBlur = 15;
      ctx.fillText(productName.toUpperCase(), width / 2, nameY);
      ctx.shadowBlur = 0;
      break;
      
    case 'marble':
      // Elegant serif text
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `normal 30px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(productName, width / 2, nameY);
      break;
      
    case 'cosmic':
      // Cosmic gradient text
      const gradient = ctx.createLinearGradient(0, nameY - 20, 0, nameY + 20);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      ctx.fillStyle = gradient;
      ctx.font = `bold 30px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(productName.toUpperCase(), width / 2, nameY);
      break;
      
    case 'glass':
      // Modern clean text
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `600 28px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(productName, width / 2, nameY);
      break;
  }
}

function drawDMButton(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  const buttonWidth = 200;
  const buttonHeight = 60;
  const buttonX = (width - buttonWidth) / 2;
  const buttonY = height * 0.85;
  const borderRadius = 15;
  
  switch (theme.layout) {
    case 'luxe':
      // Luxurious gold button
      ctx.fillStyle = theme.primaryColor;
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.fill();
      
      // Button shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 5;
      
      // Button text
      ctx.fillStyle = theme.backgroundColor;
      ctx.font = `bold 18px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText('DM TO BUY', width / 2, buttonY + buttonHeight / 2 + 6);
      break;
      
    case 'neon':
      // Glowing neon button
      ctx.strokeStyle = theme.primaryColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = theme.primaryColor;
      ctx.shadowBlur = 20;
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.stroke();
      
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `bold 18px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('DM TO BUY', width / 2, buttonY + buttonHeight / 2 + 6);
      ctx.shadowBlur = 0;
      break;
      
    case 'marble':
      // Elegant marble button
      ctx.fillStyle = theme.accentColor;
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.fill();
      
      ctx.strokeStyle = theme.primaryColor;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.stroke();
      
      ctx.fillStyle = theme.backgroundColor;
      ctx.font = `600 18px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('DM TO BUY', width / 2, buttonY + buttonHeight / 2 + 6);
      break;
      
    case 'cosmic':
      // Cosmic gradient button
      const gradient = ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.fill();
      
      ctx.fillStyle = theme.accentColor;
      ctx.font = `bold 18px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('DM TO BUY', width / 2, buttonY + buttonHeight / 2 + 6);
      break;
      
    case 'glass':
      // Glass morphism button
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.fill();
      
      ctx.strokeStyle = theme.secondaryColor;
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, borderRadius);
      ctx.stroke();
      
      ctx.fillStyle = theme.primaryColor;
      ctx.font = `600 18px ${theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('DM TO BUY', width / 2, buttonY + buttonHeight / 2 + 6);
      break;
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawImagePlaceholder(ctx: CanvasRenderingContext2D, theme: PosterTheme, width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width * 0.35, height * 0.35);
  
  // Theme-specific placeholder
  switch (theme.layout) {
    case 'luxe':
      ctx.fillStyle = theme.primaryColor;
      ctx.fillRect(centerX - size / 2 - 4, centerY - size / 2 - 4, size + 8, size + 8);
      ctx.fillStyle = theme.backgroundColor;
      ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
      break;
      
    case 'neon':
      ctx.strokeStyle = theme.primaryColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = theme.primaryColor;
      ctx.shadowBlur = 20;
      ctx.strokeRect(centerX - size / 2, centerY - size / 2, size, size);
      ctx.shadowBlur = 0;
      break;
      
    default:
      ctx.fillStyle = theme.secondaryColor;
      ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
      break;
  }
  
  ctx.fillStyle = theme.primaryColor;
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Product Image', centerX, centerY);
}
