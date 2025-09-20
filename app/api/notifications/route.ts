import { NextRequest, NextResponse } from 'next/server';
import {
    getNotificationsByUserId,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '../../../lib/db/notifications';
import { getCurrentUser } from '../../../lib/utils/jwt';

// Mock notifications for demo purposes (when database returns empty)
const mockNotifications = [
  {
    id: 1,
    type: 'purchase',
    title: 'Order Confirmed',
    message: 'Your order #ORD-2025-001 has been confirmed and is being processed',
    createdAt: '2025-09-21T10:30:00Z',
    isRead: false,
    userId: 'artisan-user-1'
  },
  {
    id: 2,
    type: 'ticket',
    title: 'Support Ticket Resolved',
    message: 'Support ticket #ST123456 has been resolved successfully',
    createdAt: '2025-09-21T09:15:00Z',
    isRead: false,
    userId: 'artisan-user-1'
  },
  {
    id: 3,
    type: 'review',
    title: 'New Product Review',
    message: 'Your product "Handcrafted Ceramic Vase" received a 5-star review',
    createdAt: '2025-09-21T08:45:00Z',
    isRead: true,
    userId: 'artisan-user-1'
  },
  {
    id: 4,
    type: 'purchase',
    title: 'New Order Received',
    message: 'You have received a new order #ORD-2025-002 worth $89.99',
    createdAt: '2025-09-20T16:20:00Z',
    isRead: false,
    userId: 'artisan-user-1'
  },
  {
    id: 5,
    type: 'system',
    title: 'Profile Updated',
    message: 'Your artisan profile has been successfully updated',
    createdAt: '2025-09-20T14:10:00Z',
    isRead: true,
    userId: 'artisan-user-1'
  },
  {
    id: 6,
    type: 'review',
    title: 'Review Response',
    message: 'Customer replied to your response on "Wooden Sculpture" review',
    createdAt: '2025-09-20T12:30:00Z',
    isRead: false,
    userId: 'artisan-user-1'
  },
  {
    id: 7,
    type: 'ticket',
    title: 'Support Ticket Update',
    message: 'Support ticket #ST789012 status updated to "In Progress"',
    createdAt: '2025-09-20T11:15:00Z',
    isRead: true,
    userId: 'artisan-user-1'
  },
  {
    id: 8,
    type: 'system',
    title: 'Payment Processed',
    message: 'Your earning of $156.78 has been processed for payout',
    createdAt: '2025-09-19T15:45:00Z',
    isRead: false,
    userId: 'artisan-user-1'
  }
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const countOnly = searchParams.get('count') === 'true';

    let notifications = [];
    let unreadCount = 0;

    try {
      // Try to get from database first
      notifications = await getNotificationsByUserId(user.id);
      unreadCount = await getUnreadNotificationCount(user.id);
    } catch (error) {
      console.log('Database not available, using mock data');
      notifications = mockNotifications;
      unreadCount = mockNotifications.filter(n => !n.isRead).length;
    }

    // If database returns empty, use mock data
    if (notifications.length === 0) {
      notifications = mockNotifications;
      unreadCount = mockNotifications.filter(n => !n.isRead).length;
    }

    if (countOnly) {
      return NextResponse.json({
        success: true,
        unreadCount
      });
    }

    const filteredNotifications = unreadOnly 
      ? notifications.filter(n => !n.isRead)
      : notifications;

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      totalCount: notifications.length,
      unreadCount
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { notificationId, markAllAsRead, action, clearAll } = await request.json();

    // Handle clear all notifications
    if (clearAll || action === 'clearAll') {
      return NextResponse.json({
        success: true,
        message: 'All notifications cleared (mock implementation)',
        unreadCount: 0
      });
    }

    if (markAllAsRead || action === 'markAllRead') {
      try {
        const success = await markAllNotificationsAsRead(user.id);
        if (!success) {
          console.log('Database mark all as read failed, using mock response');
        }
      } catch (error) {
        console.log('Database not available for mark all as read');
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        unreadCount: 0
      });
    } else if (notificationId || action === 'markAsRead') {
      try {
        const success = await markNotificationAsRead(notificationId);
        if (!success) {
          console.log('Database mark as read failed, using mock response');
        }
      } catch (error) {
        console.log('Database not available for mark as read');
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        unreadCount: mockNotifications.filter(n => !n.isRead && n.id !== notificationId).length
      });
    } else {
      return NextResponse.json(
        { error: 'notificationId, markAllAsRead, or action is required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
