const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCardCreation() {
  try {
    // First, let's check if we have any users and accounts
    const users = await prisma.user.findMany({
      include: {
        accounts: true
      }
    });

    console.log('Users found:', users.length);
    
    if (users.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }

    const user = users[0];
    console.log('Using user:', user.email);
    console.log('Accounts:', user.accounts.length);

    if (user.accounts.length === 0) {
      console.log('No accounts found for user. Please create an account first.');
      return;
    }

    const account = user.accounts[0];
    console.log('Using account:', account.accountNumber);

    // Test card creation
    const cardNumber = '1234567890123456';
    const cvv = '123';
    const expiryDate = new Date(2027, 11, 1); // December 2027

    const card = await prisma.card.create({
      data: {
        userId: user.id,
        accountId: account.id,
        cardNumber: cardNumber.slice(-4),
        cardType: 'VIRTUAL',
        status: 'ACTIVE',
        expiryDate,
        cvv,
        isVirtual: true,
        dailyLimit: 1000,
        monthlyLimit: 5000
      }
    });

    console.log('Card created successfully:', {
      id: card.id,
      cardNumber: card.cardNumber,
      cardType: card.cardType,
      status: card.status,
      isVirtual: card.isVirtual
    });

  } catch (error) {
    console.error('Error testing card creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCardCreation(); 