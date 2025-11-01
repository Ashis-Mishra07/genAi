import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get the actual column names and types for the products table
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    // Extract just column names
    const columnNames = result.map((row: any) => row.column_name);

    return NextResponse.json({
      success: true,
      table: 'products',
      columnNames,
      count: columnNames.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Database inspection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to inspect database',
      details: error.toString()
    }, { status: 500 });
  }
}
