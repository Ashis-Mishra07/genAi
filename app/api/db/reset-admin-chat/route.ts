import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("Resetting admin chat tables...");

    // Clear existing admin messages
    await sql`DELETE FROM admin_messages`;

    // Insert sample admin messages and artisan messages to create conversations
    await sql`
      INSERT INTO admin_messages (sender_id, sender_type, recipient_id, recipient_type, message, created_at, is_read) VALUES
      ('admin-support', 'admin', '1', 'artisan', 'Hello! Welcome to ArtisanCraft! I''m Sarah from the support team, and I''m here to help you succeed on our platform. How can I assist you today?', NOW() - INTERVAL '2 hours', true),
      ('1', 'artisan', 'admin-support', 'admin', 'Hi Sarah! Thank you for reaching out. I''m really excited to be part of this platform. I could use some help with getting more visibility for my handmade pottery.', NOW() - INTERVAL '1 hour 50 minutes', false),
      ('admin-support', 'admin', '1', 'artisan', 'I see you''re working on building your artisan business. Would you like some tips on optimizing your product listings for better visibility and sales?', NOW() - INTERVAL '1 hour 45 minutes', true),
      ('1', 'artisan', 'admin-support', 'admin', 'Yes, that would be amazing! I''ve uploaded a few pottery pieces but I''m not getting much traffic. What can I improve?', NOW() - INTERVAL '1 hour 40 minutes', false),
      ('admin-support', 'admin', '1', 'artisan', 'Great questions! Here are some quick tips: 1) Use high-quality, well-lit photos 2) Write detailed descriptions with keywords 3) Set competitive pricing 4) Engage with the community. Would you like me to elaborate on any of these?', NOW() - INTERVAL '1 hour 35 minutes', false),
      ('1', 'artisan', 'admin-support', 'admin', 'This is so helpful! Could you tell me more about the photography tips? I''m struggling with getting good lighting for my pottery photos.', NOW() - INTERVAL '1 hour 20 minutes', false)
    `;

    console.log("Admin chat tables reset successfully");

    return NextResponse.json({ 
      message: "Admin chat tables reset successfully",
      success: true 
    });

  } catch (error) {
    console.error("Error resetting admin chat tables:", error);
    return NextResponse.json(
      { error: "Failed to reset admin chat tables" },
      { status: 500 }
    );
  }
}
