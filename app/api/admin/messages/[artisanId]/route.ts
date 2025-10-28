import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { verifyAccessToken } from '@/lib/utils/jwt';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { artisanId: string } }
) {
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

    const artisanId = params.artisanId;
    
    // Get all messages for this artisan
    const messages = await sql`
      SELECT 
        id,
        message as content,
        sender_type,
        created_at,
        is_read as read_status
      FROM admin_messages 
      WHERE (sender_id = ${artisanId} AND sender_type = 'artisan')
         OR (recipient_id = ${artisanId} AND recipient_type = 'artisan')
      ORDER BY created_at ASC
    `;

    // Mark artisan messages as read by admin
    await sql`
      UPDATE admin_messages 
      SET is_read = true 
      WHERE recipient_type = 'admin' AND sender_id = ${artisanId} AND sender_type = 'artisan'
    `;

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching artisan messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
