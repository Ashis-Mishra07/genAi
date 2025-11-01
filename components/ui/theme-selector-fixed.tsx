'use client';

import React from 'react';
import { PosterTheme, POSTER_THEMES } from './canvas-poster';

interface ThemeSelectorProps {
  selectedTheme: PosterTheme | null;
  onThemeSelect: (theme: PosterTheme) => void;
  productName?: string;
  productImage?: string;
}

function ThemeSelector({ 
  selectedTheme, 
  onThemeSelect, 
  productName = 'Sample Product',
  productImage = '/placeholder-product.jpg'
}: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-orange-400 mb-2">Choose Your Premium Theme</h3>
        <p className="text-orange-200">Select a stunning design for your product poster</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {POSTER_THEMES.map((theme) => (
          <div
            key={theme.id}
            className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border ${
              selectedTheme?.id === theme.id
                ? 'ring-4 ring-orange-500 shadow-2xl shadow-orange-500/30 scale-105 border-orange-400'
                : 'shadow-lg hover:shadow-xl border-orange-500/30 hover:border-orange-400'
            }`}
            onClick={() => onThemeSelect(theme)}
          >
            {/* Theme Preview */}
            <div 
              className="relative h-56 overflow-hidden bg-gray-900"
              style={{ 
                background: theme.layout === 'luxe' 
                  ? `radial-gradient(circle at center, ${theme.gradientColors[1]}, ${theme.gradientColors[0]})`
                  : theme.layout === 'ocean'
                  ? `linear-gradient(135deg, ${theme.gradientColors.join(', ')})`
                  : theme.layout === 'sunset'
                  ? `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.secondaryColor})`
                  : theme.layout === 'forest'
                  ? `radial-gradient(ellipse at center, ${theme.gradientColors.join(', ')})`
                  : `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.secondaryColor})`
              }}
            >
              {/* Decorative elements based on theme */}
              {theme.layout === 'luxe' && (
                <>
                  {/* Gold ornamental borders */}
                  <div className="absolute inset-4 border-2 border-opacity-50 rounded"
                       style={{ borderColor: theme.primaryColor }}>
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full"
                         style={{ backgroundColor: theme.primaryColor }} />
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full"
                         style={{ backgroundColor: theme.primaryColor }} />
                  </div>
                </>
              )}
              
              {theme.layout === 'ocean' && (
                <>
                  {/* Wave patterns */}
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <path d="M0,120 Q50,100 100,120 T200,120" 
                          stroke={theme.primaryColor} 
                          strokeWidth="3" 
                          fill="none" />
                    <path d="M0,140 Q30,120 80,140 T150,140" 
                          stroke={theme.secondaryColor} 
                          strokeWidth="2" 
                          fill="none" />
                  </svg>
                </>
              )}
              
              {theme.layout === 'sunset' && (
                <>
                  {/* Radiating lines */}
                  <div className="absolute top-1/2 left-1/2 w-1 h-20 transform -translate-x-1/2 -translate-y-1/2 opacity-30"
                       style={{ backgroundColor: theme.primaryColor, transform: 'translate(-50%, -50%) rotate(0deg)' }} />
                  <div className="absolute top-1/2 left-1/2 w-1 h-16 transform -translate-x-1/2 -translate-y-1/2 opacity-20"
                       style={{ backgroundColor: theme.primaryColor, transform: 'translate(-50%, -50%) rotate(45deg)' }} />
                  <div className="absolute top-1/2 left-1/2 w-1 h-16 transform -translate-x-1/2 -translate-y-1/2 opacity-20"
                       style={{ backgroundColor: theme.primaryColor, transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
                </>
              )}
              
              {theme.layout === 'forest' && (
                <>
                  {/* Leaf shapes */}
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-3 rounded-full opacity-30"
                         style={{ 
                           backgroundColor: theme.secondaryColor,
                           top: `${20 + Math.random() * 60}%`,
                           left: `${20 + Math.random() * 60}%`,
                           transform: `rotate(${Math.random() * 360}deg)`
                         }} />
                  ))}
                </>
              )}
              
              {theme.layout === 'royal' && (
                <>
                  {/* Ornate patterns */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-40"
                           style={{ 
                             width: `${40 + i * 20}px`, 
                             height: `${40 + i * 20}px`,
                             borderColor: theme.primaryColor,
                             opacity: 0.6 - i * 0.1
                           }} />
                    ))}
                  </div>
                </>
              )}

              {/* Sample content preview */}
              <div className="absolute inset-4 flex items-center justify-center">
                <div className="text-center space-y-2">
                  {/* Product placeholder */}
                  <div className="w-16 h-16 mx-auto rounded-lg border-2 border-opacity-50 bg-opacity-20"
                       style={{ 
                         backgroundColor: theme.accentColor,
                         borderColor: theme.primaryColor
                       }} />
                  
                  {/* Product name */}
                  <div className="text-xs font-bold px-2 py-1 rounded"
                       style={{ 
                         backgroundColor: theme.primaryColor + '20',
                         color: theme.primaryColor
                       }}>
                    {productName}
                  </div>
                  
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
            </div>
            
            {/* Theme Info */}
            <div className="p-4 bg-gray-800/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-orange-300">{theme.name}</h4>
                {selectedTheme?.id === theme.id && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-orange-200 mb-3">{theme.description}</p>
              
              {/* Enhanced Color Palette */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-orange-500/30 shadow-sm"
                    style={{ backgroundColor: theme.primaryColor }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-orange-500/30 shadow-sm"
                    style={{ backgroundColor: theme.secondaryColor }}
                    title="Secondary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-orange-500/30 shadow-sm"
                    style={{ backgroundColor: theme.accentColor }}
                    title="Accent Color"
                  />
                </div>
                
                <span className="text-xs text-orange-400 capitalize font-medium">
                  {theme.layout}
                </span>
              </div>
            </div>
            
            {/* Selection Glow Effect */}
            {selectedTheme?.id === theme.id && (
              <div className="absolute inset-0 pointer-events-none rounded-xl"
                   style={{
                     boxShadow: `0 0 30px ${theme.primaryColor}40`,
                   }} />
            )}
          </div>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="text-center text-orange-200/80 text-sm">
        <p>✨ Each theme creates a unique storytelling poster with your product and AI-generated story</p>
      </div>
    </div>
  );
}

export default ThemeSelector;
