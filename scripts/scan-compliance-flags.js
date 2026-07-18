/**
 * Scan existing transactions and apply compliance flags
 * Usage: node scripts/scan-compliance-flags.js
 */

const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const trimmed = line.trim().replace(/\\n/g, '');
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (!process.env[key]) process.env[key] = val;
    });
  }
}

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const txs = await prisma.$queryRaw`
    SELECT id FROM transactions
    WHERE "complianceStatus" = 'CLEAR' AND type::text = 'DEBIT' AND amount >= 5000
    LIMIT 500
  `;

  let flagged = 0;
  for (const tx of txs) {
    const row = await prisma.$queryRaw`
      SELECT amount, "transferMode", "userId" FROM transactions WHERE id = ${tx.id}
    `;
    const amount = row[0];
    if (!amount) continue;

    const num = parseFloat(amount.amount.toString());
    const transferMode = amount.transferMode;
    const userId = amount.userId;
    let shouldFlag = false;
    let flag = null;
    let reason = null;
    let risk = 0;

    if (num >= 10000) {
      shouldFlag = true;
      flag = 'HIGH_AMOUNT';
      reason = `Large transaction: $${num.toLocaleString()}`;
      risk = 40;
    } else if (transferMode === 'INTERNATIONAL_TRANSFER' && num >= 100) {
      shouldFlag = true;
      flag = 'UNUSUAL_PATTERN';
      reason = `International transfer $${num.toLocaleString()} — review recommended`;
      risk = 25;
    }

    if (shouldFlag) {
      const user = await prisma.$queryRaw`SELECT "branchId" FROM users WHERE id = ${userId}`;
      const branchId = user[0]?.branchId;
      await prisma.$executeRaw`
        UPDATE transactions SET
          "complianceStatus" = 'FLAGGED',
          "complianceFlag" = ${flag}::"ComplianceFlag",
          "flagReason" = ${reason},
          "flaggedAt" = NOW(),
          "flaggedBy" = 'SYSTEM',
          "riskScore" = ${risk},
          "branchId" = ${branchId}
        WHERE id = ${tx.id}
      `;
      flagged++;
    }
  }

  console.log(`✅ Flagged ${flagged} transactions for compliance review`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
