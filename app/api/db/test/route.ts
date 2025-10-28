import { NextRequest, NextResponse } from 'next/server';
import { db, initializeDatabase } from '@/lib/db';

export async function GET() {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      console.log(`Database connection attempt ${attempts}/${maxAttempts}...`);
      
      // Test database connection with timeout
      const result: any = await Promise.race([
        db.query('SELECT NOW() as current_time, version() as version'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 30000)
        )
      ]);

      console.log('Database connection successful:', result.rows[0]);

      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        timestamp: result.rows[0].current_time,
        version: result.rows[0].version,
        attempts
      });

    } catch (error: any) {
      console.error(`Database connection attempt ${attempts} failed:`, error.message);
      
      if (attempts < maxAttempts && (
        error.message?.includes('timeout') || 
        error.message?.includes('ETIMEDOUT') ||
        error.code === 'ETIMEDOUT'
      )) {
        console.log('Database might be sleeping, waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        continue;
      }

      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Database connection failed',
          code: error.code || 'UNKNOWN',
          attempts
        },
        { status: 500 }
      );
    }
  }
}

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database initialization failed'
      },
      { status: 500 }
    );
  }
}
