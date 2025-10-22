# Email Notification System - Quick Reference

## ✅ What's Been Implemented

### 3 n8n Workflows Created:
1. **Order Confirmation** (`order-confirmation-email.json`)
   - Triggers: When customer places order
   - Sends to: Customer
   - Contains: Order details, items, shipping address, total

2. **Artisan Notification** (`artisan-order-notification.json`)
   - Triggers: When products are purchased
   - Sends to: Each artisan whose products were sold
   - Contains: Products sold, earnings, customer details

3. **Cart Addition** (`cart-addition-email.json`)
   - Triggers: When customer adds item to cart
   - Sends to: Customer
   - Contains: Product details, cart summary, CTAs

### Backend Integration:
- ✅ Email service with webhook triggers (`lib/email-service.ts`)
- ✅ Orders API integrated (`app/api/orders/route.ts`)
- ✅ Cart API integrated (`app/api/cart/route.ts`)
- ✅ Environment variables configured (`.env.local`)

## 🎯 Answer to Your Question:

### Should you use 1 combined workflow or 3 separate workflows?

**✅ RECOMMENDED: Keep 3 Separate Workflows**

**Why?**
1. **Easier debugging** - If order emails fail, cart emails still work
2. **Better organization** - Each workflow has clear purpose
3. **Flexible control** - Can disable cart emails independently
4. **Cleaner UI** - Each workflow is simple and readable
5. **Production ready** - Industry best practice

**When to combine workflows?**
- Only if you have 10+ similar email types
- Only if they share complex logic
- Not recommended for your use case

## 🚀 Quick Start (3 Steps)

### Step 1: Import to n8n (5 minutes)
```bash
# Go to your n8n instance
https://n8n-quq4.onrender.com

# Import each file:
- order-confirmation-email.json
- artisan-order-notification.json  
- cart-addition-email.json
```

### Step 2: Configure Gmail (5 minutes)
- Set up Gmail OAuth2 in each workflow
- Use your Gmail account or create dedicated one
- Authorize access

### Step 3: Activate & Test (2 minutes)
- Toggle workflows to "Active"
- Verify webhook URLs match `.env.local`
- Test by placing an order or adding to cart

## 📧 Email Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CUSTOMER ACTIONS                      │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Adds to Cart      Places Order       Order Created
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Cart API    │   │  Orders API  │   │  Orders API  │
│ /api/cart    │   │ /api/orders  │   │ /api/orders  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ n8n Webhook  │   │ n8n Webhook  │   │ n8n Webhook  │
│ Cart Email   │   │ Order Email  │   │Artisan Email │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Gmail API   │   │  Gmail API   │   │  Gmail API   │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
    Customer           Customer            Artisan
   📧 Cart Email     📧 Order Confirm   📧 Sale Alert
```

## 🎨 Email Preview

### Customer Order Confirmation:
```
Subject: Order Confirmed - ORD-2025-123456

🎉 Order Confirmed!
Thank you for your purchase

Hi [Customer Name],
Your order has been confirmed...

Order Number: ORD-2025-123456
Order Date: Oct 22, 2025

[Product Images & Details]
Total: ₹1,299.00

[Track Your Order Button]
```

### Artisan Notification:
```
Subject: 🎉 New Order! 3 Products Sold - ₹1,299.00

🎊 Congratulations!
Your products have been sold

Hi [Artisan Name],
Great news! You've received a new order...

Order #: ORD-2025-123456
Items Sold: 3
Earnings: ₹1,299.00

[Product List with Earnings]
[Customer & Shipping Details]
[View Order Details Button]
```

### Cart Addition:
```
Subject: 🛒 [Product Name] added to your cart!

🛒 Added to Your Cart!
Ready to checkout?

Hi [Customer Name],
Great choice! You've added...

[Product Image & Details]
Cart Total: ₹599.00

[View Cart & Checkout Button]
[Continue Shopping Button]
```

## 🔥 Key Features

### All Emails Include:
- ✨ Beautiful gradient design
- 📱 Mobile responsive
- 🖼️ Product images
- 💰 Price details
- 🔗 Call-to-action buttons
- 📞 Support contact info
- 🎨 Professional branding

### Smart Logic:
- 🚫 Orders don't fail if email fails
- 📊 Automatic cart total calculation
- 👥 Multiple artisan notifications per order
- 🛡️ Error handling and logging

## 📝 Environment Variables (Already Set!)

```bash
# In your .env.local:
N8N_ORDER_CONFIRMATION_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/order-confirmation
N8N_ARTISAN_NOTIFICATION_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/artisan-order-notification
N8N_CART_ADDITION_WEBHOOK_URL=https://n8n-quq4.onrender.com/webhook/cart-addition-notification
```

## 🎯 Next Steps

1. **Import workflows** to n8n (use the 3 JSON files)
2. **Configure Gmail** OAuth in each workflow
3. **Activate workflows** in n8n
4. **Test** by placing an order or adding to cart
5. **Monitor** n8n execution logs

## 💡 Pro Tips

- Use a **dedicated Gmail account** for sending emails
- Set up **n8n execution alerts** for failures
- **Test in development** before production
- **Monitor Gmail quota** (daily send limits)
- Keep workflows **active** at all times

---

**Everything is ready! Just import the workflows and configure Gmail.** 🚀
