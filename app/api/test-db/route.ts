import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  console.log('======= TEST DB CONNECTION =======');
  
  try {
    // Check if DATABASE_URL exists
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('DATABASE_URL first 50 chars:', process.env.DATABASE_URL?.substring(0, 50));
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in environment variables',
        env: Object.keys(process.env).filter(k => k.includes('DATABASE'))
      });
    }

    // Try to connect
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('Attempting simple query...');
    const result1 = await sql`SELECT 1 as test`;
    console.log('✓ Simple query worked:', result1);
    
    console.log('Counting products...');
    const result2 = await sql`SELECT COUNT(*) as total FROM products WHERE is_active = true`;
    console.log('✓ Products count:', result2[0].total);
    
    console.log('Fetching products...');
    const result3 = await sql`
      SELECT id, name, price, currency, image_url, category, video_url, video_status, user_id
      FROM products
      WHERE is_active = true 
      LIMIT 10
    `;
    console.log('✓ Products fetched:', result3.length);
    
    console.log('Fetching users...');
    const result4 = await sql`SELECT id, name, location FROM users LIMIT 10`;
    console.log('✓ Users fetched:', result4.length);
    
    // Combine products with users
    const userMap = new Map(result4.map((u: any) => [u.id, u]));
    const productsWithArtisans = result3.map((p: any) => {
      const user = userMap.get(p.user_id);
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        currency: p.currency,
        imageUrl: p.image_url,
        category: p.category,
        videoUrl: p.video_url,
        videoStatus: p.video_status,
        artisanName: user?.name || 'Unknown',
        artisanLocation: user?.location || 'Unknown'
      };
    });
    
    console.log('✓ Combined products with artisans:', productsWithArtisans.length);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: {
        testQuery: result1,
        productCount: result2[0].total,
        products: productsWithArtisans
      }
    });
    
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      cause: error.cause?.message,
      stack: error.stack
    }, { status: 500 });
  }
}
