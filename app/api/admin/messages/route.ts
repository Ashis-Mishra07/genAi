import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyAccessToken } from '@/lib/utils/jwt';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all artisan conversations with latest message info
    const conversations = await sql`
      SELECT 
        am.sender_id as artisan_id,
        u.name as artisan_name,
        u.email as artisan_email,
        am.message as last_message,
        am.created_at as last_message_time,
        am.sender_type as last_sender,
        (
          SELECT COUNT(*) 
          FROM admin_messages 
          WHERE sender_id = am.sender_id 
            AND sender_type = 'artisan' 
            AND is_read = false
        ) as unread_count
      FROM admin_messages am
      JOIN users u ON u.id::text = am.sender_id
      WHERE am.sender_type = 'artisan'
        AND am.id IN (
          SELECT MAX(id) 
          FROM admin_messages 
          WHERE sender_type = 'artisan'
          GROUP BY sender_id
        )
      ORDER BY am.created_at DESC
    `;

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { artisan_id, content } = await request.json();

    if (!artisan_id || !content) {
      return NextResponse.json({ error: 'Artisan ID and content are required' }, { status: 400 });
    }

    // Send message from admin to artisan
    const result = await sql`
      INSERT INTO admin_messages (sender_id, sender_type, recipient_id, recipient_type, message, created_at, is_read)
      VALUES ('admin-support', 'admin', ${artisan_id}, 'artisan', ${content}, NOW(), false)
      RETURNING *
    `;

    return NextResponse.json({ message: result[0] });
  } catch (error) {
    console.error('Error sending admin message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
