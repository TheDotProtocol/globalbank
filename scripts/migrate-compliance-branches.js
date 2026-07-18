/**
 * Schema migration: branches, compliance fields, sumsub applicant id
 * Usage: node scripts/migrate-compliance-branches.js
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  }
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BRANCHES = [
  { name: 'United States (HQ)', country: 'United States', city: 'Mountain View', address: '1075 Terra Bella Ave, Mountain View, CA, 94043', region: 'Americas', isHQ: true },
  { name: 'Dubai, UAE', country: 'United Arab Emirates', city: 'Dubai', address: 'Level 29, Marina Plaza, Dubai Marina', region: 'EMEA', isHQ: false },
  { name: 'Belize', country: 'Belize', city: 'Belize City', address: 'Suite 305, Matalon Building, Coney Drive, Belize City', region: 'Americas', isHQ: false },
  { name: 'Turkey', country: 'Turkey', city: 'Istanbul', address: 'Maslak Mah., Büyükdere Cad., Istanbul 34398', region: 'EMEA', isHQ: false },
  { name: 'India', country: 'India', city: 'Bengaluru', address: '91 Springboard, MG Road, Bengaluru, 560001', region: 'Asia-Pacific', isHQ: false },
  { name: 'Thailand (Asia HQ)', country: 'Thailand', city: 'Bangkok', address: '23 Sukhumvit Soi 13, Khlong Toei Nuea, Bangkok 10110', region: 'Asia-Pacific', isHQ: false },
  { name: 'Singapore', country: 'Singapore', city: 'Singapore', address: '20 Collyer Quay, #23-01, Raffles Place, 049319', region: 'Asia-Pacific', isHQ: false },
  { name: 'Malaysia', country: 'Malaysia', city: 'Kuala Lumpur', address: 'Level 36, Menara Citibank, Jalan Ampang, Kuala Lumpur 50450', region: 'Asia-Pacific', isHQ: false },
  { name: 'Indonesia', country: 'Indonesia', city: 'Jakarta', address: 'World Trade Center 3, Jalan Jenderal Sudirman, Jakarta 12930', region: 'Asia-Pacific', isHQ: false },
  { name: 'Vietnam', country: 'Vietnam', city: 'Ho Chi Minh City', address: 'Saigon Trade Center, 37 Ton Duc Thang, District 1, Ho Chi Minh City', region: 'Asia-Pacific', isHQ: false },
  { name: 'South Korea', country: 'South Korea', city: 'Seoul', address: '23F, Seoul Finance Center, 136 Sejong-daero, Jung-gu, Seoul', region: 'Asia-Pacific', isHQ: false },
];

async function runSql() {
  const enumStatements = [
    `DO $$ BEGIN CREATE TYPE "ComplianceStatus" AS ENUM ('CLEAR','FLAGGED','UNDER_REVIEW','APPROVED','ON_HOLD','REJECTED','REPORTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE "ComplianceFlag" AS ENUM ('HIGH_AMOUNT','RAPID_SUCCESSION','UNUSUAL_PATTERN','INTERNATIONAL_HIGH_RISK','STRUCTURING','MANUAL_FLAG'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE "ComplianceAction" AS ENUM ('APPROVE','HOLD','REJECT','REPORT','ESCALATE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  ];

  for (const sql of enumStatements) {
    try { await prisma.$executeRawUnsafe(sql); console.log('✅ Enum OK'); } catch (e) { console.log('Enum note:', e.message?.slice(0, 80)); }
  }

  const statements = [
    `CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      region TEXT,
      "isHQ" BOOLEAN DEFAULT false,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "branchId" TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS "sumsubApplicantId" TEXT`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "branchId" TEXT`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "flagReason" TEXT`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "flaggedAt" TIMESTAMP`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "riskScore" INTEGER DEFAULT 0`,
    `CREATE TABLE IF NOT EXISTS compliance_reviews (
      id TEXT PRIMARY KEY,
      "transactionId" TEXT NOT NULL,
      notes TEXT,
      "reviewedBy" TEXT NOT NULL,
      "reviewerRole" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      console.log('SQL note:', e.message?.slice(0, 80));
    }
  }

  // Convert compliance columns to enum types if they were TEXT
  const alterEnums = [
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "complianceStatus" "ComplianceStatus" DEFAULT 'CLEAR'`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "complianceFlag" "ComplianceFlag"`,
    `ALTER TABLE compliance_reviews ADD COLUMN IF NOT EXISTS action "ComplianceAction"`,
  ];
  // Convert TEXT compliance columns to enum types
  const convertEnums = [
    `ALTER TABLE transactions ALTER COLUMN "complianceStatus" DROP DEFAULT`,
    `ALTER TABLE transactions ALTER COLUMN "complianceStatus" TYPE "ComplianceStatus" USING COALESCE("complianceStatus"::"ComplianceStatus", 'CLEAR'::"ComplianceStatus")`,
    `ALTER TABLE transactions ALTER COLUMN "complianceStatus" SET DEFAULT 'CLEAR'::"ComplianceStatus"`,
    `ALTER TABLE transactions ALTER COLUMN "complianceFlag" TYPE "ComplianceFlag" USING "complianceFlag"::"ComplianceFlag"`,
  ];
  for (const sql of convertEnums) {
    try { await prisma.$executeRawUnsafe(sql); console.log('✅ Converted column'); } catch (e) { console.log('Convert:', e.message?.slice(0, 100)); }
  }
}

async function seedBranches() {
  for (const b of BRANCHES) {
    const existing = await prisma.branch.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.branch.create({ data: b });
      console.log(`✅ Branch: ${b.name}`);
    }
  }
}

async function assignDefaultBranch() {
  const hq = await prisma.branch.findFirst({ where: { isHQ: true } });
  if (!hq) return;
  const updated = await prisma.user.updateMany({
    where: { branchId: null },
    data: { branchId: hq.id },
  });
  console.log(`✅ Assigned ${updated.count} users to HQ branch`);
}

async function main() {
  console.log('Running compliance + branches migration...');
  await runSql();
  await seedBranches();
  await assignDefaultBranch();
  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
