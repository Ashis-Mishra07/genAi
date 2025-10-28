import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAccessToken } from "@/lib/utils/jwt";

const sql = neon(process.env.DATABASE_URL!);

// GET - Fetch messages for current user (artisan) or all conversations (admin)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    console.log('GET /api/admin-chat - Raw authorization header:', request.headers.get("authorization"));
    console.log('GET /api/admin-chat - Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      console.log('GET /api/admin-chat - No token provided');
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Check if token looks like a valid JWT (has 3 parts separated by dots)
    const tokenParts = token.split('.');
    console.log('GET /api/admin-chat - Token parts count:', tokenParts.length);
    
    if (tokenParts.length !== 3) {
      console.log('GET /api/admin-chat - Malformed token: incorrect parts count');
      return NextResponse.json({ error: "Malformed token" }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      console.log('GET /api/admin-chat - Invalid token');
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log('GET /api/admin-chat - User authenticated:', { userId: decoded.userId, role: decoded.role });

    const { searchParams } = new URL(request.url);
    const artisanId = searchParams.get('artisanId');

    // If admin and requesting specific artisan messages
    if (decoded.role === 'ADMIN' && artisanId) {
      console.log('GET /api/admin-chat - Admin requesting messages for artisan:', artisanId);
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

      // Mark artisan messages as read by admin
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
    }

    // If admin, return conversation list
    if (decoded.role === 'ADMIN') {
      console.log('GET /api/admin-chat - Admin requesting conversation list');
      
      const conversations = await sql`
        SELECT DISTINCT 
          am.sender_id as artisan_id,
          COALESCE(u.name, 'Unknown Artisan') as artisan_name,
          COALESCE(u.email, 'unknown@example.com') as artisan_email,
          (
            SELECT message 
            FROM admin_messages 
            WHERE (sender_id = am.sender_id AND sender_type = 'artisan') 
               OR (recipient_id = am.sender_id AND recipient_type = 'artisan')
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT created_at 
            FROM admin_messages 
            WHERE (sender_id = am.sender_id AND sender_type = 'artisan') 
               OR (recipient_id = am.sender_id AND recipient_type = 'artisan')
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_message_time,
          (
            SELECT sender_type 
            FROM admin_messages 
            WHERE (sender_id = am.sender_id AND sender_type = 'artisan') 
               OR (recipient_id = am.sender_id AND recipient_type = 'artisan')
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_sender,
          (
            SELECT COUNT(*) 
            FROM admin_messages 
            WHERE sender_id = am.sender_id 
              AND sender_type = 'artisan' 
              AND is_read = false
          ) as unread_count
        FROM admin_messages am
        LEFT JOIN users u ON u.id::text = am.sender_id
        WHERE am.sender_type = 'artisan'
        ORDER BY last_message_time DESC NULLS LAST
      `;

      console.log('GET /api/admin-chat - Found conversations:', conversations.length, conversations);

      return NextResponse.json({ 
        conversations,
        success: true,
        isAdmin: true
      });
    }

    // If artisan, return their messages (existing logic)
    const userId = decoded.userId;

    // Get messages for this user
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
      WHERE (sender_id = ${userId} AND sender_type = 'artisan') 
         OR (recipient_id = ${userId} AND recipient_type = 'artisan')
      ORDER BY created_at ASC
    `;

    // Mark messages as read that were sent by admin to this artisan
    await sql`
      UPDATE admin_messages 
      SET is_read = true 
      WHERE recipient_id = ${userId} 
        AND recipient_type = 'artisan' 
        AND sender_type = 'admin'
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
    console.error("Error fetching admin messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a new message (from artisan to admin or admin to artisan)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const requestBody = await request.json();
    console.log('POST /api/admin-chat - Request body:', requestBody);
    console.log('POST /api/admin-chat - User role:', decoded.role);

    const { message, attachmentUrl, attachmentName, recipient_id } = requestBody;

    if (!message || message.trim() === "") {
      console.log('POST /api/admin-chat - Empty message error');
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Admin sending to artisan
    if (decoded.role === 'ADMIN') {
      console.log('POST /api/admin-chat - Admin sending message, recipient_id:', recipient_id);
      
      if (!recipient_id) {
        console.log('POST /api/admin-chat - Missing recipient_id for admin');
        return NextResponse.json({ error: "Recipient ID required for admin messages" }, { status: 400 });
      }

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

      console.log('POST /api/admin-chat - Admin message inserted:', result[0]);

      return NextResponse.json({ 
        message: {
          id: result[0].id,
          isFromAdmin: true,
          message,
          timestamp: result[0].created_at,
          status: 'sent'
        },
        success: true 
      });
    }

    // Artisan sending to admin (existing logic)
    const userId = decoded.userId;

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
        ${userId},
        'artisan',
        1,
        'admin',
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
      isFromAdmin: false,
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
