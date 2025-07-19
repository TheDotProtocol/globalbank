const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createBabyTau() {
  try {
    console.log('👶 Creating Baby Tau account...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'babyaccount@globaldotbank.org' }
    });

    if (existingUser) {
      console.log('⚠️  Baby Tau account already exists!');
      console.log(`   User ID: ${existingUser.id}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Babytau@132', 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'babyaccount@globaldotbank.org',
        password: hashedPassword,
        firstName: 'Baby',
        lastName: 'Tau',
        phone: '+66 821763146',
        kycStatus: 'PENDING',
        emailVerified: true
      }
    });

    console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);

    // Create account
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: `GB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        accountType: 'CHECKING',
        balance: 300000,
        currency: 'USD',
        isActive: true
      }
    });

    console.log(`✅ Created account: ${account.accountNumber}`);
    console.log(`   Balance: $${account.balance.toLocaleString()}`);

    // Create debit card
    const card = await prisma.card.create({
      data: {
        userId: user.id,
        accountId: account.id,
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

    console.log(`✅ Created card: ${maskCardNumber(card.cardNumber)}`);

    // Create transactions
    const transaction1 = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Global HQ, USA - Daddy\'s first gift',
        status: 'COMPLETED',
        reference: 'DADDY-GIFT-1',
        createdAt: new Date('2025-07-19T12:45:00Z')
      }
    });

    const transaction2 = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy\'s first gift',
        status: 'COMPLETED',
        reference: 'MOMMY-GIFT-1',
        createdAt: new Date('2025-07-19T12:45:00Z')
      }
    });

    console.log(`✅ Created transactions: $${transaction1.amount.toLocaleString()} + $${transaction2.amount.toLocaleString()}`);

    // Create fixed deposit
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + 18); // 18 years maturity

    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId: user.id,
        accountId: account.id,
        amount: 100000,
        interestRate: 5.5,
        duration: 216, // 18 years * 12 months
        maturityDate: maturityDate,
        status: 'ACTIVE'
      }
    });

    console.log(`✅ Created fixed deposit: $${fixedDeposit.amount.toLocaleString()} (18 years)`);

    console.log('\n🎉 Baby Tau account created successfully!');
    console.log('\n📋 Account Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👶 ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: Babytau@132`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Account: ${account.accountNumber}`);
    console.log(`   Balance: $${account.balance.toLocaleString()}`);
    console.log(`   Card: ${maskCardNumber(card.cardNumber)}`);
    console.log(`   Fixed Deposit: $${fixedDeposit.amount.toLocaleString()} (18 years)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating Baby Tau account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function maskCardNumber(cardNumber) {
  return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1 **** **** $3');
}

// Run the script
if (require.main === module) {
  createBabyTau()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createBabyTau }; 