const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('Testing Neon DB connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 60000, // Increased timeout
  idleTimeoutMillis: 30000,
  max: 3,
});

async function testConnection() {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts}: Attempting to connect...`);
      
      const client = await pool.connect();
      console.log('Connected successfully!');
      
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      console.log('Query result:', result.rows[0]);
      
      client.release();
      console.log('Connection test completed successfully!');
      return; // Success, exit function
      
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error.message);
      
      if (error.message.includes('timeout') && attempts < maxAttempts) {
        console.log('Database might be sleeping, waiting 10 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      } else {
        console.error('Connection failed after all attempts:', {
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          hostname: error.hostname,
          port: error.port
        });
        break;
      }
    }
  }
}

testConnection().finally(() => pool.end());
