# Google Maps Integration Setup Guide

## 📍 **Google Maps Order Locations Feature**

This feature allows admins to view and analyze the geographic distribution of orders on an interactive Google Maps interface.

### 🔑 **Required API Keys**

You need to enable and configure the following Google APIs:

1. **Google Maps JavaScript API**
2. **Google Geocoding API**

### 📋 **Setup Instructions**

#### Step 1: Enable Google APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services > Library**
4. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**

#### Step 2: Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the generated API key
4. (Optional) Restrict the key to your domains for security

#### Step 3: Update Environment Variables

Replace the placeholder values in your `.env.local` file:

```bash
# Replace with your actual Google Maps API key
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
```

### 🚀 **Features Included**

1. **Interactive Map Display**

   - Order locations plotted with colored markers
   - Status-based color coding
   - Info windows with order details

2. **Analytics Dashboard**

   - Total orders vs. geocoded orders
   - Coverage rate percentage
   - Order distribution stats

3. **Filtering Options**

   - Date range filtering
   - Order status filtering
   - Real-time updates

4. **Geocoding Management**
   - Automatic address-to-coordinates conversion
   - Bulk geocoding for existing orders
   - Error handling and retry logic

### 📍 **Navigation**

The Order Locations feature is accessible via:

- **Dashboard > Order Locations** (new menu item)
- Direct URL: `/dashboard/order-locations`

### 🗄️ **Database Changes**

The following fields have been added to the `orders` table:

- `shipping_latitude` (Float, nullable)
- `shipping_longitude` (Float, nullable)
- `location_geocoded_at` (DateTime, nullable)

### 🔧 **Usage**

1. Navigate to **Order Locations** in the dashboard
2. Click **"Update Locations"** to geocode recent orders
3. Use **"Geocode All"** to process all existing orders
4. Apply filters to view specific order subsets
5. Click map markers to view order details

### ⚠️ **Important Notes**

- Geocoding uses Google's API and may incur costs for high volumes
- Rate limiting is implemented (100ms between requests)
- Failed geocoding attempts are logged for troubleshooting
- Coordinates are cached to avoid repeated API calls

### 💰 **Cost Considerations**

- Google Maps JavaScript API: $7 per 1,000 map loads
- Geocoding API: $5 per 1,000 requests
- Consider setting up billing alerts and quotas
