import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userEmail, amount, description, transactionType = 'CREDIT' } = body;
    
    if (!userEmail || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Find user's account
    const account = await prisma.account.findFirst({
      where: { userId: user.id }
    });
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    // Create yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(14, 30, 0, 0); // Set to 2:30 PM yesterday
    
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        type: transactionType as any,
        amount: parseFloat(amount),
        description,
        status: 'COMPLETED',
        reference: `ADMIN-${Date.now()}`,
        createdAt: yesterday,
        updatedAt: yesterday,
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountHolder: 'AR Holdings Group Corporation',
        destinationAccountHolder: `${user.firstName} ${user.lastName}`,
        transferFee: 0,
        netAmount: parseFloat(amount)
      }
    });
    
    // Update account balance
    const balanceChange = transactionType === 'CREDIT' ? parseFloat(amount) : -parseFloat(amount);
    await prisma.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });
    
    // Get updated account
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });
    
    if (!updatedAccount) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated account' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt,
        reference: transaction.reference
      },
      account: {
        id: updatedAccount.id,
        accountNumber: updatedAccount.accountNumber,
        balance: updatedAccount.balance
      }
    });
    
  } catch (error) {
    console.error('Add transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    );
  }
}; 