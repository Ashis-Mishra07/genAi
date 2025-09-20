import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'mishralucky074@gmail.com',
    pass: process.env.EMAIL_PASS || 'yrle bezd fesh hieh',
  },
};

// SMS configuration (Twilio)
const smsConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'AC7541d47d533c4ff9571e7956fbe0079a',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'b5f851e0c398d5f0ff3a69bb6c1ec4ba',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+16693123723',
};

interface NotificationData {
  type: 'ticket_created' | 'ticket_status_update' | 'refund_request' | 'refund_status_update';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  data: any;
}

// Email templates
const getEmailTemplate = (type: string, data: any): { subject: string; html: string } => {
  const baseStyle = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .highlight { background-color: #f0f8ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
    .status-badge { padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .status-pending { background-color: #fff3cd; color: #856404; }
    .status-approved { background-color: #d4edda; color: #155724; }
    .status-rejected { background-color: #f8d7da; color: #721c24; }
  `;

  switch (type) {
    case 'ticket_created':
      return {
        subject: `Support Ticket Created - #${data.ticketId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎫 Support Ticket Created</h1>
                <p>We've received your request and will respond soon</p>
              </div>
              <div class="content">
                <p>Dear <strong>${data.customerName}</strong>,</p>
                
                <p>Thank you for contacting our support team. Your ticket has been successfully created and our team will review it shortly.</p>
                
                <div class="highlight">
                  <h3>📋 Ticket Details</h3>
                  <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
                  <p><strong>Subject:</strong> ${data.subject}</p>
                  <p><strong>Category:</strong> ${data.category}</p>
                  <p><strong>Priority:</strong> <span class="status-badge status-${data.priority}">${data.priority}</span></p>
                  <p><strong>Status:</strong> <span class="status-badge status-pending">Open</span></p>
                </div>
                
                <div class="highlight">
                  <h4>📝 Your Message:</h4>
                  <p style="font-style: italic;">"${data.description}"</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our support team will review your ticket within 24 hours</li>
                  <li>You'll receive updates via email as we work on your request</li>
                  <li>You can track your ticket status in your customer dashboard</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/help" class="button">Track Your Ticket</a>
                </div>
                
                <p>If you have any urgent concerns, please don't hesitate to contact us directly.</p>
                
                <p>Best regards,<br>
                <strong>Customer Support Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>For immediate assistance, visit our help center or contact support.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 'ticket_status_update':
      const statusColors: { [key: string]: string } = {
        'in-progress': 'background-color: #cce5ff; color: #004085;',
        'resolved': 'background-color: #d4edda; color: #155724;',
        'closed': 'background-color: #e2e3e5; color: #383d41;'
      };
      
      return {
        subject: `Ticket Update - #${data.ticketId} [${data.newStatus.toUpperCase()}]`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Ticket Status Update</h1>
                <p>Your support ticket has been updated</p>
              </div>
              <div class="content">
                <p>Dear <strong>${data.customerName}</strong>,</p>
                
                <p>We have an update on your support ticket. Here are the latest details:</p>
                
                <div class="highlight">
                  <h3>🔄 Status Change</h3>
                  <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
                  <p><strong>Previous Status:</strong> <span class="status-badge" style="${statusColors[data.oldStatus] || 'background-color: #f8f9fa; color: #495057;'}">${data.oldStatus}</span></p>
                  <p><strong>New Status:</strong> <span class="status-badge" style="${statusColors[data.newStatus] || 'background-color: #f8f9fa; color: #495057;'}">${data.newStatus}</span></p>
                </div>
                
                ${data.adminNotes ? `
                <div class="highlight">
                  <h4>💬 Update from Support Team:</h4>
                  <p style="font-style: italic;">"${data.adminNotes}"</p>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/help" class="button">View Ticket Details</a>
                </div>
                
                <p>Thank you for your patience as we work to resolve your request.</p>
                
                <p>Best regards,<br>
                <strong>Customer Support Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 'refund_request':
      return {
        subject: `Refund Request Received - Order #${data.orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Refund Request Submitted</h1>
                <p>We're processing your refund request</p>
              </div>
              <div class="content">
                <p>Dear <strong>${data.customerName}</strong>,</p>
                
                <p>Thank you for submitting your refund request. We have received your request and it is now under review.</p>
                
                <div class="highlight">
                  <h3>📋 Refund Request Details</h3>
                  <p><strong>Request ID:</strong> ${data.refundId}</p>
                  <p><strong>Order ID:</strong> ${data.orderId}</p>
                  <p><strong>Refund Amount:</strong> ₹${data.amount.toLocaleString()}</p>
                  <p><strong>Reason:</strong> ${data.reason.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Priority:</strong> <span class="status-badge status-${data.priority}">${data.priority}</span></p>
                  <p><strong>Status:</strong> <span class="status-badge status-pending">Under Review</span></p>
                </div>
                
                <div class="highlight">
                  <h4>📝 Your Request:</h4>
                  <p style="font-style: italic;">"${data.description}"</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>Our team will review your refund request within 2-3 business days</li>
                  <li>You'll receive email updates on the status of your refund</li>
                  <li>If approved, the refund will be processed within 5-7 business days</li>
                  <li>The refund will be credited to your original payment method</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/orders" class="button">Track Refund Status</a>
                </div>
                
                <p>If you have any questions about your refund request, please contact our support team.</p>
                
                <p>Best regards,<br>
                <strong>Refunds Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>For questions about your refund, contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    case 'refund_status_update':
      const refundStatusColors: { [key: string]: string } = {
        'approved': 'background-color: #d4edda; color: #155724;',
        'rejected': 'background-color: #f8d7da; color: #721c24;',
        'processed': 'background-color: #d1ecf1; color: #0c5460;'
      };
      
      return {
        subject: `Refund Update - ${data.newStatus.toUpperCase()} - Order #${data.orderId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${baseStyle}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💰 Refund Status Update</h1>
                <p>Your refund request has been ${data.newStatus}</p>
              </div>
              <div class="content">
                <p>Dear <strong>${data.customerName}</strong>,</p>
                
                <p>We have an update regarding your refund request:</p>
                
                <div class="highlight">
                  <h3>🔄 Refund Status Change</h3>
                  <p><strong>Request ID:</strong> ${data.refundId}</p>
                  <p><strong>Order ID:</strong> ${data.orderId}</p>
                  <p><strong>Refund Amount:</strong> ₹${data.amount.toLocaleString()}</p>
                  <p><strong>Previous Status:</strong> <span class="status-badge" style="background-color: #fff3cd; color: #856404;">${data.oldStatus}</span></p>
                  <p><strong>New Status:</strong> <span class="status-badge" style="${refundStatusColors[data.newStatus] || 'background-color: #f8f9fa; color: #495057;'}">${data.newStatus}</span></p>
                </div>
                
                ${data.adminNotes ? `
                <div class="highlight">
                  <h4>💬 Update from Refunds Team:</h4>
                  <p style="font-style: italic;">"${data.adminNotes}"</p>
                </div>
                ` : ''}
                
                ${data.newStatus === 'approved' ? `
                <div class="highlight">
                  <h4>✅ Refund Approved</h4>
                  <p>Great news! Your refund has been approved and will be processed within 5-7 business days.</p>
                  <p>The amount of <strong>₹${data.amount.toLocaleString()}</strong> will be credited to your original payment method.</p>
                </div>
                ` : ''}
                
                ${data.newStatus === 'rejected' ? `
                <div class="highlight">
                  <h4>❌ Refund Request Declined</h4>
                  <p>Unfortunately, your refund request cannot be processed at this time.</p>
                  <p>If you disagree with this decision or have additional information, please contact our support team.</p>
                </div>
                ` : ''}
                
                ${data.newStatus === 'processed' ? `
                <div class="highlight">
                  <h4>🎉 Refund Processed</h4>
                  <p>Your refund has been successfully processed!</p>
                  <p>Amount of <strong>₹${data.amount.toLocaleString()}</strong> has been credited to your original payment method.</p>
                  <p>Please allow 3-5 business days for the refund to appear in your account.</p>
                </div>
                ` : ''}
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/orders" class="button">View Order Details</a>
                </div>
                
                <p>Thank you for choosing our services. We appreciate your business!</p>
                
                <p>Best regards,<br>
                <strong>Refunds Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

    default:
      return {
        subject: 'Notification from Support Team',
        html: '<p>You have a new notification from our support team.</p>'
      };
  }
};

// SMS templates
const getSMSMessage = (type: string, data: any): string => {
  switch (type) {
    case 'ticket_created':
      return `🎫 Support Ticket Created - #${data.ticketId}
Hi ${data.customerName}, we've received your support request "${data.subject}". Our team will respond within 24 hours. Track progress at ${process.env.NEXT_PUBLIC_APP_URL}/customer/help`;

    case 'ticket_status_update':
      return `📋 Ticket Update - #${data.ticketId}
Hi ${data.customerName}, your support ticket is now "${data.newStatus.toUpperCase()}". ${data.adminNotes ? 'Update: ' + data.adminNotes : ''} Check details at ${process.env.NEXT_PUBLIC_APP_URL}/customer/help`;

    case 'refund_request':
      return `💰 Refund Request Received - #${data.refundId}
Hi ${data.customerName}, your refund request for Order #${data.orderId} (₹${data.amount}) is under review. We'll update you within 2-3 business days. Track status online.`;

    case 'refund_status_update':
      let message = `💰 Refund Update - #${data.refundId}
Hi ${data.customerName}, your refund for Order #${data.orderId} is now "${data.newStatus.toUpperCase()}".`;
      
      if (data.newStatus === 'approved') {
        message += ` ✅ Approved! ₹${data.amount} will be refunded in 5-7 days.`;
      } else if (data.newStatus === 'processed') {
        message += ` 🎉 Processed! ₹${data.amount} has been refunded to your account.`;
      } else if (data.newStatus === 'rejected') {
        message += ` ❌ Contact support if you have questions.`;
      }
      
      return message;

    default:
      return `You have a new notification from our support team. Please check your account for details.`;
  }
};

export async function sendNotification(notificationData: NotificationData) {
  const results = {
    email: { success: false, error: null as any },
    sms: { success: false, error: null as any }
  };

  // Send Email Notification
  if (notificationData.customerEmail) {
    try {
      const transporter = nodemailer.createTransport(emailConfig);
      const { subject, html } = getEmailTemplate(notificationData.type, notificationData.data);

      const mailOptions = {
        from: `"Support Team" <${emailConfig.auth.user}>`,
        to: notificationData.customerEmail,
        subject: subject,
        html: html
      };

      await transporter.sendMail(mailOptions);
      results.email.success = true;
      console.log(`Email notification sent to ${notificationData.customerEmail}`);
    } catch (error) {
      results.email.error = error;
      console.error('Failed to send email notification:', error);
    }
  }

  // Send SMS Notification
  if (notificationData.customerPhone) {
    try {
      // Import Twilio dynamically to avoid build issues
      const { default: twilio } = require('twilio');
      const client = twilio(smsConfig.accountSid, smsConfig.authToken);
      
      const message = getSMSMessage(notificationData.type, notificationData.data);

      // Format phone number
      let phoneNumber = notificationData.customerPhone;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+91${phoneNumber.replace(/^\+91/, '')}`; // Add India country code if missing
      }

      await client.messages.create({
        body: message,
        from: smsConfig.phoneNumber,
        to: phoneNumber
      });

      results.sms.success = true;
      console.log(`SMS notification sent to ${phoneNumber}`);
    } catch (error) {
      results.sms.error = error;
      console.error('Failed to send SMS notification:', error);
    }
  }

  return results;
}

// Helper function to send support ticket notification
export async function sendSupportTicketNotification(ticketData: any) {
  return sendNotification({
    type: 'ticket_created',
    customerName: ticketData.customerName || 'Customer',
    customerEmail: ticketData.customerEmail,
    customerPhone: ticketData.customerPhone,
    data: {
      ticketId: ticketData.id,
      subject: ticketData.subject,
      category: ticketData.category,
      priority: ticketData.priority,
      description: ticketData.description,
      customerName: ticketData.customerName || 'Customer'
    }
  });
}

// Helper function to send refund request notification  
export async function sendRefundRequestNotification(refundData: any) {
  return sendNotification({
    type: 'refund_request',
    customerName: refundData.customerName,
    customerEmail: refundData.customerEmail,
    customerPhone: refundData.customerPhone,
    data: {
      refundId: refundData.id,
      orderId: refundData.orderId,
      amount: refundData.amount,
      reason: refundData.reason,
      description: refundData.description,
      priority: refundData.priority,
      customerName: refundData.customerName
    }
  });
}