# Email Workflow Testing Guide

## 📋 Test Files Created

4 test files have been created to test your email workflows:

1. **`test-email-workflows.js`** - Tests all 3 workflows at once
2. **`test-order-email.js`** - Tests order confirmation email only
3. **`test-artisan-email.js`** - Tests artisan notification email only
4. **`test-cart-email.js`** - Tests cart addition email only

## 🚀 Quick Start

### Step 1: Update Test Email Addresses

Before running tests, open each test file and change:
```javascript
const TEST_EMAIL = 'your-test-email@gmail.com';
```
To your actual email address (e.g., your Gmail).

### Step 2: Make Sure n8n Workflows Are Active

1. Go to your n8n instance: `https://n8n-quq4.onrender.com`
2. Check that all 3 workflows are **ACTIVE** (toggle should be ON)
3. Verify Gmail credentials are configured in each workflow

### Step 3: Run Tests

#### Test All Workflows at Once:
```bash
node test-email-workflows.js
```

#### Test Individual Workflows:
```bash
# Test order confirmation only
node test-order-email.js

# Test artisan notification only
node test-artisan-email.js

# Test cart addition only
node test-cart-email.js
```

## 📧 What to Expect

### Test Order Email:
- **Subject**: Order Confirmed - ORD-2025-XXXXXX
- **To**: Your test email
- **Contains**:
  - Order number and date
  - 3 sample products with images
  - Total: ₹4,600
  - Shipping address
  - Track order button

### Test Artisan Email:
- **Subject**: 🎉 New Order! 3 Products Sold - ₹10,550
- **To**: Your test email
- **Contains**:
  - Congratulations message
  - 3 products sold
  - Total earnings
  - Customer details
  - Shipping address
  - Dashboard link

### Test Cart Email:
- **Subject**: 🛒 Handcrafted Terracotta Flower Vase added to your cart!
- **To**: Your test email
- **Contains**:
  - Product details with image
  - Cart summary (5 items, ₹4,299)
  - View cart button
  - Continue shopping button
  - Features (free shipping, etc.)

## 🔍 Troubleshooting

### ❌ "Connection refused" or "ECONNREFUSED"
**Problem**: Can't connect to n8n webhook
**Solutions**:
1. Check if n8n instance is running
2. Verify webhook URLs in test files match your n8n instance
3. Make sure workflows are ACTIVE in n8n

### ❌ Status Code: 401 or 403
**Problem**: Authentication issue
**Solutions**:
1. Check Gmail credentials in n8n workflow
2. Re-authenticate Gmail OAuth in n8n
3. Verify Gmail API is enabled in Google Cloud Console

### ❌ Status Code: 500
**Problem**: n8n workflow error
**Solutions**:
1. Check n8n execution logs (Executions tab)
2. Look for errors in workflow nodes
3. Verify Gmail node configuration
4. Check JavaScript code in "Format Email Data" node

### ❌ Email not received
**Problem**: Email sent but not in inbox
**Solutions**:
1. **Check spam/junk folder** (most common!)
2. Wait a few minutes (email delivery can be delayed)
3. Check n8n execution logs - was email actually sent?
4. Verify correct email address in test file
5. Check Gmail sending limits (500 emails/day)

### ❌ HTML looks broken
**Problem**: Email formatting issues
**Solutions**:
1. Email client may not support all CSS
2. Check if images are loading (need internet connection)
3. Try viewing in different email client (Gmail web, Outlook, etc.)

## 📊 Test Data Summary

### Sample Products Used:
- Handwoven Silk Saree (₹2,500)
- Brass Diya Set (₹450 × 2)
- Wooden Carved Elephant (₹1,200)
- Terracotta Flower Vase (₹899)
- Banarasi Silk Saree (₹3,500)
- Cotton Dupatta (₹850)

### Sample Customers:
- John Doe (Order customer)
- Jane Smith (Cart customer)
- Priya Sharma (Cart customer)
- Rajesh Kumar (Order customer)

### Sample Artisans:
- Lakshmi Textiles
- Kumar Metalworks
- Rajesh Wood Crafts
- Pottery Studio

## 🎯 Testing Checklist

After running tests, verify:

- [ ] Email received in inbox (or spam folder)
- [ ] Email subject is correct
- [ ] Recipient email is correct
- [ ] Product images load properly
- [ ] Product names and prices are correct
- [ ] Order/cart totals calculate correctly
- [ ] Buttons/links work (optional - depends on your app)
- [ ] Email looks good on mobile (forward to phone)
- [ ] No spelling or formatting errors
- [ ] Brand colors and design look professional

## 🔧 Customizing Test Data

You can customize the test data by editing the test files:

```javascript
// Change customer details
customerName: 'Your Name',
customerEmail: 'your-email@example.com',

// Change product details
products: [
  {
    id: 'custom-id',
    name: 'Custom Product Name',
    price: 999,
    quantity: 1,
    imageUrl: 'https://your-image-url.com/image.jpg'
  }
]

// Change totals
total: 999,
cartStats: {
  totalItems: 5,
  totalAmount: 2999
}
```

## 📝 Example Test Output

```
🧪 Testing Order Confirmation Email

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Recipient: test@example.com
📦 Order Number: ORD-2025-123456
💰 Total: ₹4600
📋 Items: 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 Sending request to n8n webhook...

Status Code: 200
✅ SUCCESS! Email sent.

Response: {"success":true,"message":"Order confirmation email sent"}

📧 Check your inbox for the order confirmation email!
   (Check spam folder if you don't see it)
```

## 🚨 Important Notes

1. **Update email addresses** before running tests (default is placeholder)
2. **Check spam folder** if you don't see emails
3. **n8n must be running** and workflows must be active
4. **Gmail limits**: 500 emails per day on free accounts
5. **Test in development** before using in production
6. Images use Unsplash - require internet connection

## 🎉 Next Steps

After successful testing:

1. ✅ Verify email design looks good
2. ✅ Test with real orders in your app
3. ✅ Monitor n8n execution logs
4. ✅ Set up error alerts in n8n (optional)
5. ✅ Deploy to production

---

**Need help?** Check the main setup guide in `EMAIL_NOTIFICATION_SETUP.md`
