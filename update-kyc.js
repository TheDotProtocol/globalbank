const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateKYC() {
  try {
    console.log('🔍 Updating KYC status for Saleena...\n');
    
    // Retry logic for prepared statement errors
    let updatedUser = null;
    let retries = 3;
    
    while (retries > 0) {
      try {
        // Update Saleena's KYC status to VERIFIED
        updatedUser = await prisma.user.update({
          where: {
            email: 'njmsweettie@gmail.com'
          },
          data: {
            kycStatus: 'VERIFIED'
          },
          include: {
            accounts: {
              include: {
                transactions: {
                  orderBy: { createdAt: 'desc' },
                  take: 5
                }
              }
            }
          }
        });
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        console.log(`Update attempt failed, retries left: ${retries}`);
        
        if (error?.message?.includes('prepared statement') && retries > 0) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // If it's not a prepared statement error or no retries left, throw
        throw error;
      }
    }

    if (!updatedUser) {
      throw new Error('Failed to update user after all retries');
    }

    console.log('✅ Successfully updated KYC status!');
    console.log(`👤 User: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`📱 Phone: ${updatedUser.phone || 'N/A'}`);
    console.log(`✅ KYC Status: ${updatedUser.kycStatus}`);
    
    if (updatedUser.accounts.length > 0) {
      console.log(`💰 Account Details:`);
      updatedUser.accounts.forEach(account => {
        console.log(`   - Account Number: ${account.accountNumber}`);
        console.log(`   - Type: ${account.accountType}`);
        console.log(`   - Balance: $${account.balance}`);
        console.log(`   - Currency: ${account.currency}`);
        
        if (account.transactions.length > 0) {
          console.log(`   - Recent Transactions:`);
          account.transactions.forEach(tx => {
            console.log(`     • ${tx.type}: $${tx.amount} - ${tx.description} (${tx.status})`);
          });
        }
      });
    }

  } catch (error) {
    console.error('❌ Error updating KYC status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateKYC(); 