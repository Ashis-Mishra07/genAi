# Email Notification System - Setup Guide

## 📧 Overview

This system sends beautiful HTML email notifications for:
1. **Order Confirmation** - Customer receives order details
2. **Artisan Notification** - Artisan gets notified when their products are sold
3. **Cart Addition** - Customer gets email when items are added to cart

## 🎯 Architecture

```
Customer Action → Next.js API → n8n Webhook → Gmail → Email Sent
```

## 📁 Files Created

### n8n Workflows (Import these to n8n)
- `n8n-workflows/order-confirmation-email.json` - Customer order confirmation
- `n8n-workflows/artisan-order-notification.json` - Artisan sales notification
- `n8n-workflows/cart-addition-email.json` - Cart addition reminder

### Backend Integration
- `lib/email-service.ts` - Email service with webhook triggers
- `app/api/orders/route.ts` - Updated with order email notifications
- `app/api/cart/route.ts` - Updated with cart email notifications

## 🚀 Setup Instructions

### Step 1: Import Workflows to n8n

1. Open your n8n instance at: `https://n8n-quq4.onrender.com`
2. Click **"Workflows"** → **"Import from File"**
3. Import each JSON file:
   - `order-confirmation-email.json`
   - `artisan-order-notification.json`
   - `cart-addition-email.json`

### Step 2: Configure Gmail in n8n

For each workflow, you need to set up Gmail credentials:

1. Click on the **"Send Gmail"** node
2. Click **"Create New Credentials"**
3. Select **"Gmail OAuth2"**
4. Follow the OAuth setup:
   - Go to Google Cloud Console
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://n8n-quq4.onrender.com/rest/oauth2-credential/callback`
   - Copy Client ID and Secret to n8n
   - Authorize the connection

### Step 3: Activate Workflows

1. Open each workflow in n8n
2. Click **"Active"** toggle (top right)
3. Copy the webhook URL from the webhook node
4. The URLs should be:
   - Order: `https://n8n-quq4.onrender.com/webhook/order-confirmation`
   - Artisan: `https://n8n-quq4.onrender.com/webhook/artisan-order-notification`
   - Cart: `https://n8n-quq4.onrender.com/webhook/cart-addition-notification`

### Step 4: Verify .env.local Configuration

Your `.env.local` already has the correct URLs:
```bash
N8N_ORDER_CONFIRMATION_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/order-confirmation
N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/artisan-order-notification
N8N_CART_ADDITION_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/cart-addition-notification
```

✅ **No changes needed if URLs match your n8n instance!**

### Step 5: Test the System

#### Test Order Confirmation:
```bash
# Run your Next.js app
npm run dev

# Place a test order through your app
# Or use curl:
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "test-product-id",
        "name": "Test Product",
        "price": 100,
        "quantity": 1
      }
    ],
    "total": 100,
    "shippingAddress": {
      "fullName": "Test User",
      "addressLine1": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India",
      "phone": "9876543210"
    },
    "paymentMethod": "cod"
  }'
```

#### Test Cart Addition:
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "test-product-id",
    "quantity": 1
  }'
```

## 📊 Email Templates

### Order Confirmation Email Features:
- 🎨 Beautiful gradient header
- 📦 Order number and date
- 📋 Itemized product list with images
- 💰 Subtotal, shipping, and total
- 📍 Shipping address
- 🔗 Track order button
- 📞 Support contact info

### Artisan Notification Email Features:
- 🎊 Congratulations header
- 💵 Total earnings highlighted
- 📊 Order statistics (items sold, order number)
- 🛍️ Products sold with quantities and prices
- 👤 Customer details
- 📍 Shipping address
- ⚡ Next steps checklist
- 🔗 Dashboard link

### Cart Addition Email Features:
- 🛒 Shopping cart header
- 🖼️ Product image and details
- 📈 Cart summary (total items, total amount)
- 🎁 Features showcase (free shipping, secure checkout, etc.)
- 🔗 View cart and continue shopping buttons
- 💡 Product recommendations

## 🔧 Troubleshooting

### Emails Not Sending?

1. **Check n8n workflow execution logs:**
   - Open n8n → Executions tab
   - Look for errors in webhook calls

2. **Check Gmail credentials:**
   - Ensure OAuth is properly configured
   - Verify Gmail API is enabled
   - Check token hasn't expired

3. **Check webhook URLs:**
   - Ensure URLs in `.env.local` match n8n
   - Workflows must be **Active** (not paused)

4. **Check Next.js logs:**
   - Look for console messages about email sending
   - Check for network errors

### Common Issues:

**Issue**: "Email webhook not configured"
- **Fix**: Add the webhook URLs to `.env.local`

**Issue**: "Failed to send email"
- **Fix**: Check n8n workflow is active and Gmail credentials are valid

**Issue**: Emails in spam folder
- **Fix**: Configure SPF/DKIM records for your domain (if using custom domain)

## 🎨 Customization

### Update Email Design:
1. Open the workflow JSON file
2. Find the `jsCode` in "Format Email Data" node
3. Modify the HTML template
4. Re-import to n8n

### Update Sender Email:
1. Change Gmail credentials in n8n
2. Use a different Gmail account for sending

### Add More Email Types:
1. Create new workflow JSON (use existing as template)
2. Add new function to `lib/email-service.ts`
3. Call from relevant API route

## 🔐 Security Notes

- ✅ Webhook URLs use HTTPS
- ✅ Gmail OAuth2 for secure authentication
- ✅ No sensitive data in email templates
- ✅ Error handling prevents order failure if email fails

## 📈 Monitoring

Monitor email delivery in:
1. **n8n Executions** - See webhook call success/failure
2. **Gmail Sent Folder** - Verify emails were sent
3. **Next.js Logs** - Check API call logs

## 🎯 Best Practices

1. **Test in development** before deploying to production
2. **Monitor n8n execution logs** regularly
3. **Set up email alerts** for workflow failures in n8n
4. **Keep Gmail quota in mind** (daily send limits)
5. **Use dedicated Gmail account** for transactional emails

## 🚀 Production Checklist

- [ ] Import all 3 workflows to production n8n
- [ ] Configure Gmail OAuth with production credentials
- [ ] Activate all workflows in n8n
- [ ] Update production `.env` with webhook URLs
- [ ] Test all email types
- [ ] Monitor first few orders/cart additions
- [ ] Set up n8n execution alerts
- [ ] Configure proper sender email address
- [ ] Add SPF/DKIM records (if using custom domain)

## 📞 Support

If you encounter issues:
1. Check n8n execution logs first
2. Review Next.js console for errors
3. Verify all environment variables are set
4. Test webhooks manually using curl/Postman
5. Check Gmail API quotas and limits

---

**Status**: ✅ All workflows created and ready to import!
**Last Updated**: October 22, 2025
