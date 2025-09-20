import { NextRequest, NextResponse } from 'next/server';

interface PaymentReminderServiceRequest {
  action: 'send' | 'schedule' | 'cancel' | 'status';
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  orderId: string;
  orderAmount: number;
  dueDate: string;
  reminderType: 'gentle' | 'urgent' | 'final';
  sendMethods: ('email' | 'sms')[];
  paymentUrl?: string;
  scheduleDate?: string; // ISO date string for scheduling
  reminderId?: string; // For cancel/status operations
}

interface ScheduledReminder {
  id: string;
  customerId: string;
  orderId: string;
  reminderType: 'gentle' | 'urgent' | 'final';
  scheduledDate: string;
  sendMethods: ('email' | 'sms')[];
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  customerDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  orderDetails: {
    amount: number;
    dueDate: string;
    paymentUrl?: string;
  };
  createdAt: string;
  executedAt?: string;
  error?: string;
}

// In-memory storage for demo - in production, use a database
let scheduledReminders: ScheduledReminder[] = [];
let reminderHistory: ScheduledReminder[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: PaymentReminderServiceRequest = await request.json();
    
    switch (body.action) {
      case 'send':
        return await sendImmediateReminder(body);
      case 'schedule':
        return await scheduleReminder(body);
      case 'cancel':
        return await cancelReminder(body);
      case 'status':
        return await getReminderStatus(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment reminder service error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment reminder service failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function sendImmediateReminder(body: PaymentReminderServiceRequest) {
  const results: { method: string; success: boolean; details?: any; error?: string }[] = [];
  
  // Calculate days past due
  const daysPastDue = Math.max(0, Math.floor((new Date().getTime() - new Date(body.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
  
  // Send email if requested
  if (body.sendMethods.includes('email')) {
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/payment-reminders/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: body.customerEmail,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          orderId: body.orderId,
          orderAmount: body.orderAmount,
          dueDate: body.dueDate,
          daysPastDue,
          reminderType: body.reminderType,
          paymentUrl: body.paymentUrl
        })
      });
      
      const emailResult = await emailResponse.json();
      results.push({
        method: 'email',
        success: emailResult.success,
        details: emailResult.success ? { messageId: emailResult.messageId } : undefined,
        error: emailResult.success ? undefined : emailResult.error
      });
    } catch (emailError) {
      results.push({
        method: 'email',
        success: false,
        error: emailError instanceof Error ? emailError.message : 'Email sending failed'
      });
    }
  }
  
  // Send SMS if requested and phone number provided
  if (body.sendMethods.includes('sms') && body.customerPhone) {
    try {
      const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3001'}/api/payment-reminders/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: body.customerPhone,
          customerName: body.customerName,
          orderId: body.orderId,
          orderAmount: body.orderAmount,
          dueDate: body.dueDate,
          daysPastDue,
          reminderType: body.reminderType,
          paymentUrl: body.paymentUrl
        })
      });
      
      const smsResult = await smsResponse.json();
      results.push({
        method: 'sms',
        success: smsResult.success,
        details: smsResult.success ? { messageSid: smsResult.messageSid } : undefined,
        error: smsResult.success ? undefined : smsResult.error
      });
    } catch (smsError) {
      results.push({
        method: 'sms',
        success: false,
        error: smsError instanceof Error ? smsError.message : 'SMS sending failed'
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalAttempts = results.length;
  
  return NextResponse.json({
    success: successCount > 0,
    message: `Payment reminder sent via ${successCount}/${totalAttempts} methods`,
    results,
    reminderType: body.reminderType,
    orderId: body.orderId,
    timestamp: new Date().toISOString()
  });
}

async function scheduleReminder(body: PaymentReminderServiceRequest) {
  if (!body.scheduleDate) {
    return NextResponse.json(
      { success: false, error: 'Schedule date is required' },
      { status: 400 }
    );
  }
  
  const scheduledDate = new Date(body.scheduleDate);
  const now = new Date();
  
  if (scheduledDate <= now) {
    return NextResponse.json(
      { success: false, error: 'Schedule date must be in the future' },
      { status: 400 }
    );
  }
  
  const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const scheduledReminder: ScheduledReminder = {
    id: reminderId,
    customerId: `customer_${body.customerEmail}`,
    orderId: body.orderId,
    reminderType: body.reminderType,
    scheduledDate: scheduledDate.toISOString(),
    sendMethods: body.sendMethods,
    status: 'pending',
    customerDetails: {
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone
    },
    orderDetails: {
      amount: body.orderAmount,
      dueDate: body.dueDate,
      paymentUrl: body.paymentUrl
    },
    createdAt: now.toISOString()
  };
  
  scheduledReminders.push(scheduledReminder);
  
  // Set timeout to execute the reminder (in production, use a proper job queue like Bull or Agenda)
  const delayMs = scheduledDate.getTime() - now.getTime();
  setTimeout(() => {
    executeScheduledReminder(reminderId);
  }, delayMs);
  
  return NextResponse.json({
    success: true,
    message: 'Payment reminder scheduled successfully',
    reminderId,
    scheduledDate: scheduledDate.toISOString(),
    delayMinutes: Math.round(delayMs / (1000 * 60))
  });
}

async function executeScheduledReminder(reminderId: string) {
  const reminder = scheduledReminders.find(r => r.id === reminderId);
  if (!reminder || reminder.status !== 'pending') {
    console.log(`Reminder ${reminderId} not found or already executed`);
    return;
  }
  
  console.log(`Executing scheduled reminder: ${reminderId}`);
  
  try {
    // Calculate current days past due
    const daysPastDue = Math.max(0, Math.floor((new Date().getTime() - new Date(reminder.orderDetails.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
    
    const sendRequest: PaymentReminderServiceRequest = {
      action: 'send',
      customerEmail: reminder.customerDetails.email,
      customerName: reminder.customerDetails.name,
      customerPhone: reminder.customerDetails.phone,
      orderId: reminder.orderId,
      orderAmount: reminder.orderDetails.amount,
      dueDate: reminder.orderDetails.dueDate,
      reminderType: reminder.reminderType,
      sendMethods: reminder.sendMethods,
      paymentUrl: reminder.orderDetails.paymentUrl
    };
    
    const result = await sendImmediateReminder(sendRequest);
    const resultData = await result.json();
    
    // Update reminder status
    reminder.status = resultData.success ? 'sent' : 'failed';
    reminder.executedAt = new Date().toISOString();
    if (!resultData.success) {
      reminder.error = resultData.error || 'Unknown error';
    }
    
    // Move to history
    reminderHistory.push({ ...reminder });
    scheduledReminders = scheduledReminders.filter(r => r.id !== reminderId);
    
    console.log(`Scheduled reminder ${reminderId} executed with status: ${reminder.status}`);
    
  } catch (error) {
    console.error(`Failed to execute scheduled reminder ${reminderId}:`, error);
    
    reminder.status = 'failed';
    reminder.executedAt = new Date().toISOString();
    reminder.error = error instanceof Error ? error.message : 'Execution failed';
    
    reminderHistory.push({ ...reminder });
    scheduledReminders = scheduledReminders.filter(r => r.id !== reminderId);
  }
}

async function cancelReminder(body: PaymentReminderServiceRequest) {
  if (!body.reminderId) {
    return NextResponse.json(
      { success: false, error: 'Reminder ID is required' },
      { status: 400 }
    );
  }
  
  const reminderIndex = scheduledReminders.findIndex(r => r.id === body.reminderId);
  if (reminderIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Reminder not found or already executed' },
      { status: 404 }
    );
  }
  
  const reminder = scheduledReminders[reminderIndex];
  reminder.status = 'cancelled';
  reminder.executedAt = new Date().toISOString();
  
  // Move to history
  reminderHistory.push({ ...reminder });
  scheduledReminders.splice(reminderIndex, 1);
  
  return NextResponse.json({
    success: true,
    message: 'Payment reminder cancelled successfully',
    reminderId: body.reminderId,
    cancelledAt: new Date().toISOString()
  });
}

async function getReminderStatus(body: PaymentReminderServiceRequest) {
  if (!body.reminderId) {
    return NextResponse.json(
      { success: false, error: 'Reminder ID is required' },
      { status: 400 }
    );
  }
  
  // Check scheduled reminders first
  const scheduledReminder = scheduledReminders.find(r => r.id === body.reminderId);
  if (scheduledReminder) {
    return NextResponse.json({
      success: true,
      reminder: scheduledReminder,
      status: 'scheduled'
    });
  }
  
  // Check history
  const historicalReminder = reminderHistory.find(r => r.id === body.reminderId);
  if (historicalReminder) {
    return NextResponse.json({
      success: true,
      reminder: historicalReminder,
      status: 'completed'
    });
  }
  
  return NextResponse.json(
    { success: false, error: 'Reminder not found' },
    { status: 404 }
  );
}

// GET endpoint to retrieve all reminders and statistics
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const orderId = searchParams.get('orderId');
  const customerId = searchParams.get('customerId');
  
  try {
    switch (action) {
      case 'list':
        return NextResponse.json({
          success: true,
          scheduledReminders: scheduledReminders.length,
          completedReminders: reminderHistory.length,
          scheduled: scheduledReminders,
          recent: reminderHistory.slice(-10) // Last 10 completed
        });
        
      case 'stats':
        const stats = {
          scheduled: scheduledReminders.length,
          completed: reminderHistory.length,
          sent: reminderHistory.filter(r => r.status === 'sent').length,
          failed: reminderHistory.filter(r => r.status === 'failed').length,
          cancelled: reminderHistory.filter(r => r.status === 'cancelled').length,
          byType: {
            gentle: [...scheduledReminders, ...reminderHistory].filter(r => r.reminderType === 'gentle').length,
            urgent: [...scheduledReminders, ...reminderHistory].filter(r => r.reminderType === 'urgent').length,
            final: [...scheduledReminders, ...reminderHistory].filter(r => r.reminderType === 'final').length
          }
        };
        
        return NextResponse.json({
          success: true,
          stats
        });
        
      case 'order':
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: 'Order ID required' },
            { status: 400 }
          );
        }
        
        const orderReminders = [
          ...scheduledReminders.filter(r => r.orderId === orderId),
          ...reminderHistory.filter(r => r.orderId === orderId)
        ];
        
        return NextResponse.json({
          success: true,
          orderId,
          reminders: orderReminders
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Payment reminder service GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve reminder data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}