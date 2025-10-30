# ✅ API Keys Setup Checklist

## 🎯 Current Status

### ❌ Missing Keys (Need Your Action)
- [ ] Razorpay Payment Keys
- [ ] Google Maps API Keys

### ✅ Already Configured
- [x] Database Connection
- [x] Gemini AI
- [x] JWT Secret
- [x] Cloudinary
- [x] Redis
- [x] N8N Webhooks
- [x] Instagram/Facebook

---

## 📋 Step-by-Step Checklist

### Part 1: Razorpay Payment Setup

#### Account Setup
- [ ] Go to https://razorpay.com/
- [ ] Click "Sign Up"
- [ ] Enter email and password
- [ ] Verify email
- [ ] Login to dashboard

#### Get API Keys
- [ ] Click "Settings" (gear icon)
- [ ] Click "API Keys"
- [ ] Click "Generate Test Key"
- [ ] Copy Key ID (starts with `rzp_test_`)
- [ ] Click eye icon to reveal Secret
- [ ] Copy Key Secret

#### Add to .env.local
- [ ] Open `.env.local` file
- [ ] Find Razorpay section
- [ ] Replace `RAZORPAY_KEY_ID` placeholder
- [ ] Replace `RAZORPAY_KEY_SECRET` placeholder
- [ ] Replace `NEXT_PUBLIC_RAZORPAY_KEY_ID` placeholder
- [ ] Save file

#### Test Payment
- [ ] Restart dev server (`npm run dev`)
- [ ] Go to checkout page
- [ ] Click "Pay Now"
- [ ] Razorpay popup opens
- [ ] Test with: `success@razorpay`
- [ ] Payment succeeds ✅

---

### Part 2: Google Maps Setup

#### Google Cloud Console
- [ ] Go to https://console.cloud.google.com/
- [ ] Sign in with Google account
- [ ] Select project: `genai-456413`

#### Enable APIs
- [ ] Click "APIs & Services"
- [ ] Click "Library"
- [ ] Search "Geocoding API"
- [ ] Click on it
- [ ] Click "ENABLE"
- [ ] Go back to Library
- [ ] Search "Maps JavaScript API"
- [ ] Click on it
- [ ] Click "ENABLE"

#### Create API Key
- [ ] Click "APIs & Services"
- [ ] Click "Credentials"
- [ ] Click "+ CREATE CREDENTIALS"
- [ ] Select "API Key"
- [ ] Copy the generated key

#### Restrict Key (Optional but Recommended)
- [ ] Click on your API key
- [ ] Under "Application restrictions"
- [ ] Select "HTTP referrers"
- [ ] Add: `http://localhost:3000/*`
- [ ] Under "API restrictions"
- [ ] Select "Restrict key"
- [ ] Check: Geocoding API
- [ ] Check: Maps JavaScript API
- [ ] Click "SAVE"

#### Add to .env.local
- [ ] Open `.env.local` file
- [ ] Find Google Maps section
- [ ] Replace `GOOGLE_MAPS_API_KEY` placeholder
- [ ] Replace `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` placeholder
- [ ] Save file

#### Test Maps
- [ ] Restart dev server (`npm run dev`)
- [ ] Go to dashboard
- [ ] Navigate to orders page
- [ ] Map displays correctly
- [ ] No console errors ✅

---

## 🎯 Final Verification

### Check Environment Variables
```bash
# Run this in terminal
cat .env.local | grep -E "RAZORPAY|GOOGLE_MAPS"
```

### Expected Output:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx ✅
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx ✅
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx ✅
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ✅
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ✅
```

### If You See Placeholders:
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here ❌
```
**You need to replace with actual keys!**

---

## 🧪 Testing Checklist

### Payment Testing
- [ ] Checkout page loads
- [ ] "Pay Now" button works
- [ ] Razorpay popup opens
- [ ] Test UPI: `success@razorpay` works
- [ ] Test Card: `4111 1111 1111 1111` works
- [ ] Payment confirmation received
- [ ] Order created successfully

### Maps Testing
- [ ] Dashboard loads without errors
- [ ] Orders page displays
- [ ] Map component renders
- [ ] Locations show on map
- [ ] No "API key not configured" error
- [ ] Console has no errors

---

## 💰 Cost Verification

### Razorpay
- [x] Using test keys (FREE)
- [ ] Production keys (2% fee per transaction)

### Google Maps
- [x] Within free tier ($200/month credit)
- [ ] Set up billing alerts (recommended)

---

## 🔒 Security Checklist

### Environment Variables
- [x] `.env.local` in `.gitignore`
- [x] Never commit API keys
- [x] Separate server/client keys

### Razorpay
- [x] Using test keys for development
- [ ] Will switch to live keys for production
- [ ] Webhook signature verification enabled

### Google Maps
- [ ] API key restricted by HTTP referrer
- [ ] API key restricted to specific APIs
- [ ] Billing alerts set up

---

## 📊 Progress Tracker

### Overall Progress: 0/2 Complete

- [ ] **Razorpay Setup** (0/7 steps)
  - [ ] Account created
  - [ ] Keys obtained
  - [ ] Keys added to .env.local
  - [ ] Server restarted
  - [ ] Payment tested
  - [ ] Test UPI works
  - [ ] Test card works

- [ ] **Google Maps Setup** (0/6 steps)
  - [ ] APIs enabled
  - [ ] API key created
  - [ ] Key restricted
  - [ ] Keys added to .env.local
  - [ ] Server restarted
  - [ ] Maps display correctly

---

## 🆘 Troubleshooting Checklist

### If Payment Fails
- [ ] Checked `.env.local` has actual keys (not placeholders)
- [ ] Restarted dev server
- [ ] Cleared browser cache
- [ ] Checked browser console for errors
- [ ] Verified Razorpay dashboard is accessible
- [ ] Confirmed using test keys (starts with `rzp_test_`)

### If Maps Fail
- [ ] Checked `.env.local` has actual keys (not placeholders)
- [ ] Restarted dev server
- [ ] Verified APIs are enabled in Google Cloud
- [ ] Waited 2-3 minutes after enabling APIs
- [ ] Checked API key restrictions
- [ ] Verified billing is enabled (even for free tier)

---

## 📚 Documentation Reference

- **QUICK_SETUP_GUIDE.md** - 15-minute quick start
- **PAYMENT_AND_MAPS_SETUP.md** - Detailed step-by-step
- **UPI_INTEGRATION_GUIDE.md** - Razorpay specifics
- **GOOGLE_MAPS_FIX.md** - Google Maps specifics

---

## ✨ Success Criteria

### You're Done When:
- ✅ No "Razorpay keys missing" error
- ✅ No "Google Maps API key not configured" error
- ✅ Payment flow works end-to-end
- ✅ Maps display correctly
- ✅ No console errors
- ✅ All features functional

---

## 🎉 After Completion

Your app will have:
- ✅ Full payment processing (UPI, cards, etc.)
- ✅ Interactive maps
- ✅ Address geocoding
- ✅ Location-based features
- ✅ Production-ready payment gateway
- ✅ Professional map displays

**Time to complete: ~15 minutes** ⏱️

---

*Print this checklist and check off items as you complete them!*
