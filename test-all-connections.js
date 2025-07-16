const { PrismaClient } = require('@prisma/client');

async function testConnection(connectionString, name) {
  console.log(`\n🔍 Testing ${name}...`);
  console.log('Connection:', connectionString.substring(0, 60) + '...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log(`✅ ${name} connection successful!`);
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ ${name} query successful:`, result);
    
    console.log(`\n🎉 Use this ${name} connection string in Vercel:`);
    console.log(connectionString);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error(`❌ ${name} connection failed:`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    await prisma.$disconnect();
    return false;
  }
}

async function testAllConnections() {
  const connections = [
    {
      name: "Direct Connection",
      url: "postgresql://postgres:GlobalBank2024@db.rbmpeyjaoitdvafxntao.supabase.co:5432/postgres"
    },
    {
      name: "Transaction Pooler",
      url: "postgresql://postgres.rbmpeyjaoitdvafxntao:GlobalBank2024@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
    },
    {
      name: "Session Pooler", 
      url: "postgresql://postgres.rbmpeyjaoitdvafxntao:GlobalBank2024@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    }
  ];

  console.log('🧪 Testing all Supabase connection options...\n');

  for (const connection of connections) {
    const success = await testConnection(connection.url, connection.name);
    if (success) {
      console.log(`\n🎯 ${connection.name} WORKS! Use this one.`);
      return connection.url;
    }
  }
  
  console.log('\n❌ All connections failed. Please restart your Supabase project.');
  return null;
}

testAllConnections(); 