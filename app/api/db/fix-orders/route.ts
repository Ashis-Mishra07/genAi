import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('DB Init: Starting database structure check and fix');
    
    // Check current orders table structure
    const ordersColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('DB Init: Current orders table columns:', ordersColumns);
    
    // Check and add missing columns
    const existingColumns = ordersColumns.map(col => col.column_name);
    
    // Add customer_id if missing
    if (!existingColumns.includes('customer_id')) {
      console.log('DB Init: customer_id column missing, adding it...');
      await sql`
        ALTER TABLE orders 
        ADD COLUMN customer_id UUID REFERENCES users(id)
      `;
      console.log('DB Init: customer_id column added');
    }
    
    // Add total column if missing (rename total_amount if it exists)
    if (!existingColumns.includes('total')) {
      if (existingColumns.includes('total_amount')) {
        console.log('DB Init: Renaming total_amount to total...');
        await sql`ALTER TABLE orders RENAME COLUMN total_amount TO total`;
      } else {
        console.log('DB Init: Adding total column...');
        await sql`
          ALTER TABLE orders 
          ADD COLUMN total DECIMAL(10,2) NOT NULL DEFAULT 0
        `;
      }
      console.log('DB Init: total column ready');
    }
    
    // Add shipping_address column if missing
    if (!existingColumns.includes('shipping_address')) {
      console.log('DB Init: Adding shipping_address column...');
      await sql`
        ALTER TABLE orders 
        ADD COLUMN shipping_address JSONB
      `;
      console.log('DB Init: shipping_address column added');
    }
    
    // Add payment_method column if missing
    if (!existingColumns.includes('payment_method')) {
      console.log('DB Init: Adding payment_method column...');
      await sql`
        ALTER TABLE orders 
        ADD COLUMN payment_method VARCHAR(20) DEFAULT 'cod'
      `;
      console.log('DB Init: payment_method column added');
    }
    
    // Check if order_items table exists and has correct structure
    const orderItemsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      )
    `;
    
    if (!orderItemsExists[0].exists) {
      console.log('DB Init: Creating order_items table...');
      
      await sql`
        CREATE TABLE order_items (
          id SERIAL PRIMARY KEY,
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id),
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          quantity INTEGER NOT NULL,
          artisan_name VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('DB Init: order_items table created');
    } else {
      // Check if order_items has required columns
      const orderItemsColumns = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND table_schema = 'public'
      `;
      
      const itemColumns = orderItemsColumns.map(col => col.column_name);
      
      if (!itemColumns.includes('name')) {
        await sql`ALTER TABLE order_items ADD COLUMN name VARCHAR(255)`;
        console.log('DB Init: Added name column to order_items');
      }
      
      if (!itemColumns.includes('artisan_name')) {
        await sql`ALTER TABLE order_items ADD COLUMN artisan_name VARCHAR(255)`;
        console.log('DB Init: Added artisan_name column to order_items');
      }
    }
    
    // Get updated table structures
    const updatedOrdersColumns = await sql`
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
      message: 'Database structure checked and fixed',
      data: {
        ordersColumns: updatedOrdersColumns,
        orderItemsColumns: finalOrderItemsColumns,
        fixes: {
          addedCustomerId: !existingColumns.includes('customer_id'),
          fixedTotal: !existingColumns.includes('total'),
          addedShippingAddress: !existingColumns.includes('shipping_address'),
          addedPaymentMethod: !existingColumns.includes('payment_method'),
          createdOrderItems: !orderItemsExists[0].exists
        }
      }
    });
  } catch (error: any) {
    console.error('DB Init error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
