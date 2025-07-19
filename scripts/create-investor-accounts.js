const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createInvestorAccounts() {
  try {
    console.log('🚀 Creating investor accounts...');

    // Create first user: njmsweettie@gmail.com
    console.log('\n📧 Creating account for njmsweettie@gmail.com...');
    
    const hashedPassword1 = await bcrypt.hash('Saleena@132', 12);
    
    const user1 = await prisma.user.create({
      data: {
        email: 'njmsweettie@gmail.com',
        password: hashedPassword1,
        firstName: 'Saleena',
        lastName: 'Sweet',
        phone: '+1 555-0123',
        kycStatus: 'PENDING',
        emailVerified: true
      }
    });

    const account1 = await prisma.account.create({
      data: {
        userId: user1.id,
        accountNumber: `GB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        accountType: 'CHECKING',
        balance: 150001,
        currency: 'USD',
        isActive: true
      }
    });

    const card1 = await prisma.card.create({
      data: {
        userId: user1.id,
        accountId: account1.id,
        cardNumber: '4532123456789012',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: new Date('2028-12-31'),
        cvv: '123',
        isActive: true,
        dailyLimit: 5000,
        monthlyLimit: 50000
      }
    });

    const transaction1 = await prisma.transaction.create({
      data: {
        userId: user1.id,
        accountId: account1.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Singapore',
        status: 'COMPLETED',
        reference: 'AR-HOLDINGS-DEPOSIT',
        createdAt: new Date()
      }
    });

    console.log(`✅ Created user: ${user1.firstName} ${user1.lastName}`);
    console.log(`   Account: ${account1.accountNumber}`);
    console.log(`   Balance: $${account1.balance}`);
    console.log(`   Card: ${maskCardNumber(card1.cardNumber)}`);

    // Create second user: babyaccount@globaldotbank.org
    console.log('\n👶 Creating account for babyaccount@globaldotbank.org...');
    
    const hashedPassword2 = await bcrypt.hash('Babytau@132', 12);
    
    const user2 = await prisma.user.create({
      data: {
        email: 'babyaccount@globaldotbank.org',
        password: hashedPassword2,
        firstName: 'Baby',
        lastName: 'Tau',
        phone: '+66 821763146',
        kycStatus: 'PENDING',
        emailVerified: true
      }
    });

    const account2 = await prisma.account.create({
      data: {
        userId: user2.id,
        accountNumber: `GB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        accountType: 'CHECKING',
        balance: 300000,
        currency: 'USD',
        isActive: true
      }
    });

    const card2 = await prisma.card.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        cardNumber: '4532987654321098',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: new Date('2028-12-31'),
        cvv: '456',
        isActive: true,
        dailyLimit: 5000,
        monthlyLimit: 50000
      }
    });

    // Create transactions for baby account
    const transaction2a = await prisma.transaction.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Global HQ, USA - Daddy\'s first gift',
        status: 'COMPLETED',
        reference: 'DADDY-GIFT-1',
        createdAt: new Date('2025-07-19T12:45:00Z')
      }
    });

    const transaction2b = await prisma.transaction.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy\'s first gift',
        status: 'COMPLETED',
        reference: 'MOMMY-GIFT-1',
        createdAt: new Date('2025-07-19T12:45:00Z')
      }
    });

    // Create fixed deposit for baby account
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + 18); // 18 years maturity

    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        amount: 100000,
        interestRate: 5.5,
        duration: 216, // 18 years * 12 months
        maturityDate: maturityDate,
        status: 'ACTIVE'
      }
    });

    console.log(`✅ Created user: ${user2.firstName} ${user2.lastName}`);
    console.log(`   Account: ${account2.accountNumber}`);
    console.log(`   Balance: $${account2.balance}`);
    console.log(`   Card: ${maskCardNumber(card2.cardNumber)}`);
    console.log(`   Fixed Deposit: $${fixedDeposit.amount} (18 years maturity)`);

    console.log('\n🎉 All investor accounts created successfully!');
    console.log('\n📋 Account Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 ${user1.firstName} ${user1.lastName}`);
    console.log(`   Email: ${user1.email}`);
    console.log(`   Password: Saleena@132`);
    console.log(`   Account: ${account1.accountNumber}`);
    console.log(`   Balance: $${account1.balance.toLocaleString()}`);
    console.log(`   Card: ${maskCardNumber(card1.cardNumber)}`);
    console.log('');
    console.log(`👶 ${user2.firstName} ${user2.lastName}`);
    console.log(`   Email: ${user2.email}`);
    console.log(`   Password: Babytau@132`);
    console.log(`   Account: ${account2.accountNumber}`);
    console.log(`   Balance: $${account2.balance.toLocaleString()}`);
    console.log(`   Card: ${maskCardNumber(card2.cardNumber)}`);
    console.log(`   Fixed Deposit: $${fixedDeposit.amount.toLocaleString()} (18 years)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating investor accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function maskCardNumber(cardNumber) {
  return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1 **** **** $3');
}

// Run the script
if (require.main === module) {
  createInvestorAccounts()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createInvestorAccounts }; 