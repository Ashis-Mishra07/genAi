const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkPhotograph() {
  try {
    const result = await sql`
      SELECT id, name, email, photograph, avatar, gender 
      FROM users 
      WHERE email = 'swasthik@gmail.com' 
      LIMIT 1
    `;
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPhotograph();
