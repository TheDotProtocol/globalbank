const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function creditInterestWithSQL() {
  try {
    console.log('💰 Crediting Interest for July 2025 using SQL...\n');
    
    // First, let's get the current account balances
    const accounts = await prisma.$queryRaw`
      SELECT 
        a.id,
        a."accountNumber",
        a.balance,
        a."accountType",
        u.id as "userId",
        u.email
      FROM accounts a
      JOIN users u ON a."userId" = u.id
      WHERE a."isActive" = true AND a.balance > 0
      ORDER BY a."accountNumber"
    `;

    console.log(`📊 Found ${accounts.length} active accounts for interest credit\n`);

    // Interest rates configuration
    const INTEREST_RATES = {
      'SAVINGS': { annualRate: 2.5, monthlyRate: 2.5 / 12, minimumBalance: 50 },
      'CHECKING': { annualRate: 1.0, monthlyRate: 1.0 / 12, minimumBalance: 100 },
      'BUSINESS': { annualRate: 1.8, monthlyRate: 1.8 / 12, minimumBalance: 500 }
    };

    let totalInterestCredited = 0;
    let accountsCredited = 0;
    const timestamp = Date.now();

    for (const account of accounts) {
      try {
        const balance = parseFloat(account.balance.toString());
        const accountType = account.accountType;
        
        // Find interest rate for this account type
        let rateConfig = INTEREST_RATES[accountType];
        
        // If no specific rate found, use a default rate
        if (!rateConfig) {
          console.log(`⚠️ No specific rate for account type: ${accountType}, using default rate`);
          rateConfig = {
            annualRate: 1.5,
            monthlyRate: 1.5 / 12,
            minimumBalance: 50
          };
        }

        // Check minimum balance requirement
        if (balance < rateConfig.minimumBalance) {
          console.log(`❌ ${account.accountNumber}: $${balance} < $${rateConfig.minimumBalance} (min) - NO INTEREST`);
          continue;
        }

        // Calculate monthly interest
        const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
        const roundedInterest = Math.round(monthlyInterest * 100) / 100;
        
        if (roundedInterest > 0) {
          // Update account balance with interest using raw SQL
          const newBalance = balance + roundedInterest;
          
          await prisma.$executeRaw`
            UPDATE accounts 
            SET balance = ${newBalance}, "updatedAt" = NOW()
            WHERE id = ${account.id}
          `;

          // Create interest transaction using raw SQL
          const transactionId = `int-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
          const reference = `INT-JULY-2025-${account.accountNumber}`;
          
          await prisma.$executeRaw`
            INSERT INTO transactions (
              id, "accountId", "userId", type, amount, description, reference, status, "createdAt", "updatedAt"
            ) VALUES (
              ${transactionId}, ${account.id}, ${account.userId}, 'CREDIT', ${roundedInterest}, 
              'Interest Credited for July 2025', ${reference}, 'COMPLETED', NOW(), NOW()
            )
          `;

          totalInterestCredited += roundedInterest;
          accountsCredited++;
          
          console.log(`✅ ${account.accountNumber}: $${balance} → $${newBalance} (+$${roundedInterest.toFixed(2)}) [${accountType}]`);
        } else {
          console.log(`⚠️ ${account.accountNumber}: $${balance} - No interest (too low)`);
        }
      } catch (error) {
        console.error(`❌ Error processing account ${account.accountNumber}:`, error);
      }
    }

    console.log(`\n🎉 Interest Credit Summary:`);
    console.log(`================================`);
    console.log(`💰 Total Interest Credited: $${totalInterestCredited.toFixed(2)}`);
    console.log(`📈 Accounts Credited: ${accountsCredited}`);
    console.log(`📅 Period: July 2025`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);

    // Verify the updates using raw SQL
    console.log(`\n📊 Verification - Updated Account Balances:`);
    console.log(`============================================`);
    const updatedAccounts = await prisma.$queryRaw`
      SELECT 
        a."accountNumber",
        a.balance,
        a."accountType",
        u.email
      FROM accounts a
      JOIN users u ON a."userId" = u.id
      WHERE a."isActive" = true
      ORDER BY a."accountNumber"
    `;

    updatedAccounts.forEach(acc => {
      console.log(`${acc.accountNumber}: $${acc.balance} (${acc.accountType}) - ${acc.email}`);
    });

    // Check interest transactions using raw SQL
    console.log(`\n📊 Verification - Interest Transactions:`);
    console.log(`========================================`);
    const interestTransactions = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t."createdAt",
        a."accountNumber"
      FROM transactions t
      JOIN accounts a ON t."accountId" = a.id
      WHERE t.description LIKE '%Interest Credited for July 2025%'
      ORDER BY t."createdAt" DESC
    `;

    console.log(`Found ${interestTransactions.length} interest transactions:`);
    interestTransactions.forEach(tx => {
      console.log(`- ${tx.accountNumber}: $${tx.amount} (${tx.createdAt})`);
    });

    console.log(`\n✅ Interest credit completed successfully!`);
    console.log(`📄 Users can now see these transactions in their personal accounts`);
    console.log(`📊 PDF statements will include the interest credits`);

  } catch (error) {
    console.error('❌ Error crediting interest:', error);
  } finally {
    await prisma.$disconnect();
  }
}

creditInterestWithSQL(); 