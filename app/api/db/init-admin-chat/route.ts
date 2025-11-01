import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("Initializing admin chat tables...");

    // Create admin messages table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_messages (
        id SERIAL PRIMARY KEY,
        sender_id VARCHAR(255) NOT NULL,
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('admin', 'artisan')),
        recipient_id VARCHAR(255) NOT NULL,
        recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin', 'artisan')),
        message TEXT NOT NULL,
        attachment_url TEXT,
        attachment_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        is_read BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON admin_messages(sender_id, sender_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_recipient ON admin_messages(recipient_id, recipient_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_messages_is_read ON admin_messages(is_read)`;

    // Check if we already have sample data
    const existingMessages = await sql`SELECT COUNT(*) as count FROM admin_messages WHERE sender_type = 'admin'`;
    
    if (existingMessages[0].count === '0') {
      // Insert sample admin messages and artisan messages to create conversations
      await sql`
        INSERT INTO admin_messages (sender_id, sender_type, recipient_id, recipient_type, message, created_at, is_read) VALUES
        ('admin-support', 'admin', '1', 'artisan', 'Hello! Welcome to ArtisanCraft! I''m Sarah from the support team, and I''m here to help you succeed on our platform. How can I assist you today?', NOW() - INTERVAL '2 hours', true),
        ('1', 'artisan', 'admin-support', 'admin', 'Hi Sarah! Thank you for reaching out. I''m really excited to be part of this platform. I could use some help with getting more visibility for my handmade pottery.', NOW() - INTERVAL '1 hour 50 minutes', false),
        ('admin-support', 'admin', '1', 'artisan', 'I see you''re working on building your artisan business. Would you like some tips on optimizing your product listings for better visibility and sales?', NOW() - INTERVAL '1 hour 45 minutes', true),
        ('1', 'artisan', 'admin-support', 'admin', 'Yes, that would be amazing! I''ve uploaded a few pottery pieces but I''m not getting much traffic. What can I improve?', NOW() - INTERVAL '1 hour 40 minutes', false),
        ('admin-support', 'admin', '1', 'artisan', 'Also, feel free to ask me about our marketing tools, photography tips, or any platform-related questions. I''m here to help you grow your business! 🚀', NOW() - INTERVAL '1 hour 30 minutes', false)
      `;
    }

    console.log("Admin chat tables initialized successfully");

    return NextResponse.json({ 
      message: "Admin chat tables initialized successfully",
      success: true 
    });

  } catch (error) {
    console.error("Error initializing admin chat tables:", error);
    return NextResponse.json(
      { error: "Failed to initialize admin chat tables" },
      { status: 500 }
    );
  }
}
