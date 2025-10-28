import { sendNotification } from '@/lib/notification-service';
import { NextRequest, NextResponse } from 'next/server';

interface RefundRequest {
  orderId: string;
  reason: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface RefundRequestData extends RefundRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// In-memory storage for demo purposes
let refundRequests: RefundRequestData[] = [
  {
    id: 'RF001',
    orderId: 'ORD-2024-001',
    reason: 'damaged_product',
    amount: 2500,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+919876543210',
    description: 'Product arrived damaged during shipping',
    priority: 'high',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    userId: 'user123'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body: RefundRequest = await request.json();
    
    // Validate required fields
    if (!body.orderId || !body.reason || !body.amount || !body.customerName || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Order ID, reason, amount, customer name, and email are required' },
        { status: 400 }
      );
    }

    // Generate refund request ID
    const refundId = `RF${String(Date.now()).slice(-6).padStart(3, '0')}`;
    
    // Create new refund request
    const newRefundRequest: RefundRequestData = {
      id: refundId,
      orderId: body.orderId,
      reason: body.reason,
      amount: body.amount,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      description: body.description,
      priority: body.priority || 'medium',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user123' // In real app, get from authentication
    };

    // Add to storage (in real app, save to database)
    refundRequests.push(newRefundRequest);

    // Send automatic notifications
    try {
      await sendNotification({
        type: 'refund_request',
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        data: {
          refundId,
          orderId: body.orderId,
          amount: body.amount,
          reason: body.reason,
          description: body.description,
          priority: body.priority
        }
      });
      console.log('Refund request notifications sent successfully');
    } catch (notificationError) {
      console.error('Failed to send refund request notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    console.log('Refund request created:', newRefundRequest);

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted successfully. You will receive a confirmation email shortly.',
      refundId: refundId,
      request: newRefundRequest
    });

  } catch (error) {
    console.error('Error creating refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit refund request' },
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

    // Filter refund requests by user and status if provided
    let userRequests = refundRequests.filter(request => request.userId === userId);
    
    if (status) {
      userRequests = userRequests.filter(request => request.status === status);
    }

    // Sort by creation date (newest first)
    userRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limit results
    const limitedRequests = userRequests.slice(0, limit);

    return NextResponse.json({
      success: true,
      requests: limitedRequests,
      total: userRequests.length
    });

  } catch (error) {
    console.error('Error fetching refund requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch refund requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { refundId, status, adminNotes } = body;

    if (!refundId || !status) {
      return NextResponse.json(
        { success: false, error: 'Refund ID and status are required' },
        { status: 400 }
      );
    }

    // Find and update the refund request
    const requestIndex = refundRequests.findIndex(req => req.id === refundId);
    
    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Refund request not found' },
        { status: 404 }
      );
    }

    const oldStatus = refundRequests[requestIndex].status;
    refundRequests[requestIndex].status = status;
    refundRequests[requestIndex].updatedAt = new Date().toISOString();
    
    if (adminNotes) {
      (refundRequests[requestIndex] as any).adminNotes = adminNotes;
    }

    // Send status update notification
    try {
      await sendNotification({
        type: 'refund_status_update',
        customerName: refundRequests[requestIndex].customerName,
        customerEmail: refundRequests[requestIndex].customerEmail,
        customerPhone: refundRequests[requestIndex].customerPhone,
        data: {
          refundId,
          orderId: refundRequests[requestIndex].orderId,
          amount: refundRequests[requestIndex].amount,
          oldStatus,
          newStatus: status,
          adminNotes
        }
      });
      console.log('Refund status update notifications sent successfully');
    } catch (notificationError) {
      console.error('Failed to send refund status update notifications:', notificationError);
    }

    return NextResponse.json({
      success: true,
      message: 'Refund request status updated successfully',
      request: refundRequests[requestIndex]
    });

  } catch (error) {
    console.error('Error updating refund request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update refund request' },
      { status: 500 }
    );
  }
}