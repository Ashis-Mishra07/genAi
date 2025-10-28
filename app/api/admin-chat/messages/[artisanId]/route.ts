import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAccessToken } from "@/lib/utils/jwt";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get messages for specific artisan conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { artisanId: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const artisanId = params.artisanId;

    // Get all messages for this artisan conversation
    const messages = await sql`
      SELECT 
        id,
        sender_id,
        sender_type,
        message,
        created_at,
        is_read,
        attachment_url,
        attachment_name
      FROM admin_messages 
      WHERE (sender_id = ${artisanId} AND sender_type = 'artisan') 
         OR (recipient_id = ${artisanId} AND recipient_type = 'artisan')
      ORDER BY created_at ASC
    `;

    // Mark messages from this artisan as read by admin
    await sql`
      UPDATE admin_messages 
      SET is_read = true 
      WHERE sender_id = ${artisanId} 
        AND sender_type = 'artisan' 
        AND is_read = false
    `;

    const formattedMessages = messages.map((msg: any) => ({
      id: msg.id,
      isFromAdmin: msg.sender_type === 'admin',
      message: msg.message,
      timestamp: msg.created_at,
      status: msg.is_read ? 'read' : 'delivered',
      attachments: msg.attachment_url ? [{
        name: msg.attachment_name || 'Attachment',
        url: msg.attachment_url,
        type: 'file'
      }] : undefined
    }));

    return NextResponse.json({ 
      messages: formattedMessages,
      success: true 
    });

  } catch (error) {
    console.error("Error fetching artisan messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
