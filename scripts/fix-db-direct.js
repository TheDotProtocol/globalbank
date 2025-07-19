const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database issues...');
    
    // Fix the specific transaction that's causing the issue
    const result = await prisma.$executeRaw`
      UPDATE transactions 
      SET type = 'DEPOSIT', status = 'COMPLETED'
      WHERE type = 'Deposit - 0506118608'
    `;
    
    console.log(`Updated ${result} transaction(s)`);
    
    // Check if there are any other invalid transactions
    const invalidCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM transactions 
      WHERE type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')
         OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
    `;
    
    console.log(`Remaining invalid transactions: ${invalidCount[0].count}`);
    
    if (invalidCount[0].count > 0) {
      // Fix any remaining invalid transactions
      const fixResult = await prisma.$executeRaw`
        UPDATE transactions 
        SET 
          type = CASE 
            WHEN type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT') THEN 'CREDIT'
            ELSE type
          END,
          status = CASE 
            WHEN status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') THEN 'COMPLETED'
            ELSE status
          END
        WHERE type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')
           OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
      `;
      
      console.log(`Fixed ${fixResult} additional transaction(s)`);
    }
    
    console.log('✅ Database fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase(); 