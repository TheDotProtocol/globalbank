/**
 * Reset password for a user by email.
 * Usage: node scripts/reset-user-password.js <email> <newPassword>
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-user-password.js <email> <newPassword>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: { select: { accountNumber: true } },
    },
  });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log('✅ Password reset successfully');
  console.log(`   Name: ${user.firstName} ${user.lastName}`);
  console.log(`   Email: ${email}`);
  console.log(`   Accounts: ${user.accounts.map((a) => a.accountNumber).join(', ')}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
