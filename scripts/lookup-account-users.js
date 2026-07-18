/**
 * Look up login details by account number and rename Baby Tau → Easaan Arun Kumar
 * Usage: node scripts/lookup-account-users.js
 */

const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
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
const prisma = new PrismaClient();

const ACCOUNT_NUMBERS = ['1703095866', '1703094890', '1703098609'];

// Documented passwords from repo scripts (for reference output)
const DOCUMENTED_PASSWORDS = {
  'babyaccount@globaldotbank.org': ['Babytau@132', 'Babutau@132'],
  'njmsweettie@gmail.com': ['Saleena@132'],
  'supraneebuangam@gmail.com': [],
};

async function main() {
  const rename = process.argv.includes('--rename');

  console.log('🔍 Looking up users by account number...\n');

  for (const accountNumber of ACCOUNT_NUMBERS) {
    const account = await prisma.account.findFirst({
      where: { accountNumber },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            kycStatus: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!account) {
      console.log(`❌ Account ${accountNumber}: NOT FOUND\n`);
      continue;
    }

    const u = account.user;
    console.log(`Account: ${accountNumber}`);
    console.log(`  Name: ${u.firstName} ${u.lastName}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Phone: ${u.phone || 'N/A'}`);
    console.log(`  KYC: ${u.kycStatus}`);
    console.log(`  Balance: $${account.balance}`);
    console.log(`  Type: ${account.accountType}`);
    if (DOCUMENTED_PASSWORDS[u.email]) {
      console.log(`  Documented passwords: ${DOCUMENTED_PASSWORDS[u.email].join(' / ')}`);
    } else {
      console.log(`  Documented passwords: (none in repo scripts — check DB or reset)`);
    }
    console.log('');
  }

  if (rename) {
    const babyAccount = await prisma.account.findFirst({
      where: { accountNumber: '1703098609' },
      include: { user: true },
    });

    if (babyAccount) {
      const updated = await prisma.user.update({
        where: { id: babyAccount.user.id },
        data: {
          firstName: 'Easaan',
          lastName: 'Arun Kumar',
        },
      });
      console.log('✅ Renamed user:');
      console.log(`   ${babyAccount.user.firstName} ${babyAccount.user.lastName} → ${updated.firstName} ${updated.lastName}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Account: 1703098609`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
