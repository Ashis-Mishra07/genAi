# 📱 Mobile Responsive Design Guide

## Overview
This guide helps you make your Artisan Marketplace app mobile-friendly for the Capacitor Android app.

---

## 🎯 Key Principles

### 1. Touch-Friendly Targets
- Minimum touch target: 44x44 pixels
- Add padding around clickable elements
- Increase button sizes on mobile

### 2. Responsive Typography
- Base font size: 16px (prevents zoom on iOS)
- Use relative units (rem, em) instead of px
- Adjust line height for readability

### 3. Mobile Navigation
- Use hamburger menu for complex navigation
- Bottom navigation for primary actions
- Swipe gestures for common actions

### 4. Form Optimization
- Large input fields (min 44px height)
- Appropriate input types (tel, email, number)
- Clear labels and error messages
- Auto-focus and keyboard management

---

## 🔧 Implementation Steps

### Step 1: Update Tailwind Config for Mobile

Add mobile-first breakpoints to your Tailwind configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
}
```

### Step 2: Create Mobile Layout Wrapper

Create `components/MobileLayout.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Configure status bar for mobile
    if (typeof window !== 'undefined' && window.Capacitor) {
      StatusBar.setBackgroundColor({ color: '#ffffff' });
      StatusBar.setStyle({ style: 'LIGHT' });

      // Handle keyboard events
      Keyboard.addListener('keyboardWillShow', () => {
        setKeyboardVisible(true);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardVisible(false);
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.Capacitor) {
        Keyboard.removeAllListeners();
      }
    };
  }, []);

  return (
    <div className={`min-h-screen ${keyboardVisible ? 'pb-0' : 'pb-safe'}`}>
      {children}
    </div>
  );
}
```

### Step 3: Add Safe Area Support

Update `app/globals.css`:

```css
/* Safe area insets for notched devices */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}

/* Apply safe areas */
.pt-safe { padding-top: var(--safe-area-inset-top); }
.pb-safe { padding-bottom: var(--safe-area-inset-bottom); }
.pl-safe { padding-left: var(--safe-area-inset-left); }
.pr-safe { padding-right: var(--safe-area-inset-right); }

/* Mobile-specific styles */
@media (max-width: 768px) {
  /* Prevent zoom on input focus */
  input, textarea, select, button {
    font-size: 16px !important;
  }

  /* Touch-friendly spacing */
  button, a[role="button"] {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }

  /* Disable text selection for better mobile feel */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    user-select: none;
  }

  /* Allow text selection in inputs and content areas */
  input, textarea, [contenteditable], p, span {
    user-select: text;
    -webkit-user-select: text;
  }

  /* Smooth scrolling */
  html {
    -webkit-overflow-scrolling: touch;
  }

  /* Hide scrollbars on mobile */
  ::-webkit-scrollbar {
    display: none;
  }
}
```

### Step 4: Create Responsive Components

#### Mobile Header Component

Create `components/MobileHeader.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 pt-safe">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Artisan Marketplace</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pt-safe" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-4">
              <a href="/" className="block py-2 px-4 hover:bg-gray-100 rounded">Home</a>
              <a href="/products" className="block py-2 px-4 hover:bg-gray-100 rounded">Products</a>
              <a href="/cart" className="block py-2 px-4 hover:bg-gray-100 rounded">Cart</a>
              <a href="/profile" className="block py-2 px-4 hover:bg-gray-100 rounded">Profile</a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
```

#### Mobile Bottom Navigation

Create `components/MobileBottomNav.tsx`:

```typescript
'use client';

import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Step 5: Responsive Grid Layouts

Use mobile-first responsive classes:

```typescript
// Product Grid Example
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Two-column layout on mobile, three on tablet, four on desktop
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
  {/* Content */}
</div>
```

### Step 6: Mobile-Optimized Forms

```typescript
// Mobile-friendly form component
export default function MobileForm() {
  return (
    <form className="space-y-4 p-4">
      {/* Large touch-friendly inputs */}
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          type="text"
          className="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
      </div>

      {/* Appropriate input types */}
      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <input
          type="tel"
          className="w-full px-4 py-3 text-base border rounded-lg"
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          className="w-full px-4 py-3 text-base border rounded-lg"
          placeholder="Enter email"
        />
      </div>

      {/* Large submit button */}
      <button
        type="submit"
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-medium text-base"
      >
        Submit
      </button>
    </form>
  );
}
```

### Step 7: Handle Mobile-Specific Features

Create `lib/capacitor-utils.ts`:

```typescript
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const isMobile = () => {
  return Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';
};

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
  if (isNativePlatform()) {
    await Haptics.impact({ style });
  }
};

export const setStatusBarStyle = async (style: 'light' | 'dark') => {
  if (isNativePlatform()) {
    await StatusBar.setStyle({ style: style === 'light' ? Style.Light : Style.Dark });
  }
};

export const hideStatusBar = async () => {
  if (isNativePlatform()) {
    await StatusBar.hide();
  }
};

export const showStatusBar = async () => {
  if (isNativePlatform()) {
    await StatusBar.show();
  }
};
```

### Step 8: Update Root Layout

Update `app/layout.tsx`:

```typescript
import './globals.css';
import './mobile.css'; // Add mobile styles
import MobileBottomNav from '@/components/MobileBottomNav';

export const metadata = {
  title: 'Artisan Marketplace',
  description: 'Discover unique artisan products',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Add top padding for mobile header */}
        <div className="pt-16 pb-16 md:pt-0 md:pb-0">
          {children}
        </div>
        
        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </body>
    </html>
  );
}
```

---

## 🎨 Common Responsive Patterns

### Hide/Show on Mobile

```typescript
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only content</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile only content</div>

// Different layouts for mobile/desktop
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">Column 1</div>
  <div className="w-full md:w-1/2">Column 2</div>
</div>
```

### Responsive Text Sizes

```typescript
<h1 className="text-2xl md:text-4xl lg:text-5xl">Responsive Heading</h1>
<p className="text-sm md:text-base lg:text-lg">Responsive paragraph</p>
```

### Responsive Spacing

```typescript
<div className="p-4 md:p-6 lg:p-8">
  <div className="space-y-4 md:space-y-6 lg:space-y-8">
    {/* Content with responsive spacing */}
  </div>
</div>
```

---

## 🧪 Testing on Mobile

### 1. Browser DevTools
- Open Chrome DevTools (F12)
- Click device toolbar icon
- Select mobile device
- Test responsive behavior

### 2. Android Emulator
```cmd
npm run cap:build
npx cap open android
# Click Run in Android Studio
```

### 3. Physical Device
```cmd
# Enable USB debugging on your Android device
adb devices
npm run cap:run android
```

---

## ✅ Mobile Checklist

- [ ] All touch targets are at least 44x44 pixels
- [ ] Forms use appropriate input types (tel, email, etc.)
- [ ] Base font size is 16px to prevent zoom
- [ ] Navigation is accessible on mobile
- [ ] Images are optimized for mobile
- [ ] Safe areas are handled for notched devices
- [ ] Keyboard behavior is managed
- [ ] Haptic feedback is implemented
- [ ] Status bar is styled appropriately
- [ ] App works offline (if needed)
- [ ] Loading states are mobile-friendly
- [ ] Error messages are clear and visible
- [ ] Gestures work as expected (swipe, pinch, etc.)

---

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile Web Best Practices](https://web.dev/mobile/)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
