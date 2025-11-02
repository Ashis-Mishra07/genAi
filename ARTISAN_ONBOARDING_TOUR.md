# Artisan Onboarding Tour - Implementation Guide

## ✅ Completed Features

### 1. **Interactive Step-by-Step Onboarding Tour**
   - **Location**: `components/artisan/onboarding-tour.tsx`
   - **Features**:
     - 6-step guided tour with animations
     - Smooth Framer Motion transitions
     - Interactive highlights with spotlight effect
     - Progress dots indicator
     - Back/Next/Skip navigation
     - Auto-scrolls to highlighted elements

### 2. **Tour Steps**

#### Step 1: Welcome 🎨
- Center modal with welcome message
- Sets expectations for new artisans

#### Step 2: Admin Support 📸
- Highlights "Admin Support" in navbar
- Explains quick product upload process
- **Target**: `[data-tour='admin-support']`

#### Step 3: Create Product 🎭
- Highlights "Create Product" link
- Explains self-service product creation
- **Target**: `[data-tour='create-product']`

#### Step 4: Analytics 📊
- Highlights "Analytics" menu item
- Explains performance tracking features
- **Target**: `[data-tour='analytics']`

#### Step 5: Feedback 💬
- Highlights "Feedback" section
- Explains customer review system
- **Target**: `[data-tour='feedback']`

#### Step 6: Complete 🎉
- Success message
- Completion confirmation

### 3. **Smart Tour Triggering**
   - Only shows for **new signups** (not returning users)
   - Uses localStorage flag: `artisan_first_login`
   - Sets completion flag: `artisan_tour_completed`
   - Can be manually restarted via profile settings

### 4. **Integration Points**

#### Modified Files:
1. **`app/artisan/layout.tsx`**
   - Added `<ArtisanOnboardingTour />` component
   - Tour available across all artisan pages

2. **`app/auth/artisan/page.tsx`**
   - Sets `artisan_first_login = "true"` on signup
   - Triggers tour for new users only

3. **`components/navbar.tsx`**
   - Added `getTourAttribute()` helper function
   - Applied `data-tour` attributes to artisan links:
     - `/artisan/messages` → `data-tour="admin-support"`
     - `/artisan/products/new` → `data-tour="create-product"`
     - `/artisan/analytics` → `data-tour="analytics"`
     - `/artisan/feedback` → `data-tour="feedback"`

### 5. **Visual Design**
   - **Backdrop**: Black overlay with blur (60% opacity)
   - **Spotlight**: Orange glowing ring around highlighted elements
   - **Modal**: Card with orange border, spring animations
   - **Icons**: Color-coded for each step
   - **Progress**: Animated dot indicators
   - **Buttons**: Orange primary theme

### 6. **Animations (Framer Motion)**
   - Modal entrance: Scale + fade + slide
   - Icon rotation: 360° spin on appear
   - Text stagger: Sequential fade-in
   - Progress dots: Scale animation
   - Spotlight: Smooth follow with shadow

## 🎯 User Flow

```
1. New artisan signs up
   ↓
2. `artisan_first_login` flag set in localStorage
   ↓
3. Redirect to `/artisan/dashboard`
   ↓
4. Tour component checks flag (1s delay)
   ↓
5. Tour modal appears with Step 1 (Welcome)
   ↓
6. User clicks "Next" → Highlights navbar items
   ↓
7. User completes all 6 steps
   ↓
8. `artisan_tour_completed` flag set
   ↓
9. Tour won't show again (unless flag cleared)
```

## 🔧 How to Test

### Test New User Experience:
```bash
# 1. Clear localStorage (Browser DevTools → Application → Storage)
localStorage.clear()

# 2. Sign up as new artisan at /auth/artisan
# 3. Tour should auto-start after landing on dashboard
```

### Test Tour Restart:
```javascript
// In browser console (for testing):
localStorage.removeItem('artisan_tour_completed');
localStorage.setItem('artisan_first_login', 'true');
window.location.reload();
```

### Programmatic Restart (Future Feature):
```typescript
import { restartArtisanTour } from '@/components/artisan/onboarding-tour';

// Call from profile settings or help menu:
<Button onClick={restartArtisanTour}>
  Restart Tour
</Button>
```

## 📦 Dependencies

**Installed Package**:
```json
{
  "framer-motion": "^11.x.x"
}
```

**Used Components**:
- `motion` - Animated components
- `AnimatePresence` - Enter/exit animations
- Lucide React icons
- shadcn/ui Button component

## 🎨 Customization

### Change Tour Steps:
Edit `tourSteps` array in `components/artisan/onboarding-tour.tsx`:

```typescript
const tourSteps: TourStep[] = [
  {
    id: "my-step",
    title: "My Custom Step",
    description: "Step description...",
    icon: <Icon className="h-8 w-8 text-color" />,
    target: "[data-tour='my-target']", // CSS selector
    position: "center" | "top" | "bottom",
  },
];
```

### Add New Highlight Targets:
1. Add `data-tour="my-id"` attribute to any element
2. Reference it in tour step: `target: "[data-tour='my-id']"`

### Change Colors:
- Primary color: `orange-500` → Change in tour component
- Backdrop opacity: `bg-black/60` → Adjust in backdrop div
- Spotlight ring: `rgba(249, 115, 22, 0.4)` → Change in highlight style

## 🚀 Future Enhancements

1. **Add restart button in profile settings**
2. **Analytics tracking** for tour completion rate
3. **A/B testing** different tour flows
4. **Conditional steps** based on user actions
5. **Video tutorials** embedded in modals
6. **Tooltips** for specific UI elements
7. **Interactive demos** (click simulation)
8. **Multi-language support** via i18n

## 🐛 Troubleshooting

### Tour doesn't appear:
- Check `artisan_first_login` flag in localStorage
- Ensure user role is "artisan"
- Check browser console for errors

### Highlights don't work:
- Verify `data-tour` attributes in navbar
- Check element visibility and position
- Ensure navbar is rendered before tour

### Animations laggy:
- Reduce `damping` and `stiffness` values
- Simplify backdrop blur
- Remove shadow from spotlight

## 📝 Notes

- Tour only shows **once per browser** (localStorage based)
- Clearing browser data will reset tour
- Works across all artisan dashboard pages
- Responsive design for mobile/desktop
- Keyboard navigation support (ESC to close)
- Screen reader friendly (ARIA labels)

---

**Created**: November 2, 2025
**Status**: ✅ Production Ready
**Dependencies**: Framer Motion v11+
