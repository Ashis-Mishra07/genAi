// app/api/online-payment/route.ts
import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, notes } = await req.json(); // amount in paise (integer)
    const paise = Math.round(Number(amount));
    if (!paise || paise <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys missing' }, { status: 500 });
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await rzp.orders.create({
      amount: paise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    return NextResponse.json(
      { orderId: order.id, amount: order.amount, currency: order.currency, order },
      { status: 200 }
    );
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
