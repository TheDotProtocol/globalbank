const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runDeploymentMigration() {
  try {
    console.log('🚀 Starting deployment migration...');
    
    // Check if we're in production
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Run Prisma migrations
    console.log('📦 Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Test database connection
    console.log('🧪 Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users`);
    
    // Test KYC documents query specifically
    console.log('📄 Testing KYC documents query...');
    const kycDocs = await prisma.kycDocument.findMany({
      take: 1,
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        status: true
      }
    });
    console.log(`✅ KYC documents query successful! Found ${kycDocs.length} documents`);
    
    console.log('🎉 Deployment migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runDeploymentMigration();
}

module.exports = { runDeploymentMigration }; 