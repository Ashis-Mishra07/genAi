import { NextRequest, NextResponse } from 'next/server';
import { testRedisConnection, cache, setCache, getCache, deleteCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'test';

    switch (action) {
      case 'test':
        const isConnected = await testRedisConnection();
        return NextResponse.json({
          success: isConnected,
          message: isConnected ? 'Redis connection successful!' : 'Redis connection failed',
          timestamp: new Date().toISOString()
        });

      case 'stats':
        try {
          // Get all keys and their info
          const allKeys = await cache.getKeys('*');
          const keysByPattern = {
            orders: allKeys.filter(k => k.startsWith('orders:')).length,
            products: allKeys.filter(k => k.startsWith('products:')).length,
            chat: allKeys.filter(k => k.startsWith('chat:')).length,
            user_status: allKeys.filter(k => k.startsWith('user_status:')).length,
            other: allKeys.filter(k => !k.match(/^(orders|products|chat|user_status):/)).length
          };

          return NextResponse.json({
            success: true,
            totalKeys: allKeys.length,
            keysByPattern,
            allKeys: allKeys.slice(0, 20) // Show first 20 keys only
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Failed to get stats',
            details: error
          });
        }

      case 'clear':
        try {
          await cache.flushAll();
          return NextResponse.json({
            success: true,
            message: 'All Redis keys cleared'
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: 'Failed to clear cache',
            details: error
          });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use ?action=test, ?action=stats, or ?action=clear'
        });
    }
  } catch (error: any) {
    console.error('Redis test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Redis test failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, expiration } = body;

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Key and value are required'
      }, { status: 400 });
    }

    await setCache(key, value, expiration || 3600);
    
    return NextResponse.json({
      success: true,
      message: `Set key "${key}" with value`,
      key,
      value,
      expiration: expiration || 3600
    });
  } catch (error: any) {
    console.error('Redis set error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to set value',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'Key parameter is required'
      }, { status: 400 });
    }

    const deleted = await deleteCache(key);
    
    return NextResponse.json({
      success: true,
      message: deleted ? `Deleted key "${key}"` : `Key "${key}" not found`,
      deleted
    });
  } catch (error: any) {
    console.error('Redis delete error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete key',
      details: error.message
    }, { status: 500 });
  }
}
