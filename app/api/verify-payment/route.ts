// app/api/verify-payment/route.ts
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Missing fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ verified: false, error: 'Missing secret' }, { status: 500 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }

    // At this point, you may also fetch the Razorpay Order via SDK and cross-check amount/currency.
    return NextResponse.json({ verified: true }, { status: 200 });
  } catch (e) {
    console.error('Verify error:', e);
    return NextResponse.json({ verified: false, error: 'Verification error' }, { status: 500 });
  }
}
