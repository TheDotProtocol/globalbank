const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function runInterestSQL() {
  const prisma = new PrismaClient();
  
  try {
    console.log('💰 Running Interest Credit SQL...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'credit-interest-direct.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const result = await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Statement ${i + 1} completed`);
        } catch (error) {
          console.log(`⚠️ Statement ${i + 1} had an issue (this might be expected):`, error.message);
        }
      }
    }
    
    console.log('\n✅ Interest credit SQL completed!');
    console.log('📄 Check your database to see the updated balances and transactions');
    
  } catch (error) {
    console.error('❌ Error running SQL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runInterestSQL(); 