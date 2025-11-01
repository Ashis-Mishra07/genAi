import { sendSupportTicketNotification } from '@/lib/notification-service';
import { NextRequest, NextResponse } from 'next/server';

interface SupportTicketRequest {
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// In-memory storage for demo purposes
// In a real application, this would be stored in a database
let tickets: SupportTicket[] = [
  {
    id: 'T001',
    subject: 'Order delivery issue',
    category: 'orders',
    status: 'in-progress',
    priority: 'high',
    description: 'My order was supposed to arrive yesterday but hasn\'t been delivered yet.',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T14:20:00.000Z',
    userId: 'user123'
  },
  {
    id: 'T002',
    subject: 'Product quality concern',
    category: 'general',
    status: 'resolved',
    priority: 'medium',
    description: 'The product I received doesn\'t match the description on the website.',
    createdAt: '2024-01-10T09:15:00.000Z',
    updatedAt: '2024-01-12T16:45:00.000Z',
    userId: 'user123'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body: SupportTicketRequest = await request.json();
    
    // Validate required fields
    if (!body.subject || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    // Generate ticket ID
    const ticketId = `T${String(Date.now()).slice(-6).padStart(3, '0')}`;
    
    // Create new ticket
    const newTicket: SupportTicket = {
      id: ticketId,
      subject: body.subject,
      category: body.category || 'general',
      status: 'open',
      priority: body.priority || 'medium',
      description: body.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user123' // In real app, get from authentication
    };

    // Add to storage (in real app, save to database)
    tickets.push(newTicket);

    // Send automatic notifications if customer contact info provided
    if (body.customerEmail || body.customerPhone) {
      try {
        await sendSupportTicketNotification({
          ...newTicket,
          customerName: body.customerName || 'Customer',
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone
        });
        console.log('Support ticket notifications sent successfully');
      } catch (notificationError) {
        console.error('Failed to send support ticket notifications:', notificationError);
        // Don't fail the request if notifications fail
      }
    }

    console.log('Support ticket created:', newTicket);

    return NextResponse.json({
      success: true,
      message: body.customerEmail || body.customerPhone ? 
        'Support ticket created successfully. You will receive a confirmation notification shortly.' :
        'Support ticket created successfully.',
      ticketId: ticketId,
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user123'; // In real app, get from authentication
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Filter tickets by user and status if provided
    let userTickets = tickets.filter(ticket => ticket.userId === userId);
    
    if (status) {
      userTickets = userTickets.filter(ticket => ticket.status === status);
    }

    // Sort by creation date (newest first)
    userTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit results
    const limitedTickets = userTickets.slice(0, limit);

    return NextResponse.json({
      success: true,
      tickets: limitedTickets,
      total: userTickets.length
    });

  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, status, adminNotes } = body;

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID and status are required' },
        { status: 400 }
      );
    }

    // Find and update the ticket
    const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
    
    if (ticketIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const oldStatus = tickets[ticketIndex].status;
    tickets[ticketIndex].status = status;
    tickets[ticketIndex].updatedAt = new Date().toISOString();
    
    if (adminNotes) {
      (tickets[ticketIndex] as any).adminNotes = adminNotes;
    }

    // Send status update notification if customer contact info is available
    const ticket = tickets[ticketIndex];
    if ((ticket as any).customerEmail || (ticket as any).customerPhone) {
      try {
        const { sendNotification } = await import('@/lib/notification-service');
        await sendNotification({
          type: 'ticket_status_update',
          customerName: (ticket as any).customerName || 'Customer',
          customerEmail: (ticket as any).customerEmail,
          customerPhone: (ticket as any).customerPhone,
          data: {
            ticketId,
            subject: ticket.subject,
            oldStatus,
            newStatus: status,
            adminNotes,
            customerName: (ticket as any).customerName || 'Customer'
          }
        });
        console.log('Ticket status update notifications sent successfully');
      } catch (notificationError) {
        console.error('Failed to send ticket status update notifications:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket: tickets[ticketIndex]
    });

  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}