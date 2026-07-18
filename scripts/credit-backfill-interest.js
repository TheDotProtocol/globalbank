/**
 * Backfill monthly interest from October 2025 through July 2026.
 * Last interest was credited on 04/10/2025 — this covers the 10 missing months.
 *
 * Usage: node scripts/credit-backfill-interest.js
 *        node scripts/credit-backfill-interest.js --dry-run
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

const DRY_RUN = process.argv.includes('--dry-run');

const INTEREST_RATES = {
  SAVINGS: { annual: 2.5, minimum: 50 },
  CHECKING: { annual: 1.0, minimum: 100 },
  BUSINESS: { annual: 1.8, minimum: 500 },
  DEFAULT: { annual: 1.5, minimum: 50 },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Oct 2025 through Jul 2026 (last credit was 04/10/2025)
const MONTHS_TO_CREDIT = [
  [2025, 10], [2025, 11], [2025, 12],
  [2026, 1], [2026, 2], [2026, 3], [2026, 4],
  [2026, 5], [2026, 6], [2026, 7],
];

function getRateConfig(accountType) {
  return INTEREST_RATES[accountType] || INTEREST_RATES.DEFAULT;
}

function calculateMonthlyInterest(balance, accountType) {
  const config = getRateConfig(accountType);
  if (balance < config.minimum) return 0;
  const monthlyRate = config.annual / 12;
  return Math.round((balance * monthlyRate / 100) * 100) / 100;
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0, 12, 0, 0);
}

async function creditInterestForMonth(year, month) {
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const creditDate = lastDayOfMonth(year, month);
  console.log(`\n🏦 Processing interest for ${monthLabel} (credit date: ${creditDate.toISOString().split('T')[0]})`);

  const accounts = await prisma.account.findMany({
    where: { isActive: true, balance: { gt: 0 } },
    include: { user: { select: { firstName: true, lastName: true } } },
  });

  let totalCredited = 0;
  let accountsCredited = 0;
  let skipped = 0;

  for (const account of accounts) {
    const reference = `INT-${year}-${String(month).padStart(2, '0')}-${account.accountNumber}`;

    const existing = await prisma.transaction.findFirst({
      where: { reference },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const balance = parseFloat(account.balance.toString());
    const interestAmount = calculateMonthlyInterest(balance, account.accountType);

    if (interestAmount <= 0) continue;

    if (DRY_RUN) {
      console.log(`  [DRY] ${account.accountNumber}: $${interestAmount.toFixed(2)} (balance $${balance.toFixed(2)})`);
      totalCredited += interestAmount;
      accountsCredited++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.account.findUnique({ where: { id: account.id } });
      const currentBalance = parseFloat(current.balance.toString());
      const amount = calculateMonthlyInterest(currentBalance, account.accountType);

      if (amount <= 0) return;

      await tx.account.update({
        where: { id: account.id },
        data: { balance: currentBalance + amount },
      });

      await tx.transaction.create({
        data: {
          accountId: account.id,
          userId: account.userId,
          type: 'CREDIT',
          amount: amount,
          description: `Interest Credited for ${monthLabel}`,
          reference,
          status: 'COMPLETED',
          createdAt: creditDate,
        },
      });

      totalCredited += amount;
      accountsCredited++;
      console.log(`  ✅ ${account.accountNumber} (${account.user.firstName} ${account.user.lastName}): +$${amount.toFixed(2)}`);
    });
  }

  console.log(`   Summary: ${accountsCredited} credited, ${skipped} skipped (already done), total $${totalCredited.toFixed(2)}`);
  return { totalCredited, accountsCredited, skipped };
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no changes will be made\n' : '🚀 Starting interest backfill: Oct 2025 → Jul 2026\n');

  let grandTotal = 0;
  let totalMonths = 0;

  for (const [year, month] of MONTHS_TO_CREDIT) {
    const result = await creditInterestForMonth(year, month);
    grandTotal += result.totalCredited;
    if (result.accountsCredited > 0 || result.skipped > 0) totalMonths++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎉 Backfill complete!`);
  console.log(`   Months processed: ${MONTHS_TO_CREDIT.length}`);
  console.log(`   Total interest credited: $${grandTotal.toFixed(2)}`);

  if (!DRY_RUN) {
    const interestCount = await prisma.transaction.count({
      where: { description: { contains: 'Interest Credited for' } },
    });
    console.log(`   Total interest transactions in DB: ${interestCount}`);
  }
}

main()
  .catch((e) => { console.error('❌ Fatal error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
