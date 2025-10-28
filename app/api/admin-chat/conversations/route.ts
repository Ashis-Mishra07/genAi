import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAccessToken } from "@/lib/utils/jwt";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get all conversations for admin
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all artisan conversations with latest message info
    const conversations = await sql`
      WITH latest_messages AS (
        SELECT 
          CASE 
            WHEN sender_type = 'artisan' THEN sender_id 
            ELSE recipient_id 
          END as artisan_id,
          message as last_message,
          created_at as last_message_time,
          sender_type as last_sender,
          ROW_NUMBER() OVER (
            PARTITION BY CASE 
              WHEN sender_type = 'artisan' THEN sender_id 
              ELSE recipient_id 
            END 
            ORDER BY created_at DESC
          ) as rn
        FROM admin_messages
        WHERE sender_type IN ('artisan', 'admin')
      ),
      unread_counts AS (
        SELECT 
          sender_id as artisan_id,
          COUNT(*) as unread_count
        FROM admin_messages 
        WHERE sender_type = 'artisan' AND is_read = false
        GROUP BY sender_id
      )
      SELECT 
        lm.artisan_id,
        u.name as artisan_name,
        u.email as artisan_email,
        lm.last_message,
        lm.last_message_time,
        lm.last_sender,
        COALESCE(uc.unread_count, 0) as unread_count
      FROM latest_messages lm
      JOIN users u ON u.id::text = lm.artisan_id
      LEFT JOIN unread_counts uc ON uc.artisan_id = lm.artisan_id
      WHERE lm.rn = 1
      ORDER BY lm.last_message_time DESC
    `;

    return NextResponse.json({ 
      conversations,
      success: true 
    });

  } catch (error) {
    console.error("Error fetching admin conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
