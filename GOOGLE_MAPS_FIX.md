# 🗺️ Google Maps API Key Setup

## Issue
You're seeing: **"Google Maps API key not configured"**

## Why This Happened
The Google Maps API key was missing from your `.env.local` file. The app needs this key for:
- Geocoding addresses (converting addresses to coordinates)
- Displaying order locations on maps
- Location-based features

## ✅ Fixed
I've added the Google Maps API key placeholders to `.env.local`:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 🔑 How to Get Your Google Maps API Key

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create or Select a Project
- Click on the project dropdown at the top
- Create a new project or select your existing one (`genai-456413`)

### Step 3: Enable APIs
Go to **APIs & Services** → **Library** and enable:
- ✅ **Geocoding API** (for address to coordinates)
- ✅ **Maps JavaScript API** (for displaying maps)
- ✅ **Places API** (optional, for address autocomplete)

### Step 4: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy the generated API key

### Step 5: Restrict Your API Key (Recommended)
1. Click on your API key to edit it
2. Under **Application restrictions**:
   - For development: Choose "None" or "HTTP referrers" with `http://localhost:3000/*`
   - For production: Add your domain
3. Under **API restrictions**:
   - Select "Restrict key"
   - Choose: Geocoding API, Maps JavaScript API
4. Click **Save**

### Step 6: Add to Your .env.local
Replace the placeholder values:

```env
# Server-side (for geocoding)
GOOGLE_MAPS_API_KEY=AIza...your_actual_key_here

# Client-side (for maps display)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...your_actual_key_here
```

**Note:** You can use the same key for both, or create separate keys for better security.

### Step 7: Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 Where It's Used

### Server-Side (GOOGLE_MAPS_API_KEY)
- `lib/services/geocoding-service.ts` - Geocoding addresses
- `geocode-*.js` scripts - Batch geocoding orders

### Client-Side (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
- `components/dashboard/OrderMap.tsx` - Displaying order locations on map
- Any map components in the UI

## 💰 Pricing
Google Maps API has a free tier:
- **$200 free credit per month**
- Geocoding: $5 per 1,000 requests (after free tier)
- Maps JavaScript API: $7 per 1,000 loads (after free tier)

For most development and small-scale apps, you'll stay within the free tier.

## 🔒 Security Best Practices

### 1. Never Commit API Keys
Your `.env.local` is already in `.gitignore` ✅

### 2. Use Restrictions
- Restrict by HTTP referrer for client-side keys
- Restrict by IP for server-side keys (in production)
- Restrict to specific APIs

### 3. Monitor Usage
- Check Google Cloud Console regularly
- Set up billing alerts
- Monitor for unusual activity

### 4. Separate Keys for Environments
```env
# Development
GOOGLE_MAPS_API_KEY=AIza...dev_key

# Production (in Vercel/hosting platform)
GOOGLE_MAPS_API_KEY=AIza...prod_key
```

## 🧪 Testing

After adding your API key:

### Test Geocoding
```bash
# Run a geocoding script
node geocode-orders-fixed.js
```

### Test Map Display
1. Navigate to the dashboard
2. Go to orders with addresses
3. Check if the map displays correctly

### Check Console
Open browser DevTools and look for:
- ✅ "Google Maps API Key: Present"
- ✅ Map loads without errors
- ❌ No "API key not configured" errors

## 🆘 Troubleshooting

### Error: "API key not configured"
- Check `.env.local` has the keys
- Restart dev server
- Verify no typos in variable names

### Error: "This API project is not authorized"
- Enable the required APIs in Google Cloud Console
- Wait a few minutes for changes to propagate

### Error: "RefererNotAllowedMapError"
- Add your domain to API key restrictions
- For localhost: Add `http://localhost:3000/*`

### Map Not Loading
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- Check API key restrictions

### Geocoding Fails
- Verify `GOOGLE_MAPS_API_KEY` (without NEXT_PUBLIC) is set
- Check Geocoding API is enabled
- Verify API key has permission for Geocoding API

## 📚 Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Geocoding API Guide](https://developers.google.com/maps/documentation/geocoding)
- [Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## ✅ Quick Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Geocoding API
- [ ] Enabled Maps JavaScript API
- [ ] Created API key
- [ ] Added restrictions to API key
- [ ] Added key to `.env.local`
- [ ] Restarted dev server
- [ ] Tested geocoding
- [ ] Tested map display
- [ ] Set up billing alerts

---

**Once you add your actual Google Maps API key, the error will disappear!** 🗺️✨
