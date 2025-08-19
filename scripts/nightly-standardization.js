#!/usr/bin/env node

/**
 * Nightly User Standardization Script
 * Runs at 00:00 hrs every night to ensure all users have consistent features
 * 
 * Usage: node scripts/nightly-standardization.js
 * 
 * This script can be scheduled with cron:
 * 0 0 * * * cd /path/to/globalbank && node scripts/nightly-standardization.js
 */

const { PrismaClient } = require('@prisma/client');
const { UserStandardization } = require('../src/lib/user-standardization');

const prisma = new PrismaClient();

async function runNightlyStandardization() {
  const startTime = new Date();
  console.log('🌙 Starting nightly user standardization...');
  console.log(`⏰ Time: ${startTime.toISOString()}`);
  console.log('='.repeat(50));

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, kycStatus: true }
    });

    console.log(`📊 Found ${users.length} users to standardize`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Standardize each user
    for (const user of users) {
      try {
        await UserStandardization.standardizeUser(user.id);
        console.log(`✅ Standardized: ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to standardize ${user.email}:`, error.message);
        errors.push({ email: user.email, error: error.message });
        errorCount++;
      }
    }

    // Summary
    const endTime = new Date();
    const duration = endTime - startTime;

    console.log('='.repeat(50));
    console.log('🎉 Nightly standardization completed!');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`✅ Success: ${successCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

    if (errors.length > 0) {
      console.log('\n📋 Errors encountered:');
      errors.forEach(({ email, error }) => {
        console.log(`  - ${email}: ${error}`);
      });
    }

    // Log to file for monitoring
    const logEntry = {
      timestamp: startTime.toISOString(),
      totalUsers: users.length,
      successCount,
      errorCount,
      duration,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('\n📝 Log entry:', JSON.stringify(logEntry, null, 2));

  } catch (error) {
    console.error('💥 Fatal error during nightly standardization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runNightlyStandardization()
    .then(() => {
      console.log('✅ Nightly standardization script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Nightly standardization script failed:', error);
      process.exit(1);
    });
}

module.exports = { runNightlyStandardization }; 