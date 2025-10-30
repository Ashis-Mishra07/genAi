# ⚡ Quick Setup Guide - Fix Both Errors in 15 Minutes!

## 🎯 Current Errors

1. ❌ **Payment Error**: "Razorpay keys missing"
2. ❌ **Maps Error**: "Google Maps API key not configured"

---

## 🚀 Quick Fix (15 Minutes Total)

### Part 1: Razorpay Payment (10 min) 💳

#### Step 1: Sign Up (2 min)
```
1. Go to: https://razorpay.com/
2. Click "Sign Up" (FREE!)
3. Enter email & create password
4. Verify email
```

#### Step 2: Get API Keys (3 min)
```
1. Login to Razorpay Dashboard
2. Click "Settings" (gear icon)
3. Click "API Keys"
4. Click "Generate Test Key"
5. Copy both:
   - Key ID: rzp_test_xxxxxxxxxxxxx
   - Key Secret: (click eye icon to reveal)
```

#### Step 3: Add to .env.local (2 min)
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=paste_your_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

#### Step 4: Test (3 min)
```bash
# Restart server
npm run dev

# Test payment with:
UPI: success@razorpay
Card: 4111 1111 1111 1111
```

---

### Part 2: Google Maps (5 min) 🗺️

#### Step 1: Go to Console (1 min)
```
1. Visit: https://console.cloud.google.com/
2. Sign in with Google
3. Select project: genai-456413
```

#### Step 2: Enable APIs (2 min)
```
1. Click "APIs & Services" → "Library"
2. Search "Geocoding API" → Click → Enable
3. Search "Maps JavaScript API" → Click → Enable
```

#### Step 3: Create Key (1 min)
```
1. Click "APIs & Services" → "Credentials"
2. Click "+ CREATE CREDENTIALS"
3. Select "API Key"
4. Copy the key: AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### Step 4: Add to .env.local (1 min)
```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📝 Your Complete .env.local

After adding both, your file should have:

```env
# Database (already configured ✅)
DATABASE_URL=postgresql://...

# Razorpay Payment (ADD THESE)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Google Maps (ADD THESE)
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Other keys (already configured ✅)
GEMINI_API_KEY=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
```

---

## ✅ Final Step

```bash
# Restart your dev server
# Press Ctrl+C, then:
npm run dev
```

---

## 🧪 Verify Everything Works

### Test 1: Payment ✅
```
1. Go to checkout page
2. Click "Pay Now"
3. Razorpay popup opens
4. Use: success@razorpay
5. Payment succeeds!
```

### Test 2: Maps ✅
```
1. Go to dashboard
2. Check orders page
3. Map displays locations
4. No console errors
```

---

## 💰 Cost: $0 (Both are FREE!)

### Razorpay
- ✅ FREE for testing
- ✅ No setup fees
- ✅ Unlimited test transactions

### Google Maps
- ✅ $200 FREE credit/month
- ✅ 40,000 geocoding requests FREE
- ✅ 28,000 map loads FREE

**You won't pay anything during development!** 🎉

---

## 🆘 Quick Troubleshooting

### If Payment Still Fails:
```bash
# Check your keys are set
cat .env.local | grep RAZORPAY

# Should show actual keys, not placeholders
# If shows placeholders, you need to add real keys
```

### If Maps Still Fail:
```bash
# Check your keys are set
cat .env.local | grep GOOGLE_MAPS

# Should show actual keys starting with AIza...
# If shows placeholders, you need to add real keys
```

### If Both Still Fail:
```bash
# Make sure you restarted the server!
# Press Ctrl+C to stop
npm run dev
```

---

## 📚 Detailed Guides

Need more help? Check these:

- **PAYMENT_AND_MAPS_SETUP.md** - Complete step-by-step guide
- **UPI_INTEGRATION_GUIDE.md** - Razorpay details
- **GOOGLE_MAPS_FIX.md** - Google Maps details

---

## 🎯 Summary

### What You Need:
1. **Razorpay Account** (free, 2 min signup)
2. **Google Cloud Account** (free, use existing Google account)

### What You'll Get:
1. **Working Payments** - Accept UPI, cards, etc.
2. **Working Maps** - Display locations, geocoding

### Time Required:
- **Razorpay**: 10 minutes
- **Google Maps**: 5 minutes
- **Total**: 15 minutes ⏱️

---

## ✨ After Setup

Your app will have:
- ✅ Full payment processing
- ✅ Map displays
- ✅ Address geocoding
- ✅ Location features
- ✅ No errors!

**Everything will work perfectly!** 🚀

---

*Start with Razorpay (easier), then do Google Maps!*
