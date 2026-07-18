/**
 * Migrate all account numbers from prefix 050611 to 170309.
 * Keeps the remaining digits unchanged.
 *
 * Usage: node scripts/migrate-account-prefix.js
 */

const fs = require('fs');
const path = require('path');

// Load .env.local if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      value = value.replace(/\\n/g, '').trim();
      if (!process.env[key]) process.env[key] = value;
    });
  }
}

const { PrismaClient } = require('@prisma/client');

const OLD_PREFIX = '050611';
const NEW_PREFIX = '170309';

function migrateAccountNumber(value) {
  if (!value || !value.startsWith(OLD_PREFIX)) return value;
  return `${NEW_PREFIX}${value.slice(OLD_PREFIX.length)}`;
}

function migrateCheckNumber(value) {
  if (!value || !value.endsWith(OLD_PREFIX)) return value;
  return `${value.slice(0, -OLD_PREFIX.length)}${NEW_PREFIX}`;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Starting account number prefix migration: 050611 → 170309\n');

    // 1. Update accounts table
    const accounts = await prisma.account.findMany({
      where: { accountNumber: { startsWith: OLD_PREFIX } },
      select: { id: true, accountNumber: true },
    });

    console.log(`📋 Found ${accounts.length} accounts to update`);
    for (const account of accounts) {
      const newNumber = migrateAccountNumber(account.accountNumber);
      await prisma.account.update({
        where: { id: account.id },
        data: { accountNumber: newNumber },
      });
      console.log(`  ✅ ${account.accountNumber} → ${newNumber}`);
    }

    // 2. Update transaction account number references
    const sourceTx = await prisma.transaction.findMany({
      where: { sourceAccountNumber: { startsWith: OLD_PREFIX } },
      select: { id: true, sourceAccountNumber: true },
    });
    for (const tx of sourceTx) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { sourceAccountNumber: migrateAccountNumber(tx.sourceAccountNumber) },
      });
    }
    console.log(`\n📋 Updated ${sourceTx.length} transaction sourceAccountNumber fields`);

    const destTx = await prisma.transaction.findMany({
      where: { destinationAccountNumber: { startsWith: OLD_PREFIX } },
      select: { id: true, destinationAccountNumber: true },
    });
    for (const tx of destTx) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { destinationAccountNumber: migrateAccountNumber(tx.destinationAccountNumber) },
      });
    }
    console.log(`📋 Updated ${destTx.length} transaction destinationAccountNumber fields`);

    // 3. Update e-check numbers (suffix format: xxxxx050611)
    const checks = await prisma.eCheck.findMany({
      where: { checkNumber: { endsWith: OLD_PREFIX } },
      select: { id: true, checkNumber: true },
    });
    for (const check of checks) {
      const newNumber = migrateCheckNumber(check.checkNumber);
      await prisma.eCheck.update({
        where: { id: check.id },
        data: { checkNumber: newNumber },
      });
      console.log(`  ✅ Check ${check.checkNumber} → ${newNumber}`);
    }
    console.log(`\n📋 Updated ${checks.length} e-check numbers`);

    // 4. Update bank transfer references
    const bankTransfers = await prisma.bankTransfer.findMany({
      where: { toAccountNumber: { startsWith: OLD_PREFIX } },
      select: { id: true, toAccountNumber: true },
    });
    for (const bt of bankTransfers) {
      await prisma.bankTransfer.update({
        where: { id: bt.id },
        data: { toAccountNumber: migrateAccountNumber(bt.toAccountNumber) },
      });
    }
    console.log(`📋 Updated ${bankTransfers.length} bank transfer toAccountNumber fields`);

    // 5. Update corporate bank account numbers if applicable
    const corpBanks = await prisma.corporateBank.findMany({
      where: { accountNumber: { startsWith: OLD_PREFIX } },
      select: { id: true, accountNumber: true },
    });
    for (const bank of corpBanks) {
      const newNumber = migrateAccountNumber(bank.accountNumber);
      await prisma.corporateBank.update({
        where: { id: bank.id },
        data: { accountNumber: newNumber },
      });
      console.log(`  ✅ Corporate bank ${bank.accountNumber} → ${newNumber}`);
    }
    console.log(`📋 Updated ${corpBanks.length} corporate bank account numbers`);

    // 6. Update international transfer source account references
    const intlTransfers = await prisma.internationalTransfer.findMany({
      where: { accountNumber: { startsWith: OLD_PREFIX } },
      select: { id: true, accountNumber: true },
    });
    for (const transfer of intlTransfers) {
      await prisma.internationalTransfer.update({
        where: { id: transfer.id },
        data: { accountNumber: migrateAccountNumber(transfer.accountNumber) },
      });
    }
    console.log(`📋 Updated ${intlTransfers.length} international transfer accountNumber fields`);

    // Summary
    const remaining = await prisma.account.count({
      where: { accountNumber: { startsWith: OLD_PREFIX } },
    });

    console.log('\n🎉 Migration complete!');
    console.log(`   Accounts migrated: ${accounts.length}`);
    console.log(`   Remaining with old prefix: ${remaining}`);

    if (remaining === 0) {
      const allAccounts = await prisma.account.findMany({
        select: { accountNumber: true },
        orderBy: { accountNumber: 'asc' },
      });
      console.log('\n📊 All account numbers:');
      allAccounts.forEach((a) => console.log(`   ${a.accountNumber}`));
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
