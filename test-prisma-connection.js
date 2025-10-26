require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  // Try with connection timeout and ssl options
  const connectionString = process.env.DATABASE_URL;
  console.log('Using connection string:', connectionString.substring(0, 50) + '...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: connectionString + '&connect_timeout=30&pool_timeout=30&statement_timeout=30s'
      }
    }
  });

  try {
    console.log('Testing Prisma connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executed:', result);
    
    // Test products table access
    const productCount = await prisma.products.count();
    console.log('✅ Products count:', productCount);
    
  } catch (error) {
    console.error('❌ Prisma connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();