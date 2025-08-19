# GlobalBank Database Schema

Complete database schema documentation for GlobalBank digital banking platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Management](#user-management)
3. [Account Management](#account-management)
4. [Transaction System](#transaction-system)
5. [Card Management](#card-management)
6. [Fixed Deposits](#fixed-deposits)
7. [KYC System](#kyc-system)
8. [AI Interactions](#ai-interactions)
9. [E-Checks](#e-checks)
10. [Enums](#enums)

---

## 🏗️ Overview

### Database Technology
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Connection**: Connection pooling enabled
- **Migrations**: Automatic schema migrations

### Schema Features
- **Relationships**: Proper foreign key constraints
- **Indexing**: Optimized for query performance
- **Validation**: Data integrity constraints
- **Audit Trail**: Created/updated timestamps

---

## 👤 User Management

### User Model
```sql
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  kycStatus KycStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 2FA fields
  twoFactorSecret     String?
  twoFactorEnabled    Boolean @default(false)
  twoFactorVerifiedAt DateTime?

  // Relations
  accounts     Account[]
  cards        Card[]
  fixedDeposits FixedDeposit[]
  kycDocuments KycDocument[]
  aiInteractions AiInteraction[]
  transactions Transaction[]
  eChecks      ECheck[]

  @@map("users")
}
```

**Field Descriptions:**
- `id`: Unique user identifier (CUID)
- `email`: User's email address (unique)
- `password`: Hashed password using bcrypt
- `firstName`: User's first name
- `lastName`: User's last name
- `phone`: Optional phone number
- `kycStatus`: KYC verification status
- `twoFactorSecret`: TOTP secret for 2FA
- `twoFactorEnabled`: Whether 2FA is enabled
- `twoFactorVerifiedAt`: When 2FA was verified

---

## 💳 Account Management

### Account Model
```sql
model Account {
  id            String      @id @default(cuid())
  userId        String
  accountNumber String      @unique
  accountType   AccountType
  balance       Decimal     @default(0)
  currency      String      @default("USD")
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  eChecks      ECheck[]

  @@map("accounts")
}
```

**Field Descriptions:**
- `id`: Unique account identifier
- `userId`: Foreign key to User
- `accountNumber`: Unique 10-digit account number
- `accountType`: Type of account (SAVINGS, CHECKING, etc.)
- `balance`: Current account balance
- `currency`: Account currency (default: USD)
- `isActive`: Whether account is active

**Account Number Format:**
- Pattern: `050611` + 4 random digits
- Example: `0506111234`

---

## 💰 Transaction System

### Transaction Model
```sql
model Transaction {
  id          String        @id @default(cuid())
  accountId   String
  type        TransactionType
  amount      Decimal
  description String
  reference   String?       @unique
  status      TransactionStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Dispute fields
  isDisputed  Boolean       @default(false)
  disputeReason String?
  disputeStatus DisputeStatus @default(NONE)
  disputeCreatedAt DateTime?
  disputeResolvedAt DateTime?
  disputeResolution String?

  // Relations
  account     Account       @relation(fields: [accountId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String

  @@map("transactions")
}
```

**Field Descriptions:**
- `id`: Unique transaction identifier
- `accountId`: Foreign key to Account
- `userId`: Foreign key to User
- `type`: Transaction type (CREDIT, DEBIT, etc.)
- `amount`: Transaction amount
- `description`: Transaction description
- `reference`: Unique transaction reference
- `status`: Transaction status
- `isDisputed`: Whether transaction is disputed
- `disputeReason`: Reason for dispute
- `disputeStatus`: Status of dispute resolution

**Transaction Reference Format:**
- Pattern: `TXN` + timestamp + random hex
- Example: `TXN1642233600A1B2C3D4`

---

## 💳 Card Management

### Card Model
```sql
model Card {
  id            String    @id @default(cuid())
  userId        String
  cardNumber    String    @unique
  cardType      CardType
  expiryDate    DateTime
  cvv           String
  isActive      Boolean   @default(true)
  dailyLimit    Decimal   @default(1000)
  monthlyLimit  Decimal   @default(5000)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("cards")
}
```

**Field Descriptions:**
- `id`: Unique card identifier
- `userId`: Foreign key to User
- `cardNumber`: Unique 16-digit card number
- `cardType`: Type of card (VIRTUAL, DEBIT, CREDIT)
- `expiryDate`: Card expiry date
- `cvv`: 3-digit security code
- `isActive`: Whether card is active
- `dailyLimit`: Daily spending limit
- `monthlyLimit`: Monthly spending limit

**Card Number Format:**
- Pattern: 16 digits starting with 4
- Example: `4111111111111111`

---

## 📈 Fixed Deposits

### FixedDeposit Model
```sql
model FixedDeposit {
  id            String    @id @default(cuid())
  userId        String
  accountId     String
  amount        Decimal
  interestRate  Decimal
  duration      Int       // in months
  maturityDate  DateTime
  status        DepositStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("fixed_deposits")
}
```

**Field Descriptions:**
- `id`: Unique deposit identifier
- `userId`: Foreign key to User
- `accountId`: Source account ID
- `amount`: Deposit amount
- `interestRate`: Annual interest rate
- `duration`: Duration in months
- `maturityDate`: When deposit matures
- `status`: Deposit status

**Interest Rate Tiers:**
- 3 Months: 6.5% p.a.
- 6 Months: 7.5% p.a.
- 12 Months: 9.0% p.a.
- 24 Months: 10.0% p.a.

---

## 📄 KYC System

### KycDocument Model
```sql
model KycDocument {
  id          String    @id @default(cuid())
  userId      String
  documentType DocumentType
  fileUrl     String
  status      DocumentStatus @default(PENDING)
  uploadedAt  DateTime  @default(now())
  verifiedAt  DateTime?

  // Relations
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("kyc_documents")
}
```

**Field Descriptions:**
- `id`: Unique document identifier
- `userId`: Foreign key to User
- `documentType`: Type of document
- `fileUrl`: URL to uploaded file
- `status`: Document verification status
- `uploadedAt`: When document was uploaded
- `verifiedAt`: When document was verified

**Required Documents:**
- `ID_PROOF`: Government-issued ID
- `ADDRESS_PROOF`: Proof of address
- `INCOME_PROOF`: Income verification
- `BANK_STATEMENT`: Bank statement

---

## 🤖 AI Interactions

### AiInteraction Model
```sql
model AiInteraction {
  id        String      @id @default(cuid())
  userId    String
  message   String
  response  String
  category  AiCategory
  createdAt DateTime    @default(now())

  // Relations
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("ai_interactions")
}
```

**Field Descriptions:**
- `id`: Unique interaction identifier
- `userId`: Foreign key to User
- `message`: User's message
- `response`: AI's response
- `category`: Interaction category
- `createdAt`: When interaction occurred

**AI Categories:**
- `FINANCIAL_LITERACY`: Educational content
- `INVESTMENT_GUIDANCE`: Investment advice
- `SECURITY_EDUCATION`: Security tips
- `AUTOMATION_ASSISTANCE`: Feature help
- `GENERAL_QUERY`: General questions

---

## 📋 E-Checks

### ECheck Model
```sql
model ECheck {
  id            String        @id @default(cuid())
  userId        String
  accountId     String
  checkNumber   String        @unique
  payeeName     String
  amount        Decimal
  memo          String?
  status        CheckStatus   @default(PENDING)
  clearedAt     DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  account       Account       @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@map("e_checks")
}
```

**Field Descriptions:**
- `id`: Unique check identifier
- `userId`: Foreign key to User
- `accountId`: Source account ID
- `checkNumber`: Unique check number
- `payeeName`: Name of payee
- `amount`: Check amount
- `memo`: Optional memo
- `status`: Check status
- `clearedAt`: When check was cleared

**Check Number Format:**
- Pattern: `EC` + timestamp + random digits
- Example: `EC123456789`

---

## 📊 Enums

### AccountType
```sql
enum AccountType {
  SAVINGS
  CHECKING
  FIXED_DEPOSIT
  BUSINESS
}
```

### TransactionType
```sql
enum TransactionType {
  CREDIT
  DEBIT
  TRANSFER
  WITHDRAWAL
  DEPOSIT
}
```

### TransactionStatus
```sql
enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}
```

### DisputeStatus
```sql
enum DisputeStatus {
  NONE
  PENDING
  UNDER_REVIEW
  RESOLVED
  REJECTED
}
```

### CardType
```sql
enum CardType {
  DEBIT
  CREDIT
  VIRTUAL
}
```

### DepositStatus
```sql
enum DepositStatus {
  ACTIVE
  MATURED
  WITHDRAWN
  CANCELLED
}
```

### KycStatus
```sql
enum KycStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### DocumentType
```sql
enum DocumentType {
  ID_PROOF
  ADDRESS_PROOF
  INCOME_PROOF
  BANK_STATEMENT
}
```

### DocumentStatus
```sql
enum DocumentStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### AiCategory
```sql
enum AiCategory {
  FINANCIAL_LITERACY
  INVESTMENT_GUIDANCE
  SECURITY_EDUCATION
  AUTOMATION_ASSISTANCE
  GENERAL_QUERY
}
```

### CheckStatus
```sql
enum CheckStatus {
  PENDING
  CLEARED
  REJECTED
}
```

---

## 🔗 Relationships

### One-to-Many Relationships
- **User → Accounts**: One user can have multiple accounts
- **User → Cards**: One user can have multiple cards
- **User → Fixed Deposits**: One user can have multiple deposits
- **User → KYC Documents**: One user can have multiple documents
- **User → AI Interactions**: One user can have multiple AI chats
- **User → Transactions**: One user can have multiple transactions
- **User → E-Checks**: One user can have multiple e-checks
- **Account → Transactions**: One account can have multiple transactions
- **Account → E-Checks**: One account can have multiple e-checks

### Cascade Deletes
- When a user is deleted, all related records are deleted
- When an account is deleted, all related transactions and e-checks are deleted

---

## 📈 Indexes

### Primary Indexes
- All `id` fields are primary keys
- All `@unique` fields have unique indexes

### Performance Indexes
```sql
-- User queries
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_kyc_status ON users(kycStatus);

-- Account queries
CREATE INDEX idx_account_user_id ON accounts(userId);
CREATE INDEX idx_account_number ON accounts(accountNumber);

-- Transaction queries
CREATE INDEX idx_transaction_user_id ON transactions(userId);
CREATE INDEX idx_transaction_account_id ON transactions(accountId);
CREATE INDEX idx_transaction_created_at ON transactions(createdAt);
CREATE INDEX idx_transaction_status ON transactions(status);

-- Card queries
CREATE INDEX idx_card_user_id ON cards(userId);
CREATE INDEX idx_card_number ON cards(cardNumber);

-- Fixed deposit queries
CREATE INDEX idx_fixed_deposit_user_id ON fixed_deposits(userId);
CREATE INDEX idx_fixed_deposit_status ON fixed_deposits(status);

-- KYC queries
CREATE INDEX idx_kyc_document_user_id ON kyc_documents(userId);
CREATE INDEX idx_kyc_document_status ON kyc_documents(status);

-- AI interaction queries
CREATE INDEX idx_ai_interaction_user_id ON ai_interactions(userId);
CREATE INDEX idx_ai_interaction_created_at ON ai_interactions(createdAt);

-- E-Check queries
CREATE INDEX idx_e_check_user_id ON e_checks(userId);
CREATE INDEX idx_e_check_account_id ON e_checks(accountId);
CREATE INDEX idx_e_check_status ON e_checks(status);
```

---

## 🔒 Security Features

### Data Encryption
- Passwords hashed with bcrypt (12 rounds)
- Sensitive data encrypted at rest
- All connections use SSL/TLS

### Access Control
- Row-level security implemented
- User can only access their own data
- Admin role checks for admin operations

### Audit Trail
- All tables have `createdAt` timestamps
- Most tables have `updatedAt` timestamps
- Transaction history preserved
- Dispute tracking maintained

---

## 📊 Data Types

### Decimal Fields
- All monetary amounts use `Decimal` type
- Precision: 10 digits total, 2 decimal places
- Example: `12345678.90`

### String Fields
- IDs: CUID format (25 characters)
- Email: Standard email format
- Phone: International format
- Names: Unicode text

### DateTime Fields
- All timestamps in UTC
- ISO 8601 format
- Timezone-aware storage

---

## 🔄 Migrations

### Running Migrations
```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Migration Best Practices
- Always backup before migrations
- Test migrations in development first
- Use descriptive migration names
- Review generated SQL before applying

---

**Last Updated**: December 19, 2024  
**Schema Version**: 1.0.0  
**Database**: PostgreSQL 14+ 