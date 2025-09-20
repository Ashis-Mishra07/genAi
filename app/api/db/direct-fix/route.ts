import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('DB Direct Fix: Starting direct SQL fixes');
    
    // First, check current structure
    const currentColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('Current columns:', currentColumns);
    
    const columnNames = currentColumns.map(col => col.column_name);
    
    // Fix column names to match code expectations
    const fixes = [];
    
    // 1. Rename total_amount to total if needed
    if (columnNames.includes('total_amount') && !columnNames.includes('total')) {
      await sql`ALTER TABLE orders RENAME COLUMN total_amount TO total`;
      fixes.push('Renamed total_amount to total');
    }
    
    // 2. Add missing columns
    if (!columnNames.includes('shipping_address')) {
      await sql`ALTER TABLE orders ADD COLUMN shipping_address JSONB`;
      fixes.push('Added shipping_address column');
    }
    
    if (!columnNames.includes('payment_method')) {
      await sql`ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cod'`;
      fixes.push('Added payment_method column');
    }
    
    // 3. Ensure order_items has required columns
    const orderItemsColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      AND table_schema = 'public'
    `;
    
    const itemColumnNames = orderItemsColumns.map(col => col.column_name);
    
    if (!itemColumnNames.includes('name')) {
      await sql`ALTER TABLE order_items ADD COLUMN name VARCHAR(255)`;
      fixes.push('Added name column to order_items');
    }
    
    if (!itemColumnNames.includes('artisan_name')) {
      await sql`ALTER TABLE order_items ADD COLUMN artisan_name VARCHAR(255)`;
      fixes.push('Added artisan_name column to order_items');
    }
    
    // Get final structure
    const finalOrdersColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const finalOrderItemsColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Database structure fixed with direct SQL',
      fixes: fixes,
      finalStructure: {
        orders: finalOrdersColumns,
        order_items: finalOrderItemsColumns
      }
    });
  } catch (error: any) {
    console.error('DB Direct Fix error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
