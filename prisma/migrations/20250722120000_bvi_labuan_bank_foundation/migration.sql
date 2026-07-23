-- BVI / Labuan bank foundation: governance, AML, lending, sub-ledger

CREATE TYPE "Jurisdiction" AS ENUM ('BVI', 'LABUAN', 'THAILAND', 'INDIA');
CREATE TYPE "LicenseStatus" AS ENUM ('PLANNED', 'APPLICATION_SUBMITTED', 'CONDITIONAL', 'ACTIVE', 'SUSPENDED', 'REVOKED');
CREATE TYPE "GovernanceRoleType" AS ENUM ('BOARD_CHAIR', 'CEO', 'CFO', 'CRO', 'MLRO', 'COMPLIANCE_OFFICER', 'COMPANY_SECRETARY');
CREATE TYPE "PepStatus" AS ENUM ('NONE', 'PEP', 'RCA');
CREATE TYPE "CustomerRiskRating" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'PROHIBITED');
CREATE TYPE "AmlCaseStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'ESCALATED', 'SAR_FILED', 'CLOSED');
CREATE TYPE "AmlCasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "LoanApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "LoanStatus" AS ENUM ('PENDING_DISBURSEMENT', 'ACTIVE', 'PAID_OFF', 'DEFAULTED', 'WRITTEN_OFF');
CREATE TYPE "LoanPaymentStatus" AS ENUM ('SCHEDULED', 'PAID', 'LATE', 'MISSED');
CREATE TYPE "SafeguardingPurpose" AS ENUM ('CUSTOMER_FUNDS', 'OPERATIONAL', 'CAPITAL_RESERVE');

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pepStatus" "PepStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "riskRating" "CustomerRiskRating" NOT NULL DEFAULT 'LOW';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastKycReviewAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "primaryJurisdiction" "Jurisdiction";

ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "holdAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "subLedgerCode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_subLedgerCode_key" ON "accounts"("subLedgerCode");

CREATE TABLE IF NOT EXISTS "bank_licenses" (
    "id" TEXT NOT NULL,
    "jurisdiction" "Jurisdiction" NOT NULL,
    "licenseType" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PLANNED',
    "licenseNumber" TEXT,
    "regulatorName" TEXT NOT NULL,
    "capitalRequired" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "capitalHeld" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "appliedAt" TIMESTAMP(3),
    "grantedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bank_licenses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bank_licenses_jurisdiction_licenseType_key" ON "bank_licenses"("jurisdiction", "licenseType");

CREATE TABLE IF NOT EXISTS "governance_roles" (
    "id" TEXT NOT NULL,
    "jurisdiction" "Jurisdiction" NOT NULL,
    "role" "GovernanceRoleType" NOT NULL,
    "holderName" TEXT NOT NULL,
    "holderEmail" TEXT,
    "appointedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "governance_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "aml_cases" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT,
    "transactionId" TEXT,
    "status" "AmlCaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "AmlCasePriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignee" TEXT,
    "sanctionsHit" BOOLEAN NOT NULL DEFAULT false,
    "fraudScore" INTEGER NOT NULL DEFAULT 0,
    "resolution" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "aml_cases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "aml_cases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "aml_cases_reference_key" ON "aml_cases"("reference");

CREATE TABLE IF NOT EXISTS "safeguarding_accounts" (
    "id" TEXT NOT NULL,
    "jurisdiction" "Jurisdiction" NOT NULL,
    "purpose" "SafeguardingPurpose" NOT NULL DEFAULT 'CUSTOMER_FUNDS',
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "safeguarding_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "loan_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jurisdiction" "Jurisdiction" NOT NULL,
    "minAmount" DECIMAL(65,30) NOT NULL,
    "maxAmount" DECIMAL(65,30) NOT NULL,
    "minTermMonths" INTEGER NOT NULL,
    "maxTermMonths" INTEGER NOT NULL,
    "baseApr" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "loan_applications" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "requestedAmount" DECIMAL(65,30) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "purpose" TEXT,
    "status" "LoanApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loan_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loan_applications_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loan_applications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "loan_applications_reference_key" ON "loan_applications"("reference");

CREATE TABLE IF NOT EXISTS "loans" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "principal" DECIMAL(65,30) NOT NULL,
    "outstanding" DECIMAL(65,30) NOT NULL,
    "apr" DECIMAL(65,30) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING_DISBURSEMENT',
    "disbursedAt" TIMESTAMP(3),
    "maturityDate" TIMESTAMP(3),
    "provisionRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "loans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loans_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "loan_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "loans_productId_fkey" FOREIGN KEY ("productId") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "loans_reference_key" ON "loans"("reference");
CREATE UNIQUE INDEX IF NOT EXISTS "loans_applicationId_key" ON "loans"("applicationId");

CREATE TABLE IF NOT EXISTS "loan_schedule_payments" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "principalDue" DECIMAL(65,30) NOT NULL,
    "interestDue" DECIMAL(65,30) NOT NULL,
    "totalDue" DECIMAL(65,30) NOT NULL,
    "status" "LoanPaymentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "loan_schedule_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loan_schedule_payments_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ledger_reconciliations" (
    "id" TEXT NOT NULL,
    "runDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerBalanceSum" DECIMAL(65,30) NOT NULL,
    "subLedgerBalanceSum" DECIMAL(65,30) NOT NULL,
    "poolBalance" DECIMAL(65,30) NOT NULL,
    "variance" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OK',
    "breaks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ledger_reconciliations_pkey" PRIMARY KEY ("id")
);
