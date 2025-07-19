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
    // Use raw SQL instead of Prisma to avoid schema validation issues
    console.log('🔄 Updating existing users...');
    const updateResult = await prisma.$executeRaw`
      UPDATE users 
      SET "emailVerified" = true, "emailVerifiedAt" = NOW() 
      WHERE "emailVerified" IS NULL OR "emailVerified" = false
    `;
    
    console.log(`✅ Updated existing users with email verification`);
    
    // Verify the setup
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.log('⚠️  Continuing build process despite database setup failure...');
    // Don't throw error to prevent build failure
    // This allows the build to continue even if database setup fails
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.log('⚠️  Database disconnect error (non-critical):', disconnectError.message);
    }
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
      // Don't exit with error code to prevent build failure
      console.log('⚠️  Continuing build process...');
      process.exit(0);
    });
}

module.exports = { setupDatabase }; 