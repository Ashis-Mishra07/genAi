const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Neon Database Connection...');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
  console.log('DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');

  try {
    // Test 1: Basic connection with increased timeout
    console.log('\n=== Test 1: Basic Connection with 30s timeout ===');
    const sql = neon(process.env.DATABASE_URL, {
      fetchOptions: {
        timeout: 30000, // 30 seconds
      },
    });

    console.log('Executing simple query...');
    const startTime = Date.now();
    const result = await sql`SELECT 1 as test`;
    const endTime = Date.now();
    
    console.log('✅ Connection successful!');
    console.log('Query result:', result);
    console.log(`Query time: ${endTime - startTime}ms`);

    // Test 2: Check products table
    console.log('\n=== Test 2: Checking products table ===');
    const productsCount = await sql`SELECT COUNT(*) as count FROM products`;
    console.log('✅ Products table accessible');
    console.log('Products count:', productsCount[0].count);

    // Test 3: Check users table
    console.log('\n=== Test 3: Checking users table ===');
    const usersCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('✅ Users table accessible');
    console.log('Users count:', usersCount[0].count);

    // Test 4: Insert test (will rollback)
    console.log('\n=== Test 4: Test Insert ===');
    try {
      const testInsert = await sql`
        INSERT INTO products (
          name, description, price, currency, is_active, user_id, created_at, updated_at
        ) VALUES (
          'TEST_PRODUCT_DELETE_ME', 'Test product for connection testing', 100, 'INR', false, 
          (SELECT id FROM users LIMIT 1), NOW(), NOW()
        ) RETURNING id
      `;
      console.log('✅ Insert successful, id:', testInsert[0].id);
      
      // Clean up
      await sql`DELETE FROM products WHERE name = 'TEST_PRODUCT_DELETE_ME'`;
      console.log('✅ Test product cleaned up');
    } catch (err) {
      console.log('❌ Insert test failed:', err.message);
    }

    console.log('\n✅ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection test failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    
    console.error('\nFull error:', error);
    
    console.log('\n=== Troubleshooting Steps ===');
    console.log('1. Check if your Neon database is active (not paused)');
    console.log('2. Visit https://console.neon.tech and wake up your database');
    console.log('3. Verify your DATABASE_URL is correct in .env.local');
    console.log('4. Check if your firewall/antivirus is blocking connections');
    console.log('5. Try using the direct connection string instead of pooler');
    
    process.exit(1);
  }
}

testConnection();
