const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if email verification columns exist
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('emailVerified', 'emailVerifiedAt', 'emailVerificationToken')
    `;
    
    console.log('📋 Current user table columns:', tableInfo);
    
    // Add missing columns if they don't exist
    const existingColumns = tableInfo.map(col => col.column_name);
    
    if (!existingColumns.includes('emailVerified')) {
      console.log('➕ Adding emailVerified column...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "emailVerified" BOOLEAN DEFAULT false`;
      console.log('✅ emailVerified column added');
    }
    
    if (!existingColumns.includes('emailVerifiedAt')) {
      console.log('➕ Adding emailVerifiedAt column...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "emailVerifiedAt" TIMESTAMP`;
      console.log('✅ emailVerifiedAt column added');
    }
    
    if (!existingColumns.includes('emailVerificationToken')) {
      console.log('➕ Adding emailVerificationToken column...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "emailVerificationToken" TEXT`;
      console.log('✅ emailVerificationToken column added');
    }
    
    // Update existing users to have emailVerified = true (for backward compatibility)
    console.log('🔄 Updating existing users...');
    const updateResult = await prisma.user.updateMany({
      where: {
        emailVerified: null
      },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} existing users`);
    
    // Verify the setup
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase }; 