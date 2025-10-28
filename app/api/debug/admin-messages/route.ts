import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Check the table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'admin_messages' 
      ORDER BY ordinal_position
    `;

    // Get sample data
    const sampleData = await sql`
      SELECT * FROM admin_messages 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    return NextResponse.json({
      tableStructure: tableInfo,
      sampleData: sampleData,
      success: true
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
