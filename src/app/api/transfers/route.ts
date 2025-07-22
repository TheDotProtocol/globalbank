import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { 
      fromAccountId, 
      toAccountNumber, 
      toAccountName, 
      amount, 
      currency = 'USD',
      transferType = 'INTERNAL', // INTERNAL, EXTERNAL, INTERNATIONAL
      description = '',
      recipientBank = null,
      recipientPhone = null
    } = await request.json();

    console.log('🔍 Transfer request from user:', user.email);

    // Validate required fields
    if (!fromAccountId || !toAccountNumber || !amount) {
      return NextResponse.json(
        { error: 'From account, to account number, and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer amount' },
        { status: 400 }
      );
    }

    // Get source account and verify ownership
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: user.id
      }
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found or access denied' },
        { status: 404 }
      );
    }

    // Check sufficient balance
    const currentBalance = parseFloat(sourceAccount.balance.toString());
    if (currentBalance < transferAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance in source account' },
        { status: 400 }
      );
    }

    // Calculate transfer fee based on type
    let transferFee = 0;
    if (transferType === 'EXTERNAL') {
      transferFee = 2.00; // $2 for external transfers
    } else if (transferType === 'INTERNATIONAL') {
      transferFee = transferAmount * 0.015; // 1.5% for international
    }

    const totalDebit = transferAmount + transferFee;
    if (currentBalance < totalDebit) {
      return NextResponse.json(
        { error: `Insufficient balance. Need $${totalDebit.toFixed(2)} (amount + fee)` },
        { status: 400 }
      );
    }

    // Generate unique transfer ID
    const transferId = `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update source account balance
      const updatedSourceAccount = await tx.account.update({
        where: { id: fromAccountId },
        data: {
          balance: (currentBalance - totalDebit).toString()
        }
      });

      // Create transaction record for source account (debit)
      const sourceTransaction = await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          userId: user.id,
          type: 'TRANSFER',
          amount: totalDebit.toString(),
          description: `Transfer to ${toAccountNumber}${description ? ` - ${description}` : ''}`,
          reference: transferId,
          transferMode: transferType === 'INTERNAL' ? 'INTERNAL_TRANSFER' : 
                       transferType === 'EXTERNAL' ? 'EXTERNAL_TRANSFER' : 'INTERNATIONAL_TRANSFER',
          sourceAccountNumber: sourceAccount.accountNumber,
          destinationAccountNumber: toAccountNumber,
          sourceAccountHolder: `${user.firstName} ${user.lastName}`,
          destinationAccountHolder: toAccountName || 'Unknown',
          transferFee: transferFee.toString(),
          status: 'COMPLETED'
        }
      });

      // For internal transfers, update destination account immediately
      if (transferType === 'INTERNAL') {
        const destinationAccount = await tx.account.findFirst({
          where: { accountNumber: toAccountNumber }
        });

        if (destinationAccount) {
          const destBalance = parseFloat(destinationAccount.balance.toString());
          const newDestBalance = destBalance + transferAmount;

          await tx.account.update({
            where: { id: destinationAccount.id },
            data: { balance: newDestBalance.toString() }
          });

          // Create transaction record for destination account (credit)
          await tx.transaction.create({
            data: {
              accountId: destinationAccount.id,
              userId: destinationAccount.userId,
              type: 'TRANSFER',
              amount: transferAmount.toString(),
              description: `Transfer from ${sourceAccount.accountNumber}${description ? ` - ${description}` : ''}`,
              reference: transferId,
              transferMode: 'INTERNAL_TRANSFER',
              sourceAccountNumber: sourceAccount.accountNumber,
              destinationAccountNumber: toAccountNumber,
              sourceAccountHolder: `${user.firstName} ${user.lastName}`,
              destinationAccountHolder: toAccountName || 'Unknown',
              transferFee: '0',
              status: 'COMPLETED'
            }
          });
        } else {
          // Destination account not found - mark as failed
          await tx.transaction.update({
            where: { id: sourceTransaction.id },
            data: { 
              status: 'FAILED',
              description: `Transfer failed - destination account ${toAccountNumber} not found`
            }
          });
        }
      }

      return { sourceTransaction };
    });

    console.log('✅ Transfer completed:', transferId);

    return NextResponse.json({
      success: true,
      message: transferType === 'INTERNAL' ? 'Transfer completed successfully' : 'Transfer initiated successfully',
      transfer: {
        id: result.sourceTransaction.id,
        amount: result.sourceTransaction.amount,
        fee: result.sourceTransaction.transferFee,
        status: result.sourceTransaction.status,
        reference: result.sourceTransaction.id
      }
    });

  } catch (error: any) {
    console.error('❌ Transfer error:', error);
    return NextResponse.json(
      { 
        error: 'Transfer failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 Fetching transfers for user:', user.email);

    const transfers = await prisma.transaction.findMany({
      where: { 
        userId: user.id,
        type: 'TRANSFER'
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      }
    });

    const totalCount = await prisma.transaction.count({
      where: { 
        userId: user.id,
        type: 'TRANSFER'
      }
    });

    return NextResponse.json({
      success: true,
      transfers: transfers.map(transfer => ({
        id: transfer.id,
        fromAccount: transfer.sourceAccountNumber || transfer.account.accountNumber,
        toAccount: transfer.destinationAccountNumber,
        toAccountName: transfer.destinationAccountHolder,
        amount: transfer.amount,
        currency: 'USD',
        transferType: transfer.transferMode === 'INTERNAL_TRANSFER' ? 'INTERNAL' :
                     transfer.transferMode === 'EXTERNAL_TRANSFER' ? 'EXTERNAL' : 'INTERNATIONAL',
        status: transfer.status,
        description: transfer.description,
        transferFee: transfer.transferFee,
        createdAt: transfer.createdAt
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching transfers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transfers', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 