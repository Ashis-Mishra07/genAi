import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface SupportEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export async function POST(request: NextRequest) {
  try {
    const body: SupportEmailRequest = await request.json();
    
    // Validate required fields
    if (!body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get email configuration from environment variables
    const supportEmail = process.env.SUPPORT_EMAIL;
    const supportEmailPassword = process.env.SUPPORT_EMAIL_PASSWORD;
    const supportEmailName = process.env.SUPPORT_EMAIL_NAME || 'Artisan Marketplace Support';

    if (!supportEmail || !supportEmailPassword) {
      console.error('Email configuration missing in environment variables');
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create transporter for Gmail
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: supportEmail,
        pass: supportEmailPassword
      }
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verificationError) {
      console.error('Email transporter verification failed:', verificationError);
      return NextResponse.json(
        { success: false, error: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Priority indicator for subject
    const priorityIndicator = {
      low: '🔵',
      medium: '🟡',
      high: '🔴'
    }[body.priority];

    // Email content
    const mailOptions = {
      from: {
        name: supportEmailName,
        address: supportEmail
      },
      to: supportEmail, // Send to your support email
      replyTo: body.email, // Customer can reply directly
      subject: `${priorityIndicator} [${body.priority.toUpperCase()} PRIORITY] ${body.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Support Request</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .priority-high { border-left: 4px solid #dc3545; }
            .priority-medium { border-left: 4px solid #ffc107; }
            .priority-low { border-left: 4px solid #28a745; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #555; }
            .value { background: #f8f9fa; padding: 10px; border-radius: 4px; margin-top: 5px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header priority-${body.priority}">
              <h2>🎫 New Support Request</h2>
              <p><strong>Priority:</strong> <span style="text-transform: uppercase;">${body.priority}</span> ${priorityIndicator}</p>
              <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="field">
              <div class="label">👤 Customer Name:</div>
              <div class="value">${body.name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Customer Email:</div>
              <div class="value">${body.email}</div>
            </div>
            
            <div class="field">
              <div class="label">📋 Subject:</div>
              <div class="value">${body.subject}</div>
            </div>
            
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="value">${body.message.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="footer">
              <p>📱 This message was sent from the Artisan Marketplace Customer Support Portal.</p>
              <p>🔄 Reply to this email to respond directly to the customer.</p>
              <p>⏰ Expected response time: ${body.priority === 'high' ? '2-4 hours' : body.priority === 'medium' ? '8-12 hours' : '24-48 hours'}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Support Request - ${body.priority.toUpperCase()} PRIORITY

Customer Name: ${body.name}
Customer Email: ${body.email}
Subject: ${body.subject}

Message:
${body.message}

---
This message was sent from the Artisan Marketplace Customer Support Portal.
Reply to this email to respond directly to the customer.
Received: ${new Date().toISOString()}
      `
    };

    // Send email
    console.log('Sending support email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Support email sent successfully',
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending support email:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send support email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}