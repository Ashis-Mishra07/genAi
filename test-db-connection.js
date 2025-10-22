// Quick test to check database connection
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
    
    // Test 1: Simple query
    console.log('\n1. Testing simple SELECT...');
    const result1 = await sql`SELECT 1 as test`;
    console.log('✓ Simple query works:', result1);
    
    // Test 2: Count products
    console.log('\n2. Counting products...');
    const result2 = await sql`SELECT COUNT(*) as total FROM products`;
    console.log('✓ Total products:', result2[0].total);
    
    // Test 3: Count active products
    console.log('\n3. Counting active products...');
    const result3 = await sql`SELECT COUNT(*) as total FROM products WHERE is_active = true`;
    console.log('✓ Active products:', result3[0].total);
    
    // Test 4: List products with artisans
    console.log('\n4. Fetching products with artisans...');
    const result4 = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.price,
        u.name as artisan_name
      FROM products p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ Products fetched:', result4.length);
    result4.forEach(p => {
      console.log(`  - ${p.name} by ${p.artisan_name} (₹${p.price})`);
    });
    
    console.log('\n✅ All database tests passed!');
  } catch (error) {
    console.error('\n❌ Database error:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
