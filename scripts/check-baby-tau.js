const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBabyTau() {
  try {
    console.log('🔍 Checking Baby Tau account...');

    const user = await prisma.user.findUnique({
      where: { email: 'babyaccount@globaldotbank.org' },
      include: {
        accounts: true,
        cards: true
      }
    });

    if (!user) {
      console.log('❌ Baby Tau user not found!');
      return;
    }

    console.log('✅ Baby Tau user found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);

    if (user.accounts.length > 0) {
      const account = user.accounts[0];
      console.log(`\n💰 Account: ${account.accountNumber}`);
      console.log(`   Balance: $${account.balance.toLocaleString()}`);

      if (user.cards.length === 0) {
        console.log('\n💳 Creating missing card...');
        
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

        console.log(`✅ Card created: ${maskCardNumber(card.cardNumber)}`);
      } else {
        console.log(`\n💳 Card exists: ${maskCardNumber(user.cards[0].cardNumber)}`);
      }
    } else {
      console.log('❌ No account found for Baby Tau');
    }

  } catch (error) {
    console.error('❌ Error checking Baby Tau:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function maskCardNumber(cardNumber) {
  return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1 **** **** $3');
}

checkBabyTau(); 