# Instagram n8n Workflow Setup Instructions

## 🎯 Overview

This guide shows how to connect your Cloudinary poster URLs to Instagram posting via n8n workflow automation.

## 📋 What You Need to Do in n8n

### Step 1: Import the Workflow

1. Open n8n (http://localhost:5678)
2. Click "Import from File"
3. Select: `n8n-workflows/instagram-poster-auto-post.json`
4. Import the workflow

### Step 2: Configure the Webhook

1. **Select the "Webhook" node**
2. **Set webhook path**: `instagram-post`
3. **Method**: `POST`
4. **Copy the webhook URL** (it should be: `http://localhost:5678/webhook/instagram-post`)

### Step 3: Update Environment Variable

Update your `.env` file with the webhook URL:

```env
N8N_INSTAGRAM_WEBHOOK_URL="http://localhost:5678/webhook/instagram-post"
```

### Step 4: Configure Facebook Graph API Credentials

1. **Select "Creating Container ID" node**
2. **Add Facebook Graph API credentials**:

   - Access Token: Your Instagram Business Account access token
   - App ID: Your Facebook App ID
   - App Secret: Your Facebook App Secret

3. **Select "Facebook Graph API" node**
4. **Use the same Facebook Graph API credentials**

### Step 5: Test the Workflow

1. **Activate the workflow** (toggle the switch on)
2. **Go to your products page** (`localhost:3000/dashboard/products`)
3. **Click "Add to Instagram" on any product**
4. **Check the logs** in both n8n and your browser console

## 🔄 Data Flow

```
Product Page → API Endpoint → n8n Webhook → Instagram
     ↓              ↓             ↓           ↓
Cloudinary URL → JSON Payload → Graph API → Posted!
```

## 📊 Expected Data Format

The n8n webhook will receive:

```json
{
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/poster.jpg",
  "captionText": "✨ Product Name ✨\n\nDescription...\n\n#hashtags",
  "Node": "17841477359386904",
  "productId": 123,
  "timestamp": "2025-10-25T10:30:00.000Z"
}
```

## 🧪 Testing

### Manual Test in n8n:

1. Use the webhook URL in Postman/curl:

```bash
curl -X POST http://localhost:5678/webhook/instagram-post \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/test.jpg",
    "captionText": "Test post from n8n! 🚀",
    "Node": "17841477359386904"
  }'
```

### Full Integration Test:

1. Create a poster in the chatbot
2. Go to products page
3. Click "Add to Instagram"
4. Check Instagram for the post

## 🔧 Troubleshooting

### If webhook doesn't work:

- Check n8n is running (`http://localhost:5678`)
- Verify webhook URL in `.env` file
- Ensure workflow is activated
- Check n8n execution logs

### If Instagram posting fails:

- Verify Facebook Graph API credentials
- Check Instagram Business Account permissions
- Ensure image URL is publicly accessible
- Check Instagram API rate limits

### If Cloudinary URL is missing:

- Verify poster was uploaded to Cloudinary
- Check browser console for upload logs
- Ensure products have valid image_url

## 📝 Important Notes

1. **Image URLs must be publicly accessible** - Cloudinary URLs work perfectly
2. **Instagram Business Account required** - Personal accounts won't work
3. **Facebook App must have Instagram permissions** - Check your app settings
4. **Rate limits apply** - Don't spam Instagram API

## 🎉 Success Indicators

When working correctly, you'll see:

- ✅ Cloudinary upload logs in browser console
- ✅ n8n execution success in workflow view
- ✅ Instagram post appears on your account
- ✅ Success alert in the products page

## 🆘 Support

If you encounter issues:

1. Check browser console logs
2. Check n8n execution logs
3. Verify all environment variables
4. Test webhook manually with curl/Postman
