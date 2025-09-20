import { NextRequest, NextResponse } from 'next/server';
const twilio = require('twilio');

interface PaymentReminderSMSRequest {
  customerPhone: string;
  customerName: string;
  orderId: string;
  orderAmount: number;
  dueDate: string;
  daysPastDue: number;
  reminderType: 'gentle' | 'urgent' | 'final';
  paymentUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentReminderSMSRequest = await request.json();
    
    // Validate required fields
    if (!body.customerPhone || !body.customerName || !body.orderId || !body.orderAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Twilio configuration from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Twilio SMS configuration missing');
      return NextResponse.json(
        { success: false, error: 'SMS service not configured' },
        { status: 500 }
      );
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(body.customerPhone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Format phone number (ensure it starts with +)
    let formattedPhone = body.customerPhone.replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      // Assume Indian number if no country code
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    // Get SMS content based on reminder type
    const smsMessage = getSMSContent(body);

    try {
      // Send SMS
      console.log(`Sending ${body.reminderType} payment reminder SMS to ${formattedPhone}...`);
      const message = await client.messages.create({
        body: smsMessage,
        from: twilioPhoneNumber,
        to: formattedPhone
      });

      console.log('SMS sent successfully:', message.sid);

      return NextResponse.json({
        success: true,
        message: 'Payment reminder SMS sent successfully',
        messageSid: message.sid,
        reminderType: body.reminderType,
        phoneNumber: formattedPhone,
        timestamp: new Date().toISOString()
      });

    } catch (twilioError: any) {
      console.error('Twilio SMS error:', twilioError);
      
      // Handle specific Twilio errors
      let errorMessage = 'Failed to send SMS';
      if (twilioError.code === 21211) {
        errorMessage = 'Invalid phone number';
      } else if (twilioError.code === 21614) {
        errorMessage = 'Phone number not verified or invalid';
      } else if (twilioError.code === 21408) {
        errorMessage = 'Permission denied or account issue';
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          twilioError: twilioError.message,
          twilioCode: twilioError.code
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending payment reminder SMS:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send payment reminder SMS',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getSMSContent(data: PaymentReminderSMSRequest): string {
  const { customerName, orderId, orderAmount, daysPastDue, reminderType, paymentUrl } = data;
  const formattedAmount = `₹${orderAmount.toLocaleString()}`;
  const shortUrl = paymentUrl ? shortenUrl(paymentUrl) : 'Contact us for payment options';

  switch (reminderType) {
    case 'gentle':
      return `Hi ${customerName}! 👋

Friendly reminder: Payment due for Order #${orderId}
Amount: ${formattedAmount}
${daysPastDue > 0 ? `(${daysPastDue} days overdue)` : ''}

Pay now: ${shortUrl}

Thanks for supporting our artisans! ✨
- Artisan Marketplace`;

    case 'urgent':
      return `⚠️ URGENT: Payment Overdue

${customerName}, your payment is ${daysPastDue} days late!

Order #${orderId}: ${formattedAmount}

Pay immediately to avoid restrictions:
${shortUrl}

Questions? Reply HELP
- Artisan Marketplace`;

    case 'final':
      return `🚨 FINAL NOTICE - ${customerName}

CRITICAL: Payment required within 48 hours!

Order #${orderId}: ${formattedAmount}
${daysPastDue} days overdue

AVOID COLLECTIONS - Pay now:
${shortUrl}

This is your last chance before legal action.
- Artisan Marketplace Collections`;

    default:
      return `Payment reminder for Order #${orderId}
Amount: ${formattedAmount}
Pay: ${shortUrl}
- Artisan Marketplace`;
  }
}

function shortenUrl(url: string): string {
  // In production, you might want to use a URL shortener service
  // For now, just return the original URL or a shortened version
  if (url.length > 50) {
    return url.substring(0, 47) + '...';
  }
  return url;
}

// GET endpoint to test SMS configuration
export async function GET(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'SMS service not configured',
        config: {
          accountSid: accountSid ? 'Set' : 'Missing',
          authToken: authToken ? 'Set' : 'Missing',
          phoneNumber: twilioPhoneNumber ? 'Set' : 'Missing'
        }
      });
    }

    // Test Twilio connection
    const client = twilio(accountSid, authToken);
    
    try {
      const account = await client.api.accounts(accountSid).fetch();
      
      return NextResponse.json({
        success: true,
        message: 'SMS service configured correctly',
        config: {
          accountSid: accountSid?.substring(0, 10) + '...',
          phoneNumber: twilioPhoneNumber,
          accountStatus: account.status,
          accountName: account.friendlyName
        }
      });
    } catch (twilioError: any) {
      return NextResponse.json({
        success: false,
        error: 'Twilio configuration error',
        details: twilioError.message
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test SMS configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}