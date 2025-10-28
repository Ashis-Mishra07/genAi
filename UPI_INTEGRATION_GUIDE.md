# UPI Payment Integration Guide

## 🎯 Overview
This project now includes **Razorpay UPI Payment Integration** for seamless online payments.

## ✅ Implementation Details

### Features Added:
1. **Razorpay Payment Gateway** - Support for UPI, Cards, Net Banking, and Wallets
2. **Payment Verification** - Server-side signature verification for security
3. **Dual Payment Options** - Cash on Delivery (COD) + Online Payment
4. **Checkout Flow** - Complete checkout page with payment selection

### Files Modified/Created:

#### API Routes:
- `app/api/online-payment/route.ts` - Creates Razorpay orders
- `app/api/verify-payment/route.ts` - Verifies payment signatures

#### Frontend:
- `app/customer/checkout/page.tsx` - Checkout page with Razorpay integration

#### Database:
- `prisma/schema.prisma` - Updated with payment fields:
  - `payment_method` (cod/online)
  - `payment_status` (pending/completed/failed)
  - `payment_details` (JSON field for transaction data)

## 🔧 Environment Variables Required

Add these to your `.env` file (on Vercel too):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## 📋 Vercel Deployment Checklist

### 1. Environment Variables Setup in Vercel
Go to your Vercel project → Settings → Environment Variables and add:

✅ `RAZORPAY_KEY_ID`
✅ `RAZORPAY_KEY_SECRET`
✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID`
✅ `DATABASE_URL`
✅ All other existing environment variables

### 2. Database Migration
Before deploying, ensure your database schema is updated:

```bash
npm run db:push
# or
npx prisma db push
```

### 3. Testing Payment Flow

#### Test Mode (Development):
1. Use Razorpay test keys (starts with `rzp_test_`)
2. Test UPI ID: `success@razorpay`
3. Test Card: `4111 1111 1111 1111` (any CVV, future expiry)

#### Production Mode:
1. Switch to live keys from Razorpay Dashboard
2. Complete KYC verification on Razorpay
3. Enable required payment methods

## 🚀 How It Works

### Payment Flow:

1. **User selects "Online Payment"** at checkout
2. **Frontend calls** `/api/online-payment` with amount
3. **Server creates** Razorpay order and returns `orderId`
4. **Razorpay Checkout** modal opens for user to pay
5. **After payment**, Razorpay returns `payment_id`, `order_id`, `signature`
6. **Frontend calls** `/api/verify-payment` to verify signature
7. **Server verifies** using HMAC SHA256
8. **If verified**, order is created with status "CONFIRMED"
9. **Cart is cleared** and user redirected to orders page

### Security Features:
- ✅ Server-side signature verification using HMAC SHA256
- ✅ Environment variables for sensitive keys
- ✅ No client-side key exposure (only public key)
- ✅ Order amount verification

## 🧪 Testing Before Push

### 1. Build Test:
```bash
npm run build
```

### 2. Start Production Build:
```bash
npm start
```

### 3. Test Checkout Flow:
- Add items to cart
- Go to checkout
- Fill shipping address
- Select "Online Payment"
- Complete test payment
- Verify order creation

## ⚠️ Important Notes

### For Vercel Deployment:
1. ✅ Ensure `next.config.ts` has `output: 'standalone'` (already configured)
2. ✅ TypeScript and ESLint errors are ignored during build (already configured)
3. ✅ Razorpay Checkout.js is loaded from CDN (no build step needed)
4. ✅ Payment verification happens server-side (secure)

### Common Issues & Solutions:

#### Issue: "Razorpay is not defined"
**Solution:** Razorpay script loads from CDN. Check if external scripts are allowed in your CSP.

#### Issue: Payment succeeds but order not created
**Solution:** Check `/api/verify-payment` logs and ensure signature verification passes.

#### Issue: Vercel build fails
**Solution:** 
- Check environment variables are set
- Ensure `prisma generate` runs in build step (already in package.json)
- Check `next.config.ts` has build error ignoring enabled

## 📦 Dependencies Added

```json
{
  "razorpay": "^2.9.6"
}
```

## 🔐 Security Best Practices

1. ✅ **Never expose** `RAZORPAY_KEY_SECRET` on client-side
2. ✅ **Always verify** payment signatures server-side
3. ✅ **Use environment variables** for all sensitive data
4. ✅ **Validate amounts** on server before creating orders
5. ✅ **Log payment attempts** for auditing

## 📱 Payment Methods Supported

With Razorpay integration, users can pay via:
- 💳 **UPI** (Google Pay, PhonePe, Paytm, etc.)
- 💳 **Credit/Debit Cards**
- 🏦 **Net Banking**
- 📱 **Wallets** (Paytm, PhonePe, etc.)
- 📱 **EMI Options**

## 🎨 UI Features

- Modern checkout interface
- Payment method selection cards
- Delivery method options (Standard/Express)
- Shipping address form with validation
- Order summary with price breakdown
- Secure checkout indicators

## 📞 Support

For issues with:
- **Razorpay Integration**: Check [Razorpay Docs](https://razorpay.com/docs/)
- **Deployment**: Check Vercel logs and build output
- **Payment Testing**: Use Razorpay test credentials

---

**Last Updated:** October 28, 2025
**Integration Status:** ✅ Complete and Ready for Production
