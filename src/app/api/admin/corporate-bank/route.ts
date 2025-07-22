import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

// Get all corporate bank accounts
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get corporate banks with pagination
    const [banks, totalCount] = await Promise.all([
      prisma.corporateBank.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bankTransfers: true
            }
          }
        }
      }),
      prisma.corporateBank.count()
    ]);

    return NextResponse.json({
      banks: banks.map(bank => ({
        id: bank.id,
        bankName: bank.bankName,
        accountHolderName: bank.accountHolderName,
        accountNumber: bank.accountNumber,
        routingNumber: bank.routingNumber,
        swiftCode: bank.swiftCode,
        iban: bank.iban,
        branchCode: bank.branchCode,
        accountType: bank.accountType,
        currency: bank.currency,
        isActive: bank.isActive,
        dailyLimit: bank.dailyLimit,
        monthlyLimit: bank.monthlyLimit,
        transferFee: bank.transferFee,
        apiEnabled: bank.apiEnabled,
        createdAt: bank.createdAt,
        updatedAt: bank.updatedAt,
        transferCount: bank._count.bankTransfers
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin corporate bank error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      routingNumber,
      swiftCode,
      iban,
      branchCode,
      accountType = 'BUSINESS',
      currency = 'USD',
      dailyLimit = 100000,
      monthlyLimit = 1000000,
      transferFee = 0,
      apiEnabled = false,
      apiEndpoint,
      apiKey,
      webhookUrl
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
          routingNumber,
          swiftCode,
          iban,
          branchCode,
          accountType,
          currency,
          dailyLimit: parseFloat(dailyLimit),
          monthlyLimit: parseFloat(monthlyLimit),
          transferFee: parseFloat(transferFee),
          apiEnabled,
          apiEndpoint,
          apiKey,
          webhookUrl
        }
      });
    } else {
      // Create new bank
      bank = await prisma.corporateBank.create({
        data: {
          bankName,
          accountHolderName,
          accountNumber,
          routingNumber,
          swiftCode,
          iban,
          branchCode,
          accountType,
          currency,
          dailyLimit: parseFloat(dailyLimit),
          monthlyLimit: parseFloat(monthlyLimit),
          transferFee: parseFloat(transferFee),
          apiEnabled,
          apiEndpoint,
          apiKey,
          webhookUrl
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
        routingNumber: bank.routingNumber,
        swiftCode: bank.swiftCode,
        iban: bank.iban,
        branchCode: bank.branchCode,
        accountType: bank.accountType,
        currency: bank.currency,
        isActive: bank.isActive,
        dailyLimit: bank.dailyLimit,
        monthlyLimit: bank.monthlyLimit,
        transferFee: bank.transferFee,
        apiEnabled: bank.apiEnabled,
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