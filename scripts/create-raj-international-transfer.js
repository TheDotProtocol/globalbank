/**
 * Create Rajasekaran → R Arun Kumar international transfer ($100 USD → INR)
 * and backfill UTR on existing transactions missing one.
 *
 * Usage: node scripts/create-raj-international-transfer.js
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

function generateUTR() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let utr = 'GDB';
  for (let i = 0; i < 9; i++) utr += chars[Math.floor(Math.random() * chars.length)];
  return utr;
}

function generateRef(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
}

async function addUtrColumns() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS utr TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE international_transfers ADD COLUMN IF NOT EXISTS utr TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE international_transfers ADD COLUMN IF NOT EXISTS "targetCurrency" TEXT DEFAULT 'USD'`);
    console.log('✅ UTR columns ensured');
  } catch (e) {
    console.log('⚠️ UTR columns:', e.message);
  }
}

async function backfillUtrs() {
  const missing = await prisma.transaction.findMany({
    where: { utr: null },
    select: { id: true },
  });

  let count = 0;
  for (const tx of missing) {
    let utr = generateUTR();
    let attempts = 0;
    while (attempts < 5) {
      try {
        await prisma.transaction.update({ where: { id: tx.id }, data: { utr } });
        count++;
        break;
      } catch {
        utr = generateUTR();
        attempts++;
      }
    }
  }
  console.log(`✅ Backfilled UTR on ${count} existing transactions`);
}

async function createTransfer() {
  const SOURCE_ACCOUNT = '1703095866';
  const amount = 100;
  const currency = 'USD';
  const targetCurrency = 'INR';
  const exchangeRate = 74.5;
  const convertedAmount = amount * exchangeRate; // ₹7,450
  const transferFee = amount * 0.02; // $2
  const totalAmount = amount + transferFee; // $102

  const account = await prisma.account.findFirst({
    where: { accountNumber: SOURCE_ACCOUNT },
    include: { user: true },
  });

  if (!account) throw new Error(`Account ${SOURCE_ACCOUNT} not found`);

  const user = account.user;
  const balance = parseFloat(account.balance.toString());

  if (balance < totalAmount) {
    throw new Error(`Insufficient balance: $${balance} < $${totalAmount}`);
  }

  const transactionRef = generateRef('INTL');
  const utr = generateUTR();
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: account.id },
      data: { balance: balance - totalAmount },
    });

    const debitTx = await tx.transaction.create({
      data: {
        accountId: account.id,
        userId: user.id,
        type: 'DEBIT',
        amount,
        description: 'International transfer to R Arun Kumar - Kotak Mahindra Bank',
        reference: transactionRef,
        utr,
        status: 'COMPLETED',
        transferMode: 'INTERNATIONAL_TRANSFER',
        sourceAccountNumber: account.accountNumber,
        sourceAccountHolder: `${user.firstName} ${user.lastName}`,
        destinationAccountNumber: '5411518311',
        destinationAccountHolder: 'R Arun Kumar',
        transferFee,
        netAmount: amount,
        createdAt: now,
      },
    });

    await tx.transaction.create({
      data: {
        accountId: account.id,
        userId: user.id,
        type: 'DEBIT',
        amount: transferFee,
        description: `International transfer fee - UTR ${utr}`,
        reference: `${transactionRef}-FEE`,
        utr: `${utr}F`,
        status: 'COMPLETED',
        createdAt: now,
      },
    });

    const intlTransfer = await tx.internationalTransfer.create({
      data: {
        userId: user.id,
        accountId: account.id,
        transactionId: debitTx.id,
        amount,
        currency,
        targetCurrency,
        exchangeRate,
        convertedAmount,
        transferFee,
        totalAmount,
        beneficiaryName: 'R Arun Kumar',
        beneficiaryCountry: 'India',
        beneficiaryCity: 'Bangalore',
        bankName: 'Kotak Mahindra Bank',
        swiftCode: 'KKBKINBBBLR',
        accountNumber: '5411518311',
        description: 'International transfer USD to INR',
        reference: transactionRef,
        utr,
        status: 'COMPLETED',
        estimatedDelivery: now,
        completedAt: now,
        createdAt: now,
      },
    });

    return { debitTx, intlTransfer };
  });

  const updatedAccount = await prisma.account.findUnique({ where: { id: account.id } });

  console.log('\n🎉 International Transfer COMPLETED\n');
  console.log('═'.repeat(50));
  console.log('TRANSFER CONFIRMATION SLIP');
  console.log('═'.repeat(50));
  console.log(`UTR Number:        ${utr}`);
  console.log(`Reference:         ${transactionRef}`);
  console.log(`Status:            COMPLETED`);
  console.log(`Date:              ${now.toISOString()}`);
  console.log('');
  console.log('FROM:');
  console.log(`  ${user.firstName} ${user.lastName}`);
  console.log(`  Account: ${account.accountNumber}`);
  console.log('');
  console.log('TO:');
  console.log(`  R Arun Kumar`);
  console.log(`  Kotak Mahindra Bank`);
  console.log(`  SWIFT: KKBKINBBBLR`);
  console.log(`  Account: 5411518311`);
  console.log(`  Country: India`);
  console.log('');
  console.log('AMOUNT:');
  console.log(`  Transfer:    $${amount.toFixed(2)} USD`);
  console.log(`  Rate:        1 USD = ${exchangeRate} INR`);
  console.log(`  Converted:   ₹${convertedAmount.toLocaleString('en-IN')} INR`);
  console.log(`  Fee (2%):    $${transferFee.toFixed(2)}`);
  console.log(`  Total Debit: $${totalAmount.toFixed(2)} USD`);
  console.log('');
  console.log(`New Balance: $${parseFloat(updatedAccount.balance.toString()).toLocaleString()}`);
  console.log(`Transaction ID: ${result.debitTx.id}`);
  console.log('═'.repeat(50));
  console.log('\nView in app: Dashboard → Transactions → click this transfer');
  console.log(`Download PDF: Transaction detail modal → Download Confirmation Slip`);

  return { utr, transactionRef, transactionId: result.debitTx.id };
}

async function main() {
  await addUtrColumns();
  await backfillUtrs();
  await createTransfer();
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
