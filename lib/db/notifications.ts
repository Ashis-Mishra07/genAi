import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface Notification {
  id: string;
  userId: string;
  type: 'order_placed' | 'order_updated' | 'product_sold' | 'general';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export async function createNotification(notificationData: {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: any;
}): Promise<Notification | null> {
  try {
    const [notification] = await sql`
      INSERT INTO notifications (
        user_id, type, title, message, data, is_read, created_at
      ) VALUES (
        ${notificationData.userId}, ${notificationData.type}, 
        ${notificationData.title}, ${notificationData.message}, 
        ${JSON.stringify(notificationData.data || {})}, false, NOW()
      ) 
      RETURNING id, user_id, type, title, message, data, is_read, created_at
    `;

    if (!notification) {
      throw new Error('Failed to create notification');
    }

    return {
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function getNotificationsByUserId(userId: string): Promise<Notification[]> {
  try {
    const notifications = await sql`
      SELECT id, user_id, type, title, message, data, is_read, created_at
      FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return notifications.map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = ${notificationId}
    `;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const [result] = await sql`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `;
    return result.count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}
