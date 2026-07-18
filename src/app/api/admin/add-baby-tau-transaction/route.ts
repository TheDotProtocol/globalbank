import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin, blockDemoInProduction } from '@/lib/admin-auth';

export const POST = requireSuperAdmin(async (request: NextRequest) => {
  const blocked = blockDemoInProduction();
  if (blocked) return blocked;
  try {
    console.log('💰 Adding transaction for Easaan Arun Kumar account...');
    
    // Find Easaan Arun Kumar user by email
    const user = await prisma.user.findUnique({
      where: { email: 'babyaccount@globaldotbank.org' }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Easaan Arun Kumar user not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    
    // Find Easaan Arun Kumar's account
    const account = await prisma.account.findFirst({
      where: { userId: user.id }
    });
    
    if (!account) {
      return NextResponse.json(
        { error: 'Easaan Arun Kumar account not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Found account: ${account.accountNumber}`);
    console.log(`   Current balance: $${account.balance}`);
    
    // Create yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(14, 30, 0, 0); // Set to 2:30 PM yesterday
    
    // Use database transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: 'CREDIT',
          amount: 250000,
          description: 'AR Holdings Group Corporation - Daddy\'s gift',
          status: 'COMPLETED',
          reference: `AR-HOLDINGS-GIFT-${Date.now()}`,
          createdAt: yesterday,
          updatedAt: yesterday,
          transferMode: 'EXTERNAL_TRANSFER',
          sourceAccountHolder: 'AR Holdings Group Corporation',
          destinationAccountHolder: `${user.firstName} ${user.lastName}`,
          transferFee: 0,
          netAmount: 250000
        }
      });
      
      // Update account balance
      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: {
            increment: 250000
          }
        }
      });
      
      return transaction;
    });
    
    // Verify the update
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    console.log(`✅ Created transaction: ${result.id}`);
    console.log(`✅ Updated balance: $${updatedAccount?.balance}`);
    console.log('🎉 Transaction added successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Transaction added successfully',
      transaction: {
        id: result.id,
        amount: result.amount,
        description: result.description,
        createdAt: result.createdAt
      },
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        newBalance: updatedAccount?.balance
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    );
  }
}); 