import { NextRequest, NextResponse } from 'next/server';
import { updateUserStatus } from '@/lib/db/chat';
import { setCache, deleteCache } from '@/lib/redis';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status } = body;
    
    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['ONLINE', 'OFFLINE', 'AWAY'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ONLINE, OFFLINE, or AWAY' },
        { status: 400 }
      );
    }
    
    const updatedUser = await updateUserStatus(userId, status);
    
    // Cache the user status for quick lookup (5 minute cache)
    const userStatusCacheKey = `user_status:${userId}`;
    await setCache(userStatusCacheKey, {
      id: updatedUser.id,
      status: updatedUser.status,
      lastSeen: updatedUser.last_seen
    }, 300);
    
    // Also invalidate any chat-related caches for this user
    const chatCacheKeys = await import('@/lib/redis').then(m => m.cache.getKeys(`chat:*:${userId}:*`));
    for (const key of chatCacheKeys) {
      await deleteCache(key);
    }
    
    console.log(`Chat: Updated status for user ${userId} to ${status}`);
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        status: updatedUser.status,
        lastSeen: updatedUser.last_seen
      }
    });
    
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}