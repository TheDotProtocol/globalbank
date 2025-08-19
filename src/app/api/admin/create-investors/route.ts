import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const POST = async (request: NextRequest) => {
  try {
    console.log('🚀 Creating investor accounts...');

    // Create first user: njmsweettie@gmail.com
    console.log('\n📧 Creating account for njmsweettie@gmail.com...');
    
    const hashedPassword1 = await bcrypt.hash('Saleena@132', 12);
    
    const user1 = await prisma.user.create({
      data: {
        email: 'njmsweettie@gmail.com',
        password: hashedPassword1,
        firstName: 'Saleena',
        lastName: 'Sweet',
        phone: '+1 555-0123',
        kycStatus: 'PENDING',
        emailVerified: true
      }
    });

    const account1 = await prisma.account.create({
      data: {
        userId: user1.id,
        accountNumber: `GB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        accountType: 'CHECKING',
        balance: 150001,
        currency: 'USD',
        isActive: true
      }
    });

    const card1 = await prisma.card.create({
      data: {
        userId: user1.id,
        accountId: account1.id,
        cardNumber: '4532123456789012',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: new Date('2028-12-31'),
        cvv: '123',
        isActive: true,
        dailyLimit: 5000,
        monthlyLimit: 50000
      }
    });

    const transaction1 = await prisma.transaction.create({
      data: {
        userId: user1.id,
        accountId: account1.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Singapore',
        status: 'COMPLETED',
        reference: 'AR-HOLDINGS-DEPOSIT',
        createdAt: new Date()
      }
    });

    // Create second user: babyaccount@globaldotbank.org
    console.log('\n👶 Creating account for babyaccount@globaldotbank.org...');
    
    const hashedPassword2 = await bcrypt.hash('Babytau@132', 12);
    
    const user2 = await prisma.user.create({
      data: {
        email: 'babyaccount@globaldotbank.org',
        password: hashedPassword2,
        firstName: 'Baby',
        lastName: 'Tau',
        phone: '+66 821763146',
        kycStatus: 'PENDING',
        emailVerified: true
      }
    });

    const account2 = await prisma.account.create({
      data: {
        userId: user2.id,
        accountNumber: `GB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        accountType: 'CHECKING',
        balance: 300000,
        currency: 'USD',
        isActive: true
      }
    });

    const card2 = await prisma.card.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        cardNumber: '4532987654321098',
        cardType: 'DEBIT',
        status: 'ACTIVE',
        expiryDate: new Date('2028-12-31'),
        cvv: '456',
        isActive: true,
        dailyLimit: 5000,
        monthlyLimit: 50000
      }
    });

    // Create transactions for baby account
    const transaction2a = await prisma.transaction.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from AR Holdings Group Corporation, Global HQ, USA - Daddy\'s first gift',
        status: 'COMPLETED',
        reference: 'DADDY-GIFT-1',
        createdAt: new Date('2025-07-19T12:45:00Z')
      }
    });

    const transaction2b = await prisma.transaction.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        type: 'CREDIT',
        amount: 150000,
        description: 'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy\'s first gift',
        status: 'COMPLETED',
        reference: 'MOMMY-GIFT-1',
        createdAt: new Date('2025-07-19T12:45:00Z')
      }
    });

    // Create fixed deposit for baby account
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + 18); // 18 years maturity

    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId: user2.id,
        accountId: account2.id,
        amount: 100000,
        interestRate: 5.5,
        duration: 216, // 18 years * 12 months
        maturityDate: maturityDate,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Investor accounts created successfully',
      accounts: [
        {
          user: {
            id: user1.id,
            email: user1.email,
            firstName: user1.firstName,
            lastName: user1.lastName,
            phone: user1.phone
          },
          account: {
            id: account1.id,
            accountNumber: account1.accountNumber,
            balance: account1.balance
          },
          card: {
            id: card1.id,
            cardNumber: maskCardNumber(card1.cardNumber),
            cardType: card1.cardType
          }
        },
        {
          user: {
            id: user2.id,
            email: user2.email,
            firstName: user2.firstName,
            lastName: user2.lastName,
            phone: user2.phone
          },
          account: {
            id: account2.id,
            accountNumber: account2.accountNumber,
            balance: account2.balance
          },
          card: {
            id: card2.id,
            cardNumber: maskCardNumber(card2.cardNumber),
            cardType: card2.cardType
          },
          fixedDeposit: {
            id: fixedDeposit.id,
            amount: fixedDeposit.amount,
            maturityDate: fixedDeposit.maturityDate
          }
        }
      ]
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating investor accounts:', error);
    return NextResponse.json(
      { error: 'Failed to create investor accounts' },
      { status: 500 }
    );
  }
};

function maskCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1 **** **** $3');
}
