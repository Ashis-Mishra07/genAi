# n8n Webhook Troubleshooting Guide

## Error: "Cannot POST /webhook/artisan-order-notification"

This error indicates that the n8n webhook is not properly configured or the n8n instance is not responding correctly.

## Quick Fix Checklist

### 1. **Verify n8n Instance is Running**
```bash
# Check if n8n is accessible
curl https://n8n-1-lpl8.onrender.com/healthz
```

**Expected Response**: 200 OK or health status
**If fails**: Your n8n instance may be sleeping (free tier) or down

### 2. **Check Workflow is Active**
1. Login to your n8n instance: https://n8n-1-lpl8.onrender.com
2. Navigate to "Workflows"
3. Find "Artisan Order Notification Email"
4. Ensure the toggle switch is **ON (Active)**
5. Check the webhook node has the correct path: `artisan-order-notification`

### 3. **Verify Webhook URL**
Your current webhook URL in `.env.local`:
```
N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL=https://n8n-1-lpl8.onrender.com/webhook/artisan-order-notification
```

**Test the webhook manually:**
```bash
curl -X POST https://n8n-1-lpl8.onrender.com/webhook/artisan-order-notification \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "TEST-001",
    "artisanName": "Test Artisan",
    "artisanEmail": "test@example.com",
    "customerName": "Test Customer",
    "products": [{"id":"1","name":"Test Product","quantity":1,"price":100}],
    "shippingAddress": {
      "fullName": "Test",
      "addressLine1": "123 Test St",
      "city": "Test City",
      "state": "Test State",
      "postalCode": "123456",
      "country": "India",
      "phone": "1234567890"
    },
    "paymentMethod": "cod",
    "createdAt": "2025-11-01T00:00:00Z"
  }'
```

### 4. **Common Issues & Solutions**

#### Issue: Webhook Path Mismatch
**Symptom**: 404 Not Found or Cannot POST
**Solution**: 
- Check webhook node configuration in n8n
- Ensure path matches: `artisan-order-notification`
- Full URL should be: `https://your-n8n-instance.com/webhook/artisan-order-notification`

#### Issue: n8n Instance Sleeping (Render Free Tier)
**Symptom**: First request fails, subsequent requests work
**Solution**:
- Upgrade to paid plan OR
- Implement retry logic in application
- Wake up n8n before sending critical emails

#### Issue: Gmail OAuth Not Connected
**Symptom**: Workflow activates but email fails to send
**Solution**:
1. Open workflow in n8n
2. Click on "Send Gmail to Artisan" node
3. Check Gmail credentials are connected
4. Re-authenticate if needed

#### Issue: Wrong n8n Instance URL
**Symptom**: All webhook calls fail
**Solution**:
- Verify your n8n instance URL
- Update `.env.local` with correct URL
- Restart Next.js dev server

### 5. **Enhanced Error Logging**

The application now provides detailed logging when email notifications fail:

**Success Log Example:**
```
✅ Artisan notification email sent successfully to artisan@example.com
   Order: ORD-12345 | Products: 3 | Total: ₹1,500.00
```

**Failure Log Example:**
```
❌ Failed to send artisan notification email (HTTP 404): Cannot POST /webhook/artisan-order-notification
Webhook URL: https://n8n-1-lpl8.onrender.com/webhook/artisan-order-notification
Artisan: John Artisan <john@example.com>
Order: ORD-12345 with 3 products
```

### 6. **Alternative Email Solutions**

If n8n continues to fail, consider these alternatives:

#### Option A: Use Direct Gmail API (No n8n)
```typescript
// Install: npm install nodemailer
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password
  }
});

await transporter.sendMail({
  from: process.env.GMAIL_USER,
  to: artisanEmail,
  subject: '🎉 New Order!',
  html: emailHtml
});
```

#### Option B: Use SendGrid
```typescript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: artisanEmail,
  from: 'noreply@yourwebsite.com',
  subject: '🎉 New Order!',
  html: emailHtml
});
```

#### Option C: Use Resend (Modern Email API)
```typescript
// Install: npm install resend
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: artisanEmail,
  subject: '🎉 New Order!',
  html: emailHtml
});
```

### 7. **Testing Email Notifications**

After fixing the webhook, test with a real order:

1. **Place a test order** through the checkout flow
2. **Monitor server logs** for email notification attempts:
   ```
   📬 Sending notifications to 1 artisan(s) for order ORD-12345
   📧 Sending artisan notification to artisan@example.com for order ORD-12345
   ✅ Artisan notification email sent successfully to artisan@example.com
   ```
3. **Check artisan's inbox** for the notification email
4. **Verify email content**:
   - Order number is correct
   - Products list is accurate
   - Shipping address is complete
   - Earnings total is correct

### 8. **Webhook Security (Production)**

For production deployment, secure your n8n webhooks:

```typescript
// Add webhook authentication
const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET // Add secret
  },
  body: JSON.stringify(notificationData),
});
```

In n8n, validate the secret in the webhook node.

## Current Implementation Status

✅ **Improved Error Handling**: Detailed logs with context
✅ **Non-Blocking**: Order creation succeeds even if emails fail
✅ **Professional Logging**: Emojis and structured output
✅ **Graceful Degradation**: System continues working without emails
⚠️ **Webhook Configuration**: Requires n8n instance to be active

## Next Steps

1. **Verify n8n instance is running** and workflow is active
2. **Test webhook endpoint** with curl command above
3. **Place a test order** and check logs
4. **Consider implementing retry logic** for failed emails
5. **Set up monitoring** for n8n webhook health
6. **Implement fallback email service** for critical notifications

## Contact Support

If issues persist:
- Check n8n workflow execution logs
- Verify Gmail OAuth credentials
- Test with a different email address
- Consider switching to alternative email provider
