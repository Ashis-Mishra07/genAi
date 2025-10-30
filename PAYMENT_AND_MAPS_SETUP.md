# 🔑 Complete Setup Guide - Payment & Maps

## 🎯 Two Issues to Fix

1. ❌ **Razorpay Payment Error**: "Razorpay keys missing"
2. ❌ **Google Maps Error**: "API key not configured"

Let me guide you through both setups!

---

## 💳 Part 1: Razorpay Payment Setup

### What is Razorpay?
Razorpay is your payment gateway for accepting UPI, cards, and other payment methods in India.

### Step-by-Step Setup (10 minutes)

#### 1. Create Razorpay Account
- Visit: https://razorpay.com/
- Click **Sign Up** (it's FREE!)
- Complete registration with your email

#### 2. Get Your API Keys

**For Testing (Development):**
1. Login to Razorpay Dashboard
2. Go to: **Settings** → **API Keys**
3. Click **Generate Test Key**
4. You'll see:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxx` (click to reveal)
5. Copy both keys

**For Production (Later):**
1. Complete KYC verification
2. Switch to **Live Mode**
3. Generate Live Keys (starts with `rzp_live_`)

#### 3. Add Keys to .env.local

Open `.env.local` and replace the placeholders:

```env
# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_actual_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Important:**
- `RAZORPAY_KEY_ID` - Server-side key
- `RAZORPAY_KEY_SECRET` - Server-side secret (NEVER expose to client)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Client-side key (safe to expose)

#### 4. Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

#### 5. Test Payment

**Test Credentials:**
- **UPI ID**: `success@razorpay`
- **Card Number**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

**Test Flow:**
1. Go to checkout page
2. Click "Pay Now"
3. Razorpay popup opens
4. Use test credentials above
5. Payment succeeds! ✅

---

## 🗺️ Part 2: Google Maps Setup

### What is Google Maps API?
Used for displaying maps and converting addresses to coordinates (geocoding).

### Step-by-Step Setup (5 minutes)

#### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

#### 2. Select or Create Project
- Click project dropdown at top
- Select your existing project: **genai-456413**
- Or create a new one

#### 3. Enable Required APIs

**Enable Geocoding API:**
1. Go to: **APIs & Services** → **Library**
2. Search: "Geocoding API"
3. Click on it
4. Click **ENABLE**

**Enable Maps JavaScript API:**
1. Still in Library
2. Search: "Maps JavaScript API"
3. Click on it
4. Click **ENABLE**

#### 4. Create API Key

1. Go to: **APIs & Services** → **Credentials**
2. Click: **+ CREATE CREDENTIALS**
3. Select: **API Key**
4. Copy the generated key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

#### 5. Restrict API Key (Recommended)

**For Development:**
1. Click on your API key to edit
2. Under **Application restrictions**:
   - Select: **HTTP referrers (web sites)**
   - Add: `http://localhost:3000/*`
   - Add: `http://localhost:*/*`
3. Under **API restrictions**:
   - Select: **Restrict key**
   - Check: ✅ Geocoding API
   - Check: ✅ Maps JavaScript API
4. Click **SAVE**

**For Production (Later):**
- Add your production domain (e.g., `https://yourdomain.com/*`)

#### 6. Add to .env.local

Open `.env.local` and replace:

```env
# Google Maps API (for geocoding and maps)
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Note:** You can use the same key for both variables.

#### 7. Restart Dev Server
```bash
npm run dev
```

---

## 📋 Complete .env.local Template

Here's what your `.env.local` should look like with all keys:

```env
# Database Configuration
DATABASE_URL=postgresql://...your_database_url...

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Other APIs (already configured)
GEMINI_API_KEY=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
# ... rest of your keys
```

---

## 🧪 Testing Everything

### Test 1: Payment Flow
1. Go to: http://localhost:3000/customer/checkout
2. Add items to cart
3. Click "Pay Now"
4. Razorpay popup should open ✅
5. Use test credentials:
   - UPI: `success@razorpay`
   - Card: `4111 1111 1111 1111`
6. Payment succeeds ✅

### Test 2: Maps Display
1. Go to: http://localhost:3000/dashboard
2. Navigate to orders with addresses
3. Map should display locations ✅
4. No console errors ✅

### Test 3: Geocoding
```bash
# Run geocoding script
node geocode-orders-fixed.js
```
Should convert addresses to coordinates ✅

---

## 💰 Pricing (Both are FREE for development!)

### Razorpay
- **FREE** for testing
- Production: 2% transaction fee
- No setup fees
- No monthly fees

### Google Maps
- **$200 FREE credit per month**
- Geocoding: First 40,000 requests FREE
- Maps: First 28,000 loads FREE
- You'll stay within free tier! 🎉

---

## 🔒 Security Checklist

### ✅ Already Done
- `.env.local` is in `.gitignore`
- Separate server/client keys
- Environment variables properly configured

### 🔐 You Should Do

**For Razorpay:**
1. ✅ Never commit `RAZORPAY_KEY_SECRET`
2. ✅ Use test keys for development
3. ✅ Switch to live keys only in production
4. ✅ Enable webhook signature verification

**For Google Maps:**
1. ✅ Restrict API key by HTTP referrer
2. ✅ Restrict to specific APIs only
3. ✅ Monitor usage in Google Cloud Console
4. ✅ Set up billing alerts

---

## 🆘 Troubleshooting

### Razorpay Issues

**Error: "Razorpay keys missing"**
- ✅ Check `.env.local` has all 3 Razorpay keys
- ✅ Restart dev server
- ✅ Verify no typos in variable names

**Error: "Payment SDK not loaded"**
- ✅ Check internet connection
- ✅ Razorpay script should load from CDN
- ✅ Check browser console for errors

**Payment popup doesn't open**
- ✅ Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set
- ✅ Verify key starts with `rzp_test_` or `rzp_live_`
- ✅ Check browser console for errors

### Google Maps Issues

**Error: "API key not configured"**
- ✅ Check `.env.local` has both Google Maps keys
- ✅ Restart dev server
- ✅ Clear browser cache

**Error: "This API project is not authorized"**
- ✅ Enable Geocoding API in Google Cloud Console
- ✅ Enable Maps JavaScript API
- ✅ Wait 2-3 minutes for changes to propagate

**Error: "RefererNotAllowedMapError"**
- ✅ Add `http://localhost:3000/*` to API key restrictions
- ✅ Or temporarily remove restrictions for testing

**Map not loading**
- ✅ Check browser console for errors
- ✅ Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- ✅ Check API key restrictions allow your domain

---

## 📊 Quick Status Check

After setup, verify everything works:

```bash
# Check environment variables
cat .env.local | grep RAZORPAY
cat .env.local | grep GOOGLE_MAPS

# Should show your actual keys (not placeholders)
```

### Expected Results:
```
✅ RAZORPAY_KEY_ID=rzp_test_xxxxx (not placeholder)
✅ RAZORPAY_KEY_SECRET=xxxxx (not placeholder)
✅ NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx (not placeholder)
✅ GOOGLE_MAPS_API_KEY=AIzaSyxxxxx (not placeholder)
✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxx (not placeholder)
```

---

## 🎯 Summary

### To Fix Payment Error:
1. Sign up at https://razorpay.com/
2. Get test API keys
3. Add to `.env.local`
4. Restart server
5. Test with `success@razorpay`

### To Fix Maps Error:
1. Go to https://console.cloud.google.com/
2. Enable Geocoding API & Maps JavaScript API
3. Create API key
4. Add to `.env.local`
5. Restart server

### Both Take ~15 Minutes Total! ⏱️

---

## 📚 Additional Resources

### Razorpay
- [Dashboard](https://dashboard.razorpay.com/)
- [Documentation](https://razorpay.com/docs/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [API Reference](https://razorpay.com/docs/api/)

### Google Maps
- [Cloud Console](https://console.cloud.google.com/)
- [Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

---

## ✅ Final Checklist

- [ ] Created Razorpay account
- [ ] Got Razorpay test keys
- [ ] Added Razorpay keys to `.env.local`
- [ ] Created Google Cloud project
- [ ] Enabled Geocoding API
- [ ] Enabled Maps JavaScript API
- [ ] Created Google Maps API key
- [ ] Added Google Maps keys to `.env.local`
- [ ] Restarted dev server
- [ ] Tested payment flow
- [ ] Tested map display
- [ ] No errors in console

---

**Once you complete both setups, all features will work perfectly!** 🎉💳🗺️

Need help? Check the troubleshooting section or the detailed guides:
- `UPI_INTEGRATION_GUIDE.md` - Razorpay details
- `GOOGLE_MAPS_FIX.md` - Google Maps details
