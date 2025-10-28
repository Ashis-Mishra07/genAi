import { NextResponse } from 'next/server';
import { query } from '@/lib/db/chat';

export async function GET() {
  try {
    // Check users table structure
    const usersColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    // Check products table structure
    const productsColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);
    
    // Check if tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    return NextResponse.json({
      success: true,
      tables: tables.rows,
      usersColumns: usersColumns.rows,
      productsColumns: productsColumns.rows
    });
    
  } catch (error) {
    console.error('Error checking structure:', error);
    return NextResponse.json(
      { error: 'Failed to check structure', details: error },
      { status: 500 }
    );
  }
}