"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GoogleLoaderProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function GoogleLoader({ size = "md", className }: GoogleLoaderProps) {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5", 
    lg: "w-3 h-3",
    xl: "w-4 h-4"
  }

  const spacing = {
    sm: "space-x-1",
    md: "space-x-1.5", 
    lg: "space-x-2",
    xl: "space-x-2.5"
  }

  return (
    <div 
      className={cn("flex items-center justify-center", spacing[size], className)}
      role="status"
      aria-label="Loading"
    >
      {/* Google Blue */}
      <div 
        className={cn(
          "rounded-full bg-blue-500 google-dot-1",
          dotSizes[size]
        )}
      />
      {/* Google Red */}
      <div 
        className={cn(
          "rounded-full bg-red-500 google-dot-2",
          dotSizes[size]
        )}
      />
      {/* Google Yellow */}
      <div 
        className={cn(
          "rounded-full bg-yellow-500 google-dot-3",
          dotSizes[size]
        )}
      />
      {/* Google Green */}
      <div 
        className={cn(
          "rounded-full bg-green-500 google-dot-4",
          dotSizes[size]
        )}
      />
    </div>
  )
}

interface GoogleLoaderWithTextProps extends GoogleLoaderProps {
  text?: string
  textClassName?: string
}

export function GoogleLoaderWithText({ 
  size = "md", 
  className, 
  text = "Loading...",
  textClassName 
}: GoogleLoaderWithTextProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <GoogleLoader size={size} className={className} />
      <p className={cn("text-muted-foreground text-sm font-medium", textClassName)}>
        {text}
      </p>
    </div>
  )
}

interface GoogleLoaderInlineProps extends GoogleLoaderProps {
  text?: string
  textClassName?: string
}

export function GoogleLoaderInline({ 
  size = "sm", 
  className, 
  text = "Loading...",
  textClassName 
}: GoogleLoaderInlineProps) {
  return (
    <div className="flex items-center space-x-3">
      <GoogleLoader size={size} className={className} />
      <span className={cn("text-muted-foreground text-sm font-medium", textClassName)}>
        {text}
      </span>
    </div>
  )
}

// Full page loader component
export function GooglePageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <GoogleLoader size="xl" className="mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">{text}</h2>
        <p className="text-muted-foreground">Please wait while we load your content</p>
      </div>
    </div>
  )
}

// Export all loaders for easy access
export { GoogleLoader as default }
