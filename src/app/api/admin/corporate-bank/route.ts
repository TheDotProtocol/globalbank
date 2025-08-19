import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    console.log('🏦 Fetching corporate bank data...');

    // Fetch corporate banks with transfer counts
    const corporateBanks = await prisma.corporateBank.findMany({
      select: {
        id: true,
        bankName: true,
        accountHolderName: true,
        accountNumber: true,
        currency: true,
        isActive: true,
        transferFee: true,
        createdAt: true,
        _count: {
          select: {
            bankTransfers: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Found corporate banks:', corporateBanks.length);

    // Fetch all bank transfers
    const bankTransfers = await prisma.bankTransfer.findMany({
      select: {
        id: true,
        toAccountNumber: true,
        toAccountName: true,
        amount: true,
        currency: true,
        transferType: true,
        status: true,
        reference: true,
        description: true,
        fee: true,
        netAmount: true,
        processedAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Found bank transfers:', bankTransfers.length);

    // Calculate summary statistics
    const totalTransfers = bankTransfers.length;
    const totalAmount = bankTransfers.reduce((sum, transfer) => sum + Number(transfer.amount), 0);
    const totalFees = bankTransfers.reduce((sum, transfer) => sum + Number(transfer.fee), 0);
    const completedTransfers = bankTransfers.filter(t => t.status === 'COMPLETED').length;

    console.log('📊 Summary stats:');
    console.log('   Total transfers:', totalTransfers);
    console.log('   Total amount:', totalAmount);
    console.log('   Total fees:', totalFees);
    console.log('   Completed transfers:', completedTransfers);

    return NextResponse.json({
      success: true,
      corporateBanks,
      bankTransfers,
      summary: {
        totalTransfers,
        totalAmount,
        totalFees,
        completedTransfers,
        activeBanks: corporateBanks.filter(b => b.isActive).length
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching corporate bank data:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch corporate bank data', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

// Create or update corporate bank account
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const {
      id, // If provided, update existing bank
      bankName,
      accountHolderName,
      accountNumber,
      swiftCode,
      bicCode,
      accountType,
      currency,
      transferFee,
      apiEndpoint,
      apiKey
    } = await request.json();

    // Validate required fields
    if (!bankName || !accountHolderName || !accountNumber) {
      return NextResponse.json(
        { error: 'Bank name, account holder name, and account number are required' },
        { status: 400 }
      );
    }

    // Check if account number already exists (for new banks)
    if (!id) {
      const existingBank = await prisma.corporateBank.findUnique({
        where: { accountNumber }
      });

      if (existingBank) {
        return NextResponse.json(
          { error: 'Bank account number already exists' },
          { status: 400 }
        );
      }
    }

    let bank;
    if (id) {
      // Update existing bank
      bank = await prisma.corporateBank.update({
        where: { id },
        data: {
          bankName,
          accountHolderName,
          accountNumber,
          swiftCode,
          bicCode,
          accountType,
          currency,
          transferFee: parseFloat(transferFee),
          apiEndpoint,
          apiKey
        }
      });
    } else {
      // Create new bank
      bank = await prisma.corporateBank.create({
        data: {
          bankName,
          accountHolderName,
          accountNumber,
          swiftCode,
          bicCode,
          accountType,
          currency,
          transferFee: parseFloat(transferFee),
          apiEndpoint,
          apiKey
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: id ? 'Corporate bank updated successfully' : 'Corporate bank created successfully',
      bank: {
        id: bank.id,
        bankName: bank.bankName,
        accountHolderName: bank.accountHolderName,
        accountNumber: bank.accountNumber,
        swiftCode: bank.swiftCode,
        bicCode: bank.bicCode,
        accountType: bank.accountType,
        currency: bank.currency,
        isActive: bank.isActive,
        transferFee: bank.transferFee,
        createdAt: bank.createdAt,
        updatedAt: bank.updatedAt
      }
    });
  } catch (error) {
    console.error('Admin corporate bank create/update error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update corporate bank' },
      { status: 500 }
    );
  }
});

// Delete corporate bank account
export const DELETE = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { searchParams } = new URL(request.url);
    const bankId = searchParams.get('id');

    if (!bankId) {
      return NextResponse.json(
        { error: 'Bank ID is required' },
        { status: 400 }
      );
    }

    // Check if bank has any transfers
    const transferCount = await prisma.bankTransfer.count({
      where: { corporateBankId: bankId }
    });

    if (transferCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete bank with existing transfers. Deactivate instead.' },
        { status: 400 }
      );
    }

    await prisma.corporateBank.delete({
      where: { id: bankId }
    });

    return NextResponse.json({
      success: true,
      message: 'Corporate bank deleted successfully'
    });
  } catch (error) {
    console.error('Admin corporate bank delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete corporate bank' },
      { status: 500 }
    );
  }
}); 