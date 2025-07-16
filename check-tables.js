const { PrismaClient } = require('@prisma/client');

async function checkTables() {
  const connectionString = "postgresql://postgres.rbmpeyjaoitdvafxntao:GlobalBank2024@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  try {
    console.log('🔍 Checking database tables...');
    
    // Check if users table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('✅ Tables found:', tables.map(t => t.table_name));
    
    // Try to count users
    try {
      const userCount = await prisma.user.count();
      console.log('✅ Users table accessible, count:', userCount);
    } catch (error) {
      console.log('❌ Users table not accessible:', error.message);
    }
    
    // Try to count accounts
    try {
      const accountCount = await prisma.account.count();
      console.log('✅ Accounts table accessible, count:', accountCount);
    } catch (error) {
      console.log('❌ Accounts table not accessible:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables(); 