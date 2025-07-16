const { PrismaClient } = require('@prisma/client');

async function testConnection(connectionString, name) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log(`\n🔍 Testing ${name}...`);
    console.log('Connection string:', connectionString.substring(0, 50) + '...');
    
    // Test connection
    await prisma.$connect();
    console.log(`✅ ${name} connection successful!`);
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ ${name} query successful! Result:`, result);
    
    return true;
  } catch (error) {
    console.error(`❌ ${name} connection failed:`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function runTests() {
  const newConnection = "postgresql://postgres:Globalbank2024@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres";
  
  console.log('Testing new database connection...\n');
  
  const success = await testConnection(newConnection, "New Connection");
  
  console.log('\n📊 Results:');
  console.log('New connection:', success ? '✅ Success' : '❌ Failed');
  
  if (success) {
    console.log('\n🎉 Database connection works! Now update Vercel with this connection string:');
    console.log(newConnection);
  }
}

runTests(); 