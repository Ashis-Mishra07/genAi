import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAccessToken } from "@/lib/utils/jwt";

const sql = neon(process.env.DATABASE_URL!);

// POST - Send message from admin to artisan
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { recipient_id, message, attachmentUrl, attachmentName } = await request.json();

    if (!recipient_id || !message || message.trim() === "") {
      return NextResponse.json({ error: "Recipient ID and message are required" }, { status: 400 });
    }

    // Insert the new message from admin to artisan
    const result = await sql`
      INSERT INTO admin_messages (
        sender_id,
        sender_type,
        recipient_id,
        recipient_type,
        message,
        attachment_url,
        attachment_name,
        created_at,
        is_read
      ) VALUES (
        'admin-support',
        'admin',
        ${recipient_id},
        'artisan',
        ${message},
        ${attachmentUrl || null},
        ${attachmentName || null},
        NOW(),
        false
      )
      RETURNING id, created_at
    `;

    const newMessage = {
      id: result[0].id,
      isFromAdmin: true,
      message,
      timestamp: result[0].created_at,
      status: 'sent',
      attachments: attachmentUrl ? [{
        name: attachmentName || 'Attachment',
        url: attachmentUrl,
        type: 'file'
      }] : undefined
    };

    return NextResponse.json({ 
      message: newMessage,
      success: true 
    });

  } catch (error) {
    console.error("Error sending admin message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
