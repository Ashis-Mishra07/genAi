import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test email configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    // Test Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    const configuration = {
      email: {
        configured: !!(emailUser && emailPass),
        user: emailUser ? emailUser.substring(0, 3) + '***' + emailUser.substring(emailUser.indexOf('@')) : 'Not set',
        password: emailPass ? '***' + emailPass.substring(emailPass.length - 4) : 'Not set'
      },
      sms: {
        configured: !!(accountSid && authToken && twilioPhoneNumber),
        accountSid: accountSid ? accountSid.substring(0, 10) + '...' : 'Not set',
        authToken: authToken ? '***' + authToken.substring(authToken.length - 4) : 'Not set',
        phoneNumber: twilioPhoneNumber || 'Not set'
      },
      apis: {
        emailEndpoint: '/api/payment-reminders/email',
        smsEndpoint: '/api/payment-reminders/sms',
        serviceEndpoint: '/api/payment-reminders/service',
        testEndpoint: '/api/payment-reminders/test'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Payment reminder system configuration',
      configuration,
      ready: configuration.email.configured && configuration.sms.configured,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Configuration test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testType, recipient } = await request.json();

    switch (testType) {
      case 'email':
        return await testEmailSending(recipient);
      case 'sms':
        return await testSMSSending(recipient);
      case 'both':
        const emailResult = await testEmailSending(recipient);
        const smsResult = await testSMSSending(recipient);
        
        return NextResponse.json({
          success: true,
          message: 'Both tests completed',
          results: {
            email: await emailResult.json(),
            sms: await smsResult.json()
          }
        });
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type. Use: email, sms, or both' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Test execution error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function testEmailSending(recipient: string) {
  try {
    const testEmailData = {
      customerEmail: recipient,
      customerName: 'Test Customer',
      orderId: 'TEST-001',
      orderAmount: 2500,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      daysPastDue: 5,
      reminderType: 'gentle' as const,
      paymentUrl: 'https://payments.artisans.ai/test'
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/payment-reminders/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmailData)
    });

    const result = await response.json();
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Test email failed',
      details: result,
      recipient
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Email test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient
    });
  }
}

async function testSMSSending(recipient: string) {
  try {
    const testSMSData = {
      customerPhone: recipient,
      customerName: 'Test Customer',
      orderId: 'TEST-001',
      orderAmount: 2500,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      daysPastDue: 5,
      reminderType: 'gentle' as const,
      paymentUrl: 'https://payments.artisans.ai/test'
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/payment-reminders/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSMSData)
    });

    const result = await response.json();
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test SMS sent successfully!' : 'Test SMS failed',
      details: result,
      recipient
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'SMS test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient
    });
  }
}