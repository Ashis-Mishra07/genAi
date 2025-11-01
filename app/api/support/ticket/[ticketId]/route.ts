import { NextRequest, NextResponse } from 'next/server';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  created_at: string;  // Match the expected field name
  updated_at: string;  // Match the expected field name
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  userId?: string;
}

// In-memory storage for demo purposes - should match the main route
// In a real application, this would be fetched from a database
const getTicketById = (ticketId: string): SupportTicket | null => {
  // This would be a database query in a real application
  const mockTickets: SupportTicket[] = [
    {
      id: 'T001',
      subject: 'Order delivery issue',
      category: 'orders',
      status: 'in-progress',
      priority: 'high',
      description: 'My order was supposed to arrive yesterday but hasn\'t been delivered yet. I have tried tracking it but the status hasn\'t updated since yesterday morning. This is quite urgent as I need the items for an event.',
      created_at: '2024-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T14:20:00.000Z',
      customer_name: 'John Smith',
      customer_email: 'john.smith@email.com',
      customer_phone: '+91 9876543210',
      userId: 'user123'
    },
    {
      id: 'T002',
      subject: 'Product quality concern',
      category: 'general',
      status: 'resolved',
      priority: 'medium',
      description: 'The product I received doesn\'t match the description on the website. The color is different and the material feels cheaper than expected.',
      created_at: '2024-01-10T09:15:00.000Z',
      updated_at: '2024-01-12T16:45:00.000Z',
      customer_name: 'Sarah Johnson',
      customer_email: 'sarah.j@email.com',
      customer_phone: '+91 8765432109',
      userId: 'user123'
    },
    {
      id: 'T003',
      subject: 'Payment issue - double charged',
      category: 'payments',
      status: 'open',
      priority: 'high',
      description: 'I was charged twice for the same order. The payment went through twice on my credit card but I only received one confirmation email.',
      created_at: '2024-01-18T16:22:00.000Z',
      updated_at: '2024-01-18T16:22:00.000Z',
      customer_name: 'Mike Davis',
      customer_email: 'mike.davis@email.com',
      customer_phone: '+91 7654321098',
      userId: 'user123'
    }
  ];

  return mockTickets.find(ticket => ticket.id === ticketId) || null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params;

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // In a real application, you would also verify that the user has permission to view this ticket
    // const userId = getUserIdFromAuth(request); // Get from authentication
    
    const ticket = getTicketById(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // In a real app, verify user ownership
    // if (ticket.userId !== userId) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 403 }
    //   );
    // }

    return NextResponse.json({
      success: true,
      ticket: ticket
    });

  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ticket details' },
      { status: 500 }
    );
  }
}