# Database Setup Guide

## Step 1: Install PostgreSQL

### On macOS (using Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### On Windows:
Download from: https://www.postgresql.org/download/windows/

### On Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE globalbank;

# Create user (optional)
CREATE USER globalbank_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE globalbank TO globalbank_user;

# Exit psql
\q
```

## Step 3: Update Environment Variables

Create or update your `.env.local` file:

```env
DATABASE_URL="postgresql://globalbank_user:your_password@localhost:5432/globalbank"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 4: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View your database in Prisma Studio
npx prisma studio
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Go to: `http://localhost:3000/register`
3. Create a test account
4. Try logging in at: `http://localhost:3000/login`

## Database Schema Overview

Your database includes:

- **Users**: Customer accounts with KYC status
- **Accounts**: Savings, checking, business accounts
- **Transactions**: All financial transactions
- **Cards**: Virtual and physical cards
- **Fixed Deposits**: Term deposits with interest
- **KYC Documents**: Identity verification documents
- **AI Interactions**: Chat history with BankBugger AI

## Next Steps

Once the database is set up, you can:

1. **Test Registration**: Create real user accounts
2. **Test Transactions**: Make deposits and transfers
3. **Add KYC**: Upload identity documents
4. **Create Cards**: Generate virtual cards
5. **Set up FDs**: Create fixed deposits

## Troubleshooting

### Common Issues:

1. **Connection refused**: Make sure PostgreSQL is running
2. **Authentication failed**: Check username/password in DATABASE_URL
3. **Database doesn't exist**: Create the database first
4. **Permission denied**: Grant proper privileges to the user

### Commands to check:

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Check database connection
psql -h localhost -U globalbank_user -d globalbank

# Reset database (if needed)
npx prisma migrate reset
``` 