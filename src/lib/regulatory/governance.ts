import { prisma } from '@/lib/prisma';
import type { GovernanceRoleType, Jurisdiction, LicenseStatus } from '@prisma/client';

const DEFAULT_LICENSES: Array<{
  jurisdiction: Jurisdiction;
  licenseType: string;
  regulatorName: string;
  capitalRequired: number;
  status: LicenseStatus;
}> = [
  {
    jurisdiction: 'BVI',
    licenseType: 'Banking License (BVI FSC)',
    regulatorName: 'BVI Financial Services Commission',
    capitalRequired: 2_000_000,
    status: 'APPLICATION_SUBMITTED',
  },
  {
    jurisdiction: 'LABUAN',
    licenseType: 'Labuan Bank (DIB)',
    regulatorName: 'Labuan FSA',
    capitalRequired: 52_000_000,
    status: 'PLANNED',
  },
  {
    jurisdiction: 'THAILAND',
    licenseType: 'Digital Bank / Commercial Bank',
    regulatorName: 'Bank of Thailand',
    capitalRequired: 5_000_000_000,
    status: 'PLANNED',
  },
  {
    jurisdiction: 'INDIA',
    licenseType: 'Small Finance Bank / NBFC',
    regulatorName: 'Reserve Bank of India',
    capitalRequired: 2_000_000_000,
    status: 'PLANNED',
  },
];

const DEFAULT_GOVERNANCE: Array<{
  jurisdiction: Jurisdiction;
  role: GovernanceRoleType;
  holderName: string;
  holderEmail?: string;
}> = [
  { jurisdiction: 'BVI', role: 'BOARD_CHAIR', holderName: 'To be appointed' },
  { jurisdiction: 'BVI', role: 'CEO', holderName: 'To be appointed' },
  { jurisdiction: 'BVI', role: 'MLRO', holderName: 'To be appointed' },
  { jurisdiction: 'BVI', role: 'COMPLIANCE_OFFICER', holderName: 'To be appointed' },
  { jurisdiction: 'LABUAN', role: 'CRO', holderName: 'To be appointed' },
  { jurisdiction: 'LABUAN', role: 'CFO', holderName: 'To be appointed' },
];

const DEFAULT_LOAN_PRODUCTS = [
  {
    name: 'Personal Term Loan (BVI)',
    jurisdiction: 'BVI' as Jurisdiction,
    minAmount: 1000,
    maxAmount: 250000,
    minTermMonths: 6,
    maxTermMonths: 60,
    baseApr: 8.5,
  },
  {
    name: 'SME Working Capital (Labuan)',
    jurisdiction: 'LABUAN' as Jurisdiction,
    minAmount: 10000,
    maxAmount: 2000000,
    minTermMonths: 12,
    maxTermMonths: 84,
    baseApr: 7.25,
  },
];

const DEFAULT_SAFEGUARDING = [
  {
    jurisdiction: 'BVI' as Jurisdiction,
    bankName: 'Custodian Bank (BVI) — to be confirmed',
    accountNumber: 'PENDING',
    accountName: 'Global Dot Bank Customer Funds Trust',
    currency: 'USD',
    balance: 0,
  },
  {
    jurisdiction: 'LABUAN' as Jurisdiction,
    bankName: 'Labuan Safeguarding Account — to be confirmed',
    accountNumber: 'PENDING',
    accountName: 'Global Dot Bank Labuan Customer Funds',
    currency: 'USD',
    balance: 0,
  },
];

export async function seedRegulatoryFoundation(): Promise<void> {
  for (const license of DEFAULT_LICENSES) {
    await prisma.bankLicense.upsert({
      where: {
        jurisdiction_licenseType: {
          jurisdiction: license.jurisdiction,
          licenseType: license.licenseType,
        },
      },
      create: license,
      update: {},
    });
  }

  for (const role of DEFAULT_GOVERNANCE) {
    const existing = await prisma.governanceRole.findFirst({
      where: { jurisdiction: role.jurisdiction, role: role.role, holderName: role.holderName },
    });
    if (!existing) {
      await prisma.governanceRole.create({ data: role });
    }
  }

  for (const product of DEFAULT_LOAN_PRODUCTS) {
    const existing = await prisma.loanProduct.findFirst({
      where: { name: product.name, jurisdiction: product.jurisdiction },
    });
    if (!existing) {
      await prisma.loanProduct.create({ data: product });
    }
  }

  for (const account of DEFAULT_SAFEGUARDING) {
    const existing = await prisma.safeguardingAccount.findFirst({
      where: {
        jurisdiction: account.jurisdiction,
        accountNumber: account.accountNumber,
        purpose: 'CUSTOMER_FUNDS',
      },
    });
    if (!existing) {
      await prisma.safeguardingAccount.create({
        data: { ...account, purpose: 'CUSTOMER_FUNDS' },
      });
    }
  }
}

export async function getLicensingOverview() {
  await seedRegulatoryFoundation();
  const [licenses, governance, capital] = await Promise.all([
    prisma.bankLicense.findMany({ orderBy: { jurisdiction: 'asc' } }),
    prisma.governanceRole.findMany({ where: { isActive: true }, orderBy: { jurisdiction: 'asc' } }),
    prisma.bankLicense.aggregate({ _sum: { capitalRequired: true, capitalHeld: true } }),
  ]);

  return {
    licenses,
    governance,
    totalCapitalRequired: Number(capital._sum.capitalRequired ?? 0),
    totalCapitalHeld: Number(capital._sum.capitalHeld ?? 0),
  };
}
