// Test the exact query that's failing
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testQuery() {
  try {
    console.log('Testing products query with JOIN...\n');
    
    // Test 1: Get products without JOIN
    console.log('1. Testing products alone...');
    const products = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.price,
        p.user_id
      FROM products p
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ Products:', products.length);
    products.forEach(p => console.log(`  - ${p.name} (user_id: ${p.user_id})`));
    
    // Test 2: Get users
    console.log('\n2. Testing users...');
    const users = await sql`SELECT id, name FROM users LIMIT 5`;
    console.log('✓ Users:', users.length);
    users.forEach(u => console.log(`  - ${u.name} (id: ${u.id})`));
    
    // Test 3: Try LEFT JOIN
    console.log('\n3. Testing LEFT JOIN...');
    const leftJoin = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.price,
        u.name as artisan_name
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ LEFT JOIN result:', leftJoin.length);
    leftJoin.forEach(p => console.log(`  - ${p.name} by ${p.artisan_name}`));
    
    // Test 4: Try INNER JOIN
    console.log('\n4. Testing INNER JOIN...');
    const innerJoin = await sql`
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
    console.log('✓ INNER JOIN result:', innerJoin.length);
    innerJoin.forEach(p => console.log(`  - ${p.name} by ${p.artisan_name}`));
    
    // Test 5: Try without quoted aliases
    console.log('\n5. Testing without quoted aliases...');
    const test5 = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.currency, 
        p.image_url,
        p.category,
        u.name as artisan_name,
        u.location as artisan_location
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ Test 5 result:', test5.length);
    test5.forEach(p => console.log(`  - ${p.name} by ${p.artisan_name} (₹${p.price})`));
    
    // Test 6: Add description
    console.log('\n6. Testing with description...');
    const test6 = await sql`
      SELECT 
        p.id, 
        p.name,
        p.description,
        p.price
      FROM products p
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ Test 6 result:', test6.length);
    
    // Test 7: Add created_at
    console.log('\n7. Testing with created_at...');
    const test7 = await sql`
      SELECT 
        p.id, 
        p.name,
        p.created_at
      FROM products p
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ Test 7 result:', test7.length);
    
    // Test 8: Full query without ORDER BY
    console.log('\n8. Testing full query without ORDER BY...');
    const test8 = await sql`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price, 
        p.currency, 
        p.image_url, 
        p.category, 
        p.is_active, 
        p.user_id,
        p.created_at,
        p.updated_at,
        p.video_url,
        p.video_status,
        u.name as artisan_name,
        u.location as artisan_location
      FROM products p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.is_active = true 
      LIMIT 5
    `;
    console.log('✓ Test 8 result:', test8.length);
    
    console.log('\n✅ All queries passed!');
  } catch (error) {
    console.error('\n❌ Query error:', error.message);
    console.error('Full error:', error);
  }
}

testQuery();
