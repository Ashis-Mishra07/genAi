import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/utils/jwt';
import { 
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '../../../lib/db/notifications';

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

    if (countOnly) {
      const count = await getUnreadNotificationCount(user.id);
      return NextResponse.json({
        success: true,
        unreadCount: count
      });
    }

    const notifications = await getNotificationsByUserId(user.id);
    
    const filteredNotifications = unreadOnly 
      ? notifications.filter(n => !n.isRead)
      : notifications;

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications
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

    const { notificationId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      const success = await markAllNotificationsAsRead(user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      const success = await markNotificationAsRead(notificationId);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to mark notification as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { error: 'notificationId or markAllAsRead is required' },
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
