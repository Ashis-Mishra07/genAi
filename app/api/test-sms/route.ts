import { sendNotification } from '@/lib/notification-service';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Testing SMS notification...');
    
    const result = await sendNotification({
      type: 'refund_status_update',
      customerName: 'Tejash Kumar',
      customerEmail: 'tejash@gmail.com', 
      customerPhone: '9876543210', // Replace with your test number if needed
      data: {
        refundId: 'REF-TEST-001',
        orderId: 'ORD-TEST-123',
        amount: '2500',
        oldStatus: 'pending',
        newStatus: 'approved',
        adminNotes: 'Test notification - Refund approved after verification.'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'SMS test completed',
      results: {
        sms: {
          success: result.sms.success,
          error: result.sms.error?.message || null
        },
        email: {
          success: result.email.success,
          error: result.email.error?.message || null
        }
      }
    });

  } catch (error: any) {
    console.error('SMS test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SMS Test Endpoint - Send POST request to test SMS notifications'
  });
}