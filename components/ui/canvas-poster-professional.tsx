'use client';

import React from 'react';

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

interface ProfessionalPosterProps {
  theme: PosterTheme;
  productName: string;
  productStory: string;
  imageFile: File;
  onPosterReady: (dataUrl: string) => void;
}

export default function ProfessionalPoster({
  theme,
  productName,
  productStory,
  imageFile,
  onPosterReady
}: ProfessionalPosterProps) {
  React.useEffect(() => {
    createProfessionalPoster();
  }, [theme, productName, productStory, imageFile]);

  const createProfessionalPoster = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set ultra-high resolution for crisp output
    const scale = 3;
    canvas.width = 1200 * scale;
    canvas.height = 600 * scale;
    ctx.scale(scale, scale);
    
    const width = 1200;
    const height = 600;

    // Load image
    const img = new Image();
    img.onload = () => {
      // Create professional poster
      drawProfessionalBackground(ctx, width, height, theme);
      drawAdvancedProductShowcase(ctx, img, width, height, theme);
      drawElegantTypography(ctx, productName, productStory, width, height, theme);
      drawPremiumBranding(ctx, width, height, theme);
      
      // Return high-quality result
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      onPosterReady(dataUrl);
    };
    
    img.src = URL.createObjectURL(imageFile);
  };

  const drawProfessionalBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Create sophisticated multi-layer background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    switch (theme.layout) {
      case 'luxe':
        drawLuxuryBackground(ctx, width, height, theme);
        break;
      case 'ocean':
        drawOceanBackground(ctx, width, height, theme);
        break;
      case 'sunset':
        drawSunsetBackground(ctx, width, height, theme);
        break;
      case 'forest':
        drawForestBackground(ctx, width, height, theme);
        break;
      case 'royal':
        drawRoyalBackground(ctx, width, height, theme);
        break;
    }

    // Add subtle texture overlay
    addProfessionalTexture(ctx, width, height, theme);
  };

  const drawLuxuryBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Sophisticated radial gradient
    const centerX = width * 0.3;
    const centerY = height * 0.4;
    const radius = Math.max(width, height) * 0.8;
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#2a2a2a');
    gradient.addColorStop(0.3, '#1a1a1a');
    gradient.addColorStop(0.7, '#0f0f0f');
    gradient.addColorStop(1, '#000000');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add geometric patterns
    drawGeometricLuxuryPattern(ctx, width, height, theme.primaryColor);
    
    // Add gold foil effect
    drawGoldFoilAccents(ctx, width, height, theme.primaryColor);
  };

  const drawOceanBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Multi-layer ocean gradient
    const gradient1 = ctx.createLinearGradient(0, 0, width, height);
    gradient1.addColorStop(0, '#001a33');
    gradient1.addColorStop(0.3, '#002244');
    gradient1.addColorStop(0.7, '#003366');
    gradient1.addColorStop(1, '#004488');
    
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, width, height);

    // Add flowing water patterns
    drawFlowingWaves(ctx, width, height, theme.primaryColor);
    
    // Add bubble effects
    drawBubbleEffects(ctx, width, height, theme.secondaryColor);
  };

  const drawSunsetBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Dynamic sunset gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f0619');
    gradient.addColorStop(0.2, '#2d1b69');
    gradient.addColorStop(0.5, '#8e2a5b');
    gradient.addColorStop(0.8, '#d2691e');
    gradient.addColorStop(1, '#ff8c00');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add radial sunburst
    drawAdvancedSunburst(ctx, width, height, theme.primaryColor);
    
    // Add particle effects
    drawSunsetParticles(ctx, width, height, theme.secondaryColor);
  };

  const drawForestBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Natural forest gradient
    const gradient = ctx.createRadialGradient(width * 0.2, height * 0.3, 0, width * 0.5, height * 0.5, Math.max(width, height));
    gradient.addColorStop(0, '#3d5a3d');
    gradient.addColorStop(0.4, '#2d4a2d');
    gradient.addColorStop(0.7, '#1a331a');
    gradient.addColorStop(1, '#0d1a0d');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add organic leaf patterns
    drawLeafPatterns(ctx, width, height, theme.primaryColor);
    
    // Add nature textures
    drawNatureTextures(ctx, width, height, theme.secondaryColor);
  };

  const drawRoyalBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Regal gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a0d33');
    gradient.addColorStop(0.3, '#4a148c');
    gradient.addColorStop(0.7, '#6a1b9a');
    gradient.addColorStop(1, '#8e24aa');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add ornate patterns
    drawOrnatePatterns(ctx, width, height, theme.primaryColor);
    
    // Add royal embellishments
    drawRoyalEmbellishments(ctx, width, height, theme.secondaryColor);
  };

  const drawAdvancedProductShowcase = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number, theme: PosterTheme) => {
    const leftSection = width * 0.45;
    const padding = 80;
    const maxSize = Math.min(leftSection - padding * 2, height - padding * 2) * 0.85;
    
    // Calculate image dimensions
    const aspectRatio = img.width / img.height;
    let displayWidth = maxSize;
    let displayHeight = maxSize / aspectRatio;
    
    if (displayHeight > maxSize) {
      displayHeight = maxSize;
      displayWidth = maxSize * aspectRatio;
    }
    
    const imgX = (leftSection - displayWidth) / 2;
    const imgY = (height - displayHeight) / 2;

    // Draw sophisticated frame
    drawPremiumFrame(ctx, imgX, imgY, displayWidth, displayHeight, theme);
    
    // Draw product with advanced effects
    ctx.save();
    
    // Add subtle glow
    ctx.shadowColor = theme.primaryColor + '80';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Clip to rounded rectangle
    ctx.beginPath();
    ctx.roundRect(imgX + 8, imgY + 8, displayWidth - 16, displayHeight - 16, 15);
    ctx.clip();
    
    // Draw image
    ctx.drawImage(img, imgX + 8, imgY + 8, displayWidth - 16, displayHeight - 16);
    
    ctx.restore();
    
    // Add premium highlight
    const highlight = ctx.createLinearGradient(imgX, imgY, imgX, imgY + displayHeight * 0.4);
    highlight.addColorStop(0, 'rgba(255,255,255,0.25)');
    highlight.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.roundRect(imgX + 8, imgY + 8, displayWidth - 16, displayHeight * 0.4, 15);
    ctx.fill();
  };

  const drawElegantTypography = (ctx: CanvasRenderingContext2D, productName: string, story: string, width: number, height: number, theme: PosterTheme) => {
    const rightSection = width * 0.55;
    const rightStart = width * 0.45;
    const padding = 80;
    const contentX = rightStart + padding;
    const contentWidth = rightSection - padding * 2;

    // Draw product title with advanced typography
    ctx.save();
    
    // Add text glow effect
    ctx.shadowColor = theme.primaryColor + '60';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = theme.primaryColor;
    ctx.font = `700 42px ${theme.fontFamily}`; // Reduced from 52px to 42px
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Create text path for advanced effects
    const titleLines = wrapAdvancedText(ctx, productName.toUpperCase(), contentWidth);
    let currentY = 80; // Moved up from 100
    
    // Limit title to maximum 2 lines to save space
    const maxTitleLines = Math.min(2, titleLines.length);
    
    for (let i = 0; i < maxTitleLines; i++) {
      const line = titleLines[i];
      // Add gradient text effect
      const textGradient = ctx.createLinearGradient(contentX, currentY, contentX + ctx.measureText(line).width, currentY + 42);
      textGradient.addColorStop(0, theme.primaryColor);
      textGradient.addColorStop(0.5, theme.secondaryColor);
      textGradient.addColorStop(1, theme.primaryColor);
      
      ctx.fillStyle = textGradient;
      ctx.fillText(line, contentX, currentY);
      currentY += 50; // Reduced spacing from 65 to 50
    }
    
    ctx.restore();

    // Add decorative divider
    drawDecorativeDivider(ctx, contentX, currentY + 15, contentWidth * 0.7, theme); // Reduced spacing

    // Draw story with premium formatting - start higher up to have more space
    drawPremiumStoryText(ctx, story, contentX, currentY + 50, contentWidth, theme); // Reduced from 80 to 50
  };

  const drawPremiumBranding = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    // Add corner accents
    drawCornerAccents(ctx, width, height, theme);
    
    // Add subtle branding watermark
    drawBrandingWatermark(ctx, width, height, theme);
    
    // Add premium border
    drawPremiumBorder(ctx, width, height, theme);
  };

  // Helper functions for advanced effects
  const drawGeometricLuxuryPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Draw diamond pattern
    for (let x = -50; x < width + 50; x += 100) {
      for (let y = -50; y < height + 50; y += 100) {
        ctx.beginPath();
        ctx.moveTo(x, y - 25);
        ctx.lineTo(x + 25, y);
        ctx.lineTo(x, y + 25);
        ctx.lineTo(x - 25, y);
        ctx.closePath();
        ctx.stroke();
      }
    }
    
    ctx.restore();
  };

  const drawGoldFoilAccents = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.15;
    
    // Create shimmering effect
    const shimmer = ctx.createLinearGradient(0, 0, width, height);
    shimmer.addColorStop(0, 'transparent');
    shimmer.addColorStop(0.3, color + '40');
    shimmer.addColorStop(0.7, 'transparent');
    
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, 0, width, height);
    
    ctx.restore();
  };

  const drawFlowingWaves = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const waveY = y + Math.sin((x * 0.02) + (y * 0.01)) * 25;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawBubbleEffects = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = color;
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 20 + 5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawAdvancedSunburst = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const centerX = width * 0.8;
    const centerY = height * 0.2;
    const rays = 36;
    
    for (let i = 0; i < rays; i++) {
      const angle = (i * Math.PI * 2) / rays;
      const length = Math.random() * 150 + 100;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      );
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawSunsetParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = color;
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawLeafPatterns = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = color;
    
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 20 + 10;
      
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 2, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawNatureTextures = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // Draw organic branch-like patterns
    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let currentX = startX;
      let currentY = startY;
      
      for (let j = 0; j < 20; j++) {
        currentX += (Math.random() - 0.5) * 10;
        currentY += (Math.random() - 0.5) * 10;
        ctx.lineTo(currentX, currentY);
      }
      
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const drawOrnatePatterns = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Draw ornate corner flourishes
    const corners = [
      { x: 100, y: 100 },
      { x: width - 100, y: 100 },
      { x: 100, y: height - 100 },
      { x: width - 100, y: height - 100 }
    ];
    
    corners.forEach(corner => {
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 20 + i * 15, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    ctx.restore();
  };

  const drawRoyalEmbellishments = (ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = color;
    
    // Draw crown-like patterns
    for (let x = 100; x < width - 100; x += 150) {
      for (let y = 100; y < height - 100; y += 200) {
        drawCrownPattern(ctx, x, y, 30);
      }
    }
    
    ctx.restore();
  };

  const drawCrownPattern = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - size/2, y - size);
    ctx.lineTo(x, y - size/2);
    ctx.lineTo(x + size/2, y - size);
    ctx.lineTo(x + size, y);
    ctx.closePath();
    ctx.fill();
  };

  const addProfessionalTexture = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 0.03 * 255;
      data[i] += noise;     // Red
      data[i + 1] += noise; // Green
      data[i + 2] += noise; // Blue
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const drawPremiumFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, theme: PosterTheme) => {
    // Multi-layer frame
    const frameThickness = 20;
    
    // Outer shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;
    
    // Frame gradient
    const frameGradient = ctx.createLinearGradient(x, y, x + width, y + height);
    frameGradient.addColorStop(0, theme.primaryColor + '80');
    frameGradient.addColorStop(0.5, theme.secondaryColor + '60');
    frameGradient.addColorStop(1, theme.primaryColor + '80');
    
    ctx.fillStyle = frameGradient;
    ctx.fillRect(x - frameThickness, y - frameThickness, width + frameThickness * 2, height + frameThickness * 2);
    
    ctx.restore();
    
    // Inner frame highlight
    ctx.strokeStyle = theme.primaryColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 12);
    ctx.stroke();
  };

  const wrapAdvancedText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      // Check if single word is too long
      const wordWidth = ctx.measureText(word).width;
      if (wordWidth > maxWidth) {
        // If current line has content, push it first
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        // Break the long word (simple truncation for safety)
        lines.push(word.substring(0, Math.floor(word.length * 0.8)) + '...');
        continue;
      }
      
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

  const drawDecorativeDivider = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, theme: PosterTheme) => {
    ctx.save();
    
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.1, theme.primaryColor);
    gradient.addColorStop(0.5, theme.secondaryColor);
    gradient.addColorStop(0.9, theme.primaryColor);
    gradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
    
    // Add decorative diamonds
    for (let i = 0; i < 3; i++) {
      const diamondX = x + (width / 4) * (i + 1);
      ctx.fillStyle = theme.primaryColor;
      ctx.beginPath();
      ctx.moveTo(diamondX, y - 8);
      ctx.lineTo(diamondX + 4, y);
      ctx.lineTo(diamondX, y + 8);
      ctx.lineTo(diamondX - 4, y);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  };

  const drawPremiumStoryText = (ctx: CanvasRenderingContext2D, story: string, x: number, y: number, maxWidth: number, theme: PosterTheme) => {
    ctx.save();
    
    ctx.fillStyle = theme.accentColor;
    ctx.font = `400 18px ${theme.fontFamily}`; // Reduced font size from 22px to 18px
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const lines = wrapAdvancedText(ctx, story, maxWidth - 40); // Add more padding
    const lineHeight = 28; // Reduced line height from 34 to 28
    
    // Calculate available space and limit lines
    const canvasHeight = 600; // Canvas height
    const bottomPadding = 100; // Reserve space at bottom
    const maxY = canvasHeight - bottomPadding;
    const availableHeight = maxY - y;
    const maxLines = Math.floor(availableHeight / lineHeight);
    
    // Only show lines that fit
    const displayLines = lines.slice(0, Math.max(1, maxLines));
    
    displayLines.forEach((line, index) => {
      const currentY = y + index * lineHeight;
      
      // Only draw if within bounds
      if (currentY + lineHeight <= maxY) {
        // Add subtle text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(line, x + 20, currentY); // Add left padding
      }
    });
    
    ctx.restore();
  };

  const drawCornerAccents = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    ctx.save();
    ctx.strokeStyle = theme.primaryColor + '60';
    ctx.lineWidth = 4;
    
    const accentLength = 60;
    const offset = 30;
    
    // Top left
    ctx.beginPath();
    ctx.moveTo(offset, offset);
    ctx.lineTo(offset + accentLength, offset);
    ctx.moveTo(offset, offset);
    ctx.lineTo(offset, offset + accentLength);
    ctx.stroke();
    
    // Top right
    ctx.beginPath();
    ctx.moveTo(width - offset, offset);
    ctx.lineTo(width - offset - accentLength, offset);
    ctx.moveTo(width - offset, offset);
    ctx.lineTo(width - offset, offset + accentLength);
    ctx.stroke();
    
    // Bottom left
    ctx.beginPath();
    ctx.moveTo(offset, height - offset);
    ctx.lineTo(offset + accentLength, height - offset);
    ctx.moveTo(offset, height - offset);
    ctx.lineTo(offset, height - offset - accentLength);
    ctx.stroke();
    
    // Bottom right
    ctx.beginPath();
    ctx.moveTo(width - offset, height - offset);
    ctx.lineTo(width - offset - accentLength, height - offset);
    ctx.moveTo(width - offset, height - offset);
    ctx.lineTo(width - offset, height - offset - accentLength);
    ctx.stroke();
    
    ctx.restore();
  };

  const drawBrandingWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = theme.primaryColor;
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('AI Artisan Marketplace', width - 20, height - 15);
    ctx.restore();
  };

  const drawPremiumBorder = (ctx: CanvasRenderingContext2D, width: number, height: number, theme: PosterTheme) => {
    ctx.save();
    
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, theme.primaryColor + '40');
    borderGradient.addColorStop(0.5, theme.secondaryColor + '60');
    borderGradient.addColorStop(1, theme.primaryColor + '40');
    
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(15, 15, width - 30, height - 30, 25);
    ctx.stroke();
    
    ctx.restore();
  };

  return null; // This component doesn't render anything directly
}
