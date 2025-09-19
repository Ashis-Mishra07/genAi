import { NextResponse } from 'next/server';
import { Pool, neonConfig } from '@neondatabase/serverless';

// Configure Neon for serverless environments
neonConfig.fetchConnectionCache = true;

// Create a pool with Neon serverless driver
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon serverless handles connection pooling and SSL automatically
});

export async function GET() {
  try {
    console.log('Testing Neon serverless database connection...');
    console.log('Database URL host:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
    
    const client = await pool.connect();
    console.log('Connected with Neon serverless driver!');
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    client.release();
    
    return NextResponse.json({
      success: true,
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version,
      driver: 'Neon Serverless',
      message: 'Database connection successful with serverless driver!'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      suggestion: 'Check your Neon database status in the dashboard.'
    }, { status: 500 });
  }
}
