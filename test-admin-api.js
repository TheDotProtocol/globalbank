const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAdminAPI() {
  try {
    console.log('🧪 Testing admin API database connection...');
    
    // Test 1: Check if we can query users
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycStatus: true,
        kycDocuments: {
          select: {
            id: true,
            documentType: true,
            documentUrl: true,
            status: true
          }
        }
      }
    });
    
    console.log('✅ Users query successful!');
    console.log(`📊 Found ${users.length} users`);
    
    // Test 2: Check KYC documents specifically
    const kycDocs = await prisma.kycDocument.findMany({
      take: 3,
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        status: true
      }
    });
    
    console.log('✅ KYC documents query successful!');
    console.log(`📄 Found ${kycDocs.length} KYC documents`);
    
    // Test 3: Check if all required columns exist
    const sampleUser = await prisma.user.findFirst({
      include: {
        accounts: true,
        kycDocuments: true,
        cards: true
      }
    });
    
    if (sampleUser) {
      console.log('✅ Full user query with relations successful!');
      console.log(`👤 Sample user: ${sampleUser.firstName} ${sampleUser.lastName}`);
      console.log(`🏦 Accounts: ${sampleUser.accounts.length}`);
      console.log(`📄 KYC Documents: ${sampleUser.kycDocuments.length}`);
      console.log(`💳 Cards: ${sampleUser.cards.length}`);
    }
    
    console.log('\n🎉 All database tests passed! The admin API should now work correctly.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI(); 