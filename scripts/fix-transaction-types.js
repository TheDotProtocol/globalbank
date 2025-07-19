const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTransactionTypes() {
  try {
    console.log('🔧 Fixing invalid transaction types and statuses...');
    
    // Get all transactions with invalid types
    const invalidTransactions = await prisma.$queryRaw`
      SELECT id, type, status, description 
      FROM transactions 
      WHERE type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')
         OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
    `;
    
    console.log(`Found ${invalidTransactions.length} transactions with invalid types or statuses:`, invalidTransactions);
    
    // Fix each invalid transaction
    for (const transaction of invalidTransactions) {
      let newType = transaction.type;
      let newStatus = transaction.status;
      
      // Fix type
      if (transaction.type === 'Deposit - 0506118608') {
        newType = 'DEPOSIT';
      } else if (!['CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT'].includes(transaction.type)) {
        // Determine the correct type based on description
        if (transaction.description.toLowerCase().includes('deposit')) {
          newType = 'DEPOSIT';
        } else if (transaction.description.toLowerCase().includes('withdrawal')) {
          newType = 'WITHDRAWAL';
        } else if (transaction.description.toLowerCase().includes('transfer')) {
          newType = 'TRANSFER';
        } else if (transaction.description.toLowerCase().includes('debit')) {
          newType = 'DEBIT';
        } else if (transaction.description.toLowerCase().includes('credit')) {
          newType = 'CREDIT';
        } else {
          newType = 'CREDIT'; // Default
        }
      }
      
      // Fix status
      if (transaction.status === 'COMPLETE') {
        newStatus = 'COMPLETED';
      } else if (!['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(transaction.status)) {
        newStatus = 'COMPLETED'; // Default to completed
      }
      
      console.log(`Fixing transaction ${transaction.id}: type ${transaction.type} -> ${newType}, status ${transaction.status} -> ${newStatus}`);
      
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          type: newType,
          status: newStatus
        }
      });
    }
    
    console.log('✅ Transaction types and statuses fixed successfully!');
    
    // Verify the fix
    const remainingInvalid = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM transactions 
      WHERE type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')
         OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
    `;
    
    console.log(`Remaining invalid transactions: ${remainingInvalid[0].count}`);
    
  } catch (error) {
    console.error('❌ Error fixing transaction types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTransactionTypes(); 