const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCardsTable() {
  try {
    console.log('🔍 Checking cards table structure...\n');
    
    // Try to get cards with minimal fields
    const cards = await prisma.card.findMany({
      select: {
        id: true,
        userId: true,
        cardNumber: true,
        cardType: true,
        expiryDate: true,
        cvv: true,
        isVirtual: true,
        isActive: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ Found ${cards.length} cards:\n`);
    cards.forEach((card, index) => {
      console.log(`💳 Card ${index + 1}: ${card.cardNumber} (${card.cardType})`);
      console.log(`   User ID: ${card.userId}`);
      console.log(`   Expiry: ${card.expiryDate}`);
      console.log(`   Virtual: ${card.isVirtual}, Active: ${card.isActive}`);
      console.log(`   Limits: $${card.dailyLimit}/day, $${card.monthlyLimit}/month`);
    });
    
  } catch (error) {
    console.error('❌ Error checking cards table:', error);
    
    // Try to get just the basic structure
    try {
      console.log('\n🔍 Trying minimal card query...');
      const basicCards = await prisma.card.findMany({
        select: {
          id: true,
          userId: true,
          cardNumber: true
        }
      });
      console.log(`✅ Found ${basicCards.length} cards with basic fields`);
    } catch (basicError) {
      console.error('❌ Even basic query failed:', basicError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkCardsTable(); 