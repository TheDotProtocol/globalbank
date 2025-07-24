import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    console.log('🔍 Creating Saleena Thamani transfers...');

    // Find Saleena Thamani's account (0506118608)
    const saleenaAccount = await prisma.account.findFirst({
      where: { accountNumber: '0506118608' },
      include: { user: true }
    });

    if (!saleenaAccount) {
      return NextResponse.json(
        { error: 'Saleena Thamani account not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found Saleena account:', saleenaAccount.accountNumber);

    // Find destination accounts
    const account1 = await prisma.account.findFirst({
      where: { accountNumber: '0506110982' },
      include: { user: true }
    });

    const account2 = await prisma.account.findFirst({
      where: { accountNumber: '0506113754' },
      include: { user: true }
    });

    if (!account1) {
      return NextResponse.json(
        { error: 'Destination account 0506110982 not found' },
        { status: 404 }
      );
    }

    if (!account2) {
      return NextResponse.json(
        { error: 'Destination account 0506113754 not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found destination accounts');

    const transferAmount = 100;
    const transferFee = 0;
    const netAmount = transferAmount - transferFee;

    // Check if Saleena has sufficient balance
    if (Number(saleenaAccount.balance) < (transferAmount * 2)) {
      return NextResponse.json(
        { error: 'Insufficient balance in Saleena account' },
        { status: 400 }
      );
    }

    // Create first transfer: 0506118608 to 0506110982
    const transfer1 = await prisma.transaction.create({
      data: {
        userId: saleenaAccount.userId,
        accountId: saleenaAccount.id,
        type: 'TRANSFER',
        amount: transferAmount,
        description: `Transfer from Saleena Thamani to ${account1.user.firstName} ${account1.user.lastName}`,
        status: 'COMPLETED',
        reference: `TRANSFER-${Date.now()}-1`,
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountHolder: `${saleenaAccount.user.firstName} ${saleenaAccount.user.lastName}`,
        destinationAccountHolder: `${account1.user.firstName} ${account1.user.lastName}`,
        transferFee: transferFee,
        netAmount: netAmount
      }
    });

    // Create second transfer: 0506118608 to 0506113754
    const transfer2 = await prisma.transaction.create({
      data: {
        userId: saleenaAccount.userId,
        accountId: saleenaAccount.id,
        type: 'TRANSFER',
        amount: transferAmount,
        description: `Transfer from Saleena Thamani to ${account2.user.firstName} ${account2.user.lastName}`,
        status: 'COMPLETED',
        reference: `TRANSFER-${Date.now()}-2`,
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountHolder: `${saleenaAccount.user.firstName} ${saleenaAccount.user.lastName}`,
        destinationAccountHolder: `${account2.user.firstName} ${account2.user.lastName}`,
        transferFee: transferFee,
        netAmount: netAmount
      }
    });

    // Update Saleena's account balance (deduct both transfers)
    await prisma.account.update({
      where: { id: saleenaAccount.id },
      data: {
        balance: {
          decrement: transferAmount * 2
        }
      }
    });

    // Update destination account 1 balance
    await prisma.account.update({
      where: { id: account1.id },
      data: {
        balance: {
          increment: netAmount
        }
      }
    });

    // Update destination account 2 balance
    await prisma.account.update({
      where: { id: account2.id },
      data: {
        balance: {
          increment: netAmount
        }
      }
    });

    console.log('✅ Transfers created successfully');

    return NextResponse.json({
      success: true,
      message: 'Transfers created successfully',
      transfers: [
        {
          id: transfer1.id,
          from: saleenaAccount.accountNumber,
          to: account1.accountNumber,
          amount: transferAmount,
          description: transfer1.description
        },
        {
          id: transfer2.id,
          from: saleenaAccount.accountNumber,
          to: account2.accountNumber,
          amount: transferAmount,
          description: transfer2.description
        }
      ]
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating transfers:', error);
    return NextResponse.json(
      { error: 'Failed to create transfers' },
      { status: 500 }
    );
  }
}); 