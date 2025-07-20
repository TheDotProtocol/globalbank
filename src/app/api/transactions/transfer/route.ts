import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();
    
    const { 
      sourceAccountId, 
      destinationAccountNumber, 
      amount, 
      description,
      transferMode = 'INTERNAL_TRANSFER'
    } = body;
    
    if (!sourceAccountId || !destinationAccountNumber || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer amount' },
        { status: 400 }
      );
    }
    
    // Find source account and verify ownership
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: sourceAccountId,
        userId: user.id,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found' },
        { status: 404 }
      );
    }
    
    // Check if source account has sufficient balance
    if (sourceAccount.balance.toNumber() < transferAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }
    
    // Find destination account
    const destinationAccount = await prisma.account.findFirst({
      where: {
        accountNumber: destinationAccountNumber,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    if (!destinationAccount) {
      return NextResponse.json(
        { error: 'Destination account not found' },
        { status: 404 }
      );
    }
    
    // Prevent self-transfer
    if (sourceAccount.id === destinationAccount.id) {
      return NextResponse.json(
        { error: 'Cannot transfer to the same account' },
        { status: 400 }
      );
    }
    
    // Calculate transfer fee (1% for external transfers, 0% for internal)
    const transferFee = transferMode === 'INTERNAL_TRANSFER' ? 0 : transferAmount * 0.01;
    const netAmount = transferAmount - transferFee;
    
    // Use database transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create debit transaction for source account
      const debitTransaction = await tx.transaction.create({
        data: {
          userId: user.id,
          accountId: sourceAccount.id,
          type: 'DEBIT',
          amount: transferAmount,
          description: `Transfer to ${destinationAccount.accountNumber} - ${description}`,
          reference: `TXN-${Date.now()}-DEBIT`,
          status: 'COMPLETED',
          transferMode: transferMode as any,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destinationAccount.id,
          sourceAccountNumber: sourceAccount.accountNumber,
          destinationAccountNumber: destinationAccount.accountNumber,
          sourceAccountHolder: `${sourceAccount.user.firstName} ${sourceAccount.user.lastName}`,
          destinationAccountHolder: `${destinationAccount.user.firstName} ${destinationAccount.user.lastName}`,
          transferFee,
          netAmount
        }
      });
      
      // Create credit transaction for destination account
      const creditTransaction = await tx.transaction.create({
        data: {
          userId: destinationAccount.userId,
          accountId: destinationAccount.id,
          type: 'CREDIT',
          amount: netAmount,
          description: `Transfer from ${sourceAccount.accountNumber} - ${description}`,
          reference: `TXN-${Date.now()}-CREDIT`,
          status: 'COMPLETED',
          transferMode: transferMode as any,
          sourceAccountId: sourceAccount.id,
          destinationAccountId: destinationAccount.id,
          sourceAccountNumber: sourceAccount.accountNumber,
          destinationAccountNumber: destinationAccount.accountNumber,
          sourceAccountHolder: `${sourceAccount.user.firstName} ${sourceAccount.user.lastName}`,
          destinationAccountHolder: `${destinationAccount.user.firstName} ${destinationAccount.user.lastName}`,
          transferFee: 0, // No fee for recipient
          netAmount
        }
      });
      
      // Update source account balance
      await tx.account.update({
        where: { id: sourceAccount.id },
        data: {
          balance: {
            decrement: transferAmount
          }
        }
      });
      
      // Update destination account balance
      await tx.account.update({
        where: { id: destinationAccount.id },
        data: {
          balance: {
            increment: netAmount
          }
        }
      });
      
      return { debitTransaction, creditTransaction };
    });
    
    return NextResponse.json({
      success: true,
      transfer: {
        id: result.debitTransaction.id,
        amount: transferAmount,
        netAmount,
        transferFee,
        sourceAccount: {
          number: sourceAccount.accountNumber,
          holder: `${sourceAccount.user.firstName} ${sourceAccount.user.lastName}`
        },
        destinationAccount: {
          number: destinationAccount.accountNumber,
          holder: `${destinationAccount.user.firstName} ${destinationAccount.user.lastName}`
        },
        description,
        transferMode,
        status: 'COMPLETED',
        reference: result.debitTransaction.reference,
        createdAt: result.debitTransaction.createdAt
      }
    });
    
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Transfer failed' },
      { status: 500 }
    );
  }
}); 