import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface PaymentReminderRequest {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  orderId: string;
  orderAmount: number;
  dueDate: string;
  daysPastDue: number;
  reminderType: 'gentle' | 'urgent' | 'final';
  paymentUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentReminderRequest = await request.json();
    
    // Validate required fields
    if (!body.customerEmail || !body.customerName || !body.orderId || !body.orderAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get email configuration from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error('Payment reminder email configuration missing');
      return NextResponse.json(
        { success: false, error: 'Email service not configured for payment reminders' },
        { status: 500 }
      );
    }

    // Create transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Payment reminder email transporter verified successfully');
    } catch (verificationError) {
      console.error('Payment reminder email transporter verification failed:', verificationError);
      return NextResponse.json(
        { success: false, error: 'Payment reminder email service configuration error' },
        { status: 500 }
      );
    }

    // Get reminder content based on type
    const { subject, urgencyIndicator, messageHtml, messageText } = getPaymentReminderContent(body);

    // Email content
    const mailOptions = {
      from: {
        name: 'Artisan Marketplace - Payment Team',
        address: emailUser
      },
      to: body.customerEmail,
      subject: subject,
      html: messageHtml,
      text: messageText,
      // Add headers to help with deliverability
      headers: {
        'X-Priority': body.reminderType === 'final' ? '1 (Highest)' : body.reminderType === 'urgent' ? '2 (High)' : '3 (Normal)',
        'X-MSMail-Priority': body.reminderType === 'final' ? 'High' : 'Normal'
      }
    };

    // Send email
    console.log(`Sending ${body.reminderType} payment reminder email to ${body.customerEmail}...`);
    const result = await transporter.sendMail(mailOptions);
    console.log('Payment reminder email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Payment reminder email sent successfully',
      messageId: result.messageId,
      reminderType: body.reminderType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending payment reminder email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send payment reminder email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getPaymentReminderContent(data: PaymentReminderRequest) {
  const { customerName, orderId, orderAmount, dueDate, daysPastDue, reminderType, paymentUrl } = data;
  const formattedAmount = `₹${orderAmount.toLocaleString()}`;
  const formattedDueDate = new Date(dueDate).toLocaleDateString();

  let subject: string;
  let urgencyIndicator: string;
  let messageHtml: string;
  let messageText: string;

  switch (reminderType) {
    case 'gentle':
      subject = `Friendly Reminder: Payment Due for Order #${orderId}`;
      urgencyIndicator = '💙';
      messageHtml = createGentleReminderHTML(data, formattedAmount, formattedDueDate);
      messageText = createGentleReminderText(data, formattedAmount, formattedDueDate);
      break;
    
    case 'urgent':
      subject = `URGENT: Payment Overdue for Order #${orderId} - ${daysPastDue} Days Late`;
      urgencyIndicator = '⚠️';
      messageHtml = createUrgentReminderHTML(data, formattedAmount, formattedDueDate);
      messageText = createUrgentReminderText(data, formattedAmount, formattedDueDate);
      break;
    
    case 'final':
      subject = `FINAL NOTICE: Payment Required for Order #${orderId} - Action Required`;
      urgencyIndicator = '🚨';
      messageHtml = createFinalReminderHTML(data, formattedAmount, formattedDueDate);
      messageText = createFinalReminderText(data, formattedAmount, formattedDueDate);
      break;
    
    default:
      subject = `Payment Reminder for Order #${orderId}`;
      urgencyIndicator = '💳';
      messageHtml = createGentleReminderHTML(data, formattedAmount, formattedDueDate);
      messageText = createGentleReminderText(data, formattedAmount, formattedDueDate);
  }

  return { subject, urgencyIndicator, messageHtml, messageText };
}

function createGentleReminderHTML(data: PaymentReminderRequest, formattedAmount: string, formattedDueDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Reminder</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e1e5e9; border-top: none; }
        .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #218838; }
        .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .highlight { color: #28a745; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💙 Friendly Payment Reminder</h1>
          <p>Artisan Marketplace</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.customerName}! 👋</h2>
          
          <p>We hope you're enjoying your purchase from our talented artisans! This is a gentle reminder that your payment is currently due.</p>
          
          <div class="order-details">
            <h3>📦 Order Details</h3>
            <p><strong>Order ID:</strong> #${data.orderId}</p>
            <p><strong>Amount Due:</strong> <span class="highlight">${formattedAmount}</span></p>
            <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            ${data.daysPastDue > 0 ? `<p><strong>Days Past Due:</strong> <span style="color: #ffc107;">${data.daysPastDue} days</span></p>` : ''}
          </div>
          
          <p>💳 <strong>Making your payment is easy!</strong> Simply click the button below to securely complete your payment:</p>
          
          ${data.paymentUrl ? `<div style="text-align: center;"><a href="${data.paymentUrl}" class="button">Pay Now - ${formattedAmount}</a></div>` : ''}
          
          <p>🎨 <strong>Why your payment matters:</strong> Your payment directly supports independent artisans and helps keep our marketplace thriving. Each purchase makes a difference in an artisan's life!</p>
          
          <p>❓ <strong>Questions or concerns?</strong> We're here to help! Feel free to reach out to our support team if you have any questions about your order or payment.</p>
          
          <p>Thank you for supporting our artisan community! ✨</p>
          
          <p>Best regards,<br>
          The Artisan Marketplace Team</p>
        </div>
        
        <div class="footer">
          <p>📧 Need help? Contact us at <a href="mailto:support@artisans.ai">support@artisans.ai</a></p>
          <p>🌐 Visit us at <a href="https://artisans.ai">artisans.ai</a></p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            This is an automated payment reminder. If you've already made this payment, please allow 1-2 business days for processing.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createUrgentReminderHTML(data: PaymentReminderRequest, formattedAmount: string, formattedDueDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Urgent Payment Reminder</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #fd7e14 0%, #e63946 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e1e5e9; border-top: none; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #c82333; }
        .order-details { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .highlight { color: #dc3545; font-weight: bold; }
        .urgent { background: #f8d7da; padding: 15px; border-radius: 8px; border: 1px solid #f5c6cb; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ URGENT: Payment Overdue</h1>
          <p>Artisan Marketplace</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h2>⏰ Immediate Action Required</h2>
            <p><strong>Your payment is now ${data.daysPastDue} days overdue.</strong> Please make your payment as soon as possible to avoid any service disruption.</p>
          </div>
          
          <h2>Dear ${data.customerName},</h2>
          
          <p>We've attempted to collect payment for your order, but your account remains past due. This is an urgent reminder that immediate payment is required.</p>
          
          <div class="order-details">
            <h3>📦 Overdue Order Details</h3>
            <p><strong>Order ID:</strong> #${data.orderId}</p>
            <p><strong>Amount Due:</strong> <span class="highlight">${formattedAmount}</span></p>
            <p><strong>Original Due Date:</strong> ${formattedDueDate}</p>
            <p><strong>Days Past Due:</strong> <span class="highlight">${data.daysPastDue} days</span></p>
          </div>
          
          <p>🚨 <strong>Why this matters:</strong> Continued non-payment may result in:</p>
          <ul>
            <li>Account restrictions</li>
            <li>Additional late fees</li>
            <li>Impact on your credit standing</li>
            <li>Possible collection actions</li>
          </ul>
          
          <p>💳 <strong>Pay now to avoid further complications:</strong></p>
          
          ${data.paymentUrl ? `<div style="text-align: center;"><a href="${data.paymentUrl}" class="button">Pay Now - ${formattedAmount}</a></div>` : ''}
          
          <p>💬 <strong>Need help?</strong> If you're experiencing financial difficulties or have questions about your account, please contact us immediately. We're here to work with you on a solution.</p>
          
          <p>Thank you for your immediate attention to this matter.</p>
          
          <p>Regards,<br>
          Artisan Marketplace Payment Team</p>
        </div>
        
        <div class="footer">
          <p>📞 <strong>Urgent Contact:</strong> <a href="mailto:payments@artisans.ai">payments@artisans.ai</a></p>
          <p>⏰ <strong>Payment Portal:</strong> <a href="https://artisans.ai/payments">artisans.ai/payments</a></p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            If you've recently made this payment, please contact us immediately to update your account status.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createFinalReminderHTML(data: PaymentReminderRequest, formattedAmount: string, formattedDueDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Final Notice - Payment Required</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6f42c1 0%, #e63946 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e1e5e9; border-top: none; }
        .button { display: inline-block; background: #6f42c1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; animation: pulse 2s infinite; }
        .button:hover { background: #5a2d91; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .order-details { background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .highlight { color: #dc3545; font-weight: bold; }
        .final-notice { background: #721c24; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 FINAL NOTICE</h1>
          <p><strong>Payment Required Within 48 Hours</strong></p>
          <p>Artisan Marketplace</p>
        </div>
        
        <div class="content">
          <div class="final-notice">
            <h2>⚡ CRITICAL: Last Chance to Pay</h2>
            <p><strong>This is your final notice before collection procedures begin.</strong></p>
            <p><strong>Payment must be received within 48 hours.</strong></p>
          </div>
          
          <h2>FINAL NOTICE - ${data.customerName}</h2>
          
          <p><strong>This is your final opportunity to resolve this overdue account before it is forwarded to our collections department.</strong></p>
          
          <div class="order-details">
            <h3>🔥 FINAL NOTICE - Order Details</h3>
            <p><strong>Order ID:</strong> #${data.orderId}</p>
            <p><strong>Amount Due:</strong> <span class="highlight">${formattedAmount}</span></p>
            <p><strong>Original Due Date:</strong> ${formattedDueDate}</p>
            <p><strong>Days Past Due:</strong> <span class="highlight">${data.daysPastDue} days</span></p>
            <p><strong>Final Payment Deadline:</strong> <span class="highlight">${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></p>
          </div>
          
          <p>🚨 <strong>CONSEQUENCES OF NON-PAYMENT:</strong></p>
          <ul style="color: #dc3545; font-weight: bold;">
            <li>Account will be sent to collections</li>
            <li>Credit reporting agencies will be notified</li>
            <li>Additional collection fees will be added</li>
            <li>Legal action may be pursued</li>
            <li>Permanent account suspension</li>
          </ul>
          
          <p>💳 <strong>AVOID COLLECTIONS - PAY NOW:</strong></p>
          
          ${data.paymentUrl ? `<div style="text-align: center;"><a href="${data.paymentUrl}" class="button">URGENT: Pay ${formattedAmount} NOW</a></div>` : ''}
          
          <p style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7;">
            ⚠️ <strong>Last Chance:</strong> If you believe this notice is in error or need to discuss payment arrangements, you must contact us within 24 hours at <a href="mailto:collections@artisans.ai">collections@artisans.ai</a> or call our emergency payment line.
          </p>
          
          <p><strong>This is your final notice. Act now to avoid collections.</strong></p>
          
          <p>Collections Department<br>
          Artisan Marketplace</p>
        </div>
        
        <div class="footer">
          <p>🔥 <strong>URGENT CONTACT:</strong> <a href="mailto:collections@artisans.ai">collections@artisans.ai</a></p>
          <p>📞 <strong>Emergency Payment Line:</strong> 1-800-PAY-NOW</p>
          <p>⚡ <strong>Pay Immediately:</strong> <a href="https://artisans.ai/emergency-payment">artisans.ai/emergency-payment</a></p>
          <p style="font-size: 11px; color: #666; margin-top: 20px;">
            <strong>LEGAL NOTICE:</strong> This is an attempt to collect a debt. Any information obtained will be used for that purpose.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createGentleReminderText(data: PaymentReminderRequest, formattedAmount: string, formattedDueDate: string): string {
  return `
Friendly Payment Reminder - Artisan Marketplace

Hello ${data.customerName}!

We hope you're enjoying your purchase from our talented artisans! This is a gentle reminder that your payment is currently due.

Order Details:
- Order ID: #${data.orderId}
- Amount Due: ${formattedAmount}
- Due Date: ${formattedDueDate}
${data.daysPastDue > 0 ? `- Days Past Due: ${data.daysPastDue} days` : ''}

Making your payment is easy! ${data.paymentUrl ? `Visit: ${data.paymentUrl}` : 'Contact us for payment options.'}

Why your payment matters: Your payment directly supports independent artisans and helps keep our marketplace thriving.

Questions or concerns? Contact our support team at support@artisans.ai

Thank you for supporting our artisan community!

Best regards,
The Artisan Marketplace Team
  `;
}

function createUrgentReminderText(data: PaymentReminderRequest, formattedAmount: string, formattedDueDate: string): string {
  return `
URGENT: Payment Overdue - Artisan Marketplace

IMMEDIATE ACTION REQUIRED

Dear ${data.customerName},

Your payment is now ${data.daysPastDue} days overdue. Please make your payment immediately to avoid service disruption.

Overdue Order Details:
- Order ID: #${data.orderId}
- Amount Due: ${formattedAmount}
- Original Due Date: ${formattedDueDate}
- Days Past Due: ${data.daysPastDue} days

Continued non-payment may result in:
- Account restrictions
- Additional late fees
- Impact on credit standing
- Possible collection actions

PAY NOW: ${data.paymentUrl || 'Contact payments@artisans.ai immediately'}

Need help? Contact us immediately if you're experiencing difficulties.

Regards,
Artisan Marketplace Payment Team
  `;
}

function createFinalReminderText(data: PaymentReminderRequest, formattedAmount: string, formattedDueDate: string): string {
  return `
FINAL NOTICE - Payment Required Within 48 Hours

CRITICAL: Last Chance to Pay
This is your final notice before collection procedures begin.

FINAL NOTICE - ${data.customerName}

This is your final opportunity to resolve this overdue account before it is forwarded to our collections department.

FINAL NOTICE - Order Details:
- Order ID: #${data.orderId}
- Amount Due: ${formattedAmount}
- Original Due Date: ${formattedDueDate}
- Days Past Due: ${data.daysPastDue} days
- Final Payment Deadline: ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}

CONSEQUENCES OF NON-PAYMENT:
- Account sent to collections
- Credit reporting
- Additional fees
- Legal action
- Account suspension

AVOID COLLECTIONS - PAY NOW: ${data.paymentUrl || 'collections@artisans.ai'}

Last Chance: Contact us within 24 hours at collections@artisans.ai if you believe this is in error.

This is your final notice. Act now to avoid collections.

Collections Department
Artisan Marketplace

LEGAL NOTICE: This is an attempt to collect a debt.
  `;
}