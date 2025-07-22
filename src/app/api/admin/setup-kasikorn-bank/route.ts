import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    
    console.log('🏦 Setting up Kasikorn Bank corporate account...');

    // Check if Kasikorn Bank already exists
    const existingBank = await prisma.corporateBank.findUnique({
      where: { accountNumber: '198-1-64757-9' }
    });

    if (existingBank) {
      console.log('✅ Kasikorn Bank already exists, updating...');
      
      const updatedBank = await prisma.corporateBank.update({
        where: { accountNumber: '198-1-64757-9' },
        data: {
          bankName: 'Kasikorn Bank',
          accountHolderName: 'The Dotprotocol Co ., Ltd',
          swiftCode: 'KASITHBK',
          accountType: 'CURRENT',
          currency: 'THB',
          isActive: true,
          dailyLimit: 1000000,  // 1M THB daily limit
          monthlyLimit: 10000000, // 10M THB monthly limit
          transferFee: 0,        // No transfer fee
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Kasikorn Bank updated successfully',
        bank: {
          id: updatedBank.id,
          bankName: updatedBank.bankName,
          accountHolderName: updatedBank.accountHolderName,
          accountNumber: updatedBank.accountNumber,
          swiftCode: updatedBank.swiftCode,
          accountType: updatedBank.accountType,
          currency: updatedBank.currency,
          isActive: updatedBank.isActive,
          dailyLimit: updatedBank.dailyLimit,
          monthlyLimit: updatedBank.monthlyLimit,
          transferFee: updatedBank.transferFee
        }
      });
    }

    // Create new Kasikorn Bank account
    console.log('🆕 Creating new Kasikorn Bank account...');
    
    const newBank = await prisma.corporateBank.create({
      data: {
        id: 'kasikorn_bank_001',
        bankName: 'Kasikorn Bank',
        accountHolderName: 'The Dotprotocol Co ., Ltd',
        accountNumber: '198-1-64757-9',
        swiftCode: 'KASITHBK',
        accountType: 'CURRENT',
        currency: 'THB',
        isActive: true,
        dailyLimit: 1000000,  // 1M THB daily limit
        monthlyLimit: 10000000, // 10M THB monthly limit
        transferFee: 0,        // No transfer fee
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Kasikorn Bank created successfully');

    return NextResponse.json({
      success: true,
      message: 'Kasikorn Bank created successfully',
      bank: {
        id: newBank.id,
        bankName: newBank.bankName,
        accountHolderName: newBank.accountHolderName,
        accountNumber: newBank.accountNumber,
        swiftCode: newBank.swiftCode,
        accountType: newBank.accountType,
        currency: newBank.currency,
        isActive: newBank.isActive,
        dailyLimit: newBank.dailyLimit,
        monthlyLimit: newBank.monthlyLimit,
        transferFee: newBank.transferFee
      }
    });

  } catch (error: any) {
    console.error('❌ Error setting up Kasikorn Bank:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set up Kasikorn Bank', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 