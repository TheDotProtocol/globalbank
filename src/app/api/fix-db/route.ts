import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing database issues via API...');
    
    // Fix the specific transaction that's causing the issue
    const result = await prisma.$executeRaw`
      UPDATE transactions 
      SET type = 'DEPOSIT', status = 'COMPLETED'
      WHERE type = 'Deposit - 0506118608'
    `;
    
    console.log(`Updated ${result} transaction(s)`);
    
    // Check if there are any other invalid transactions
    const invalidCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM transactions 
      WHERE type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')
         OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
    `;
    
    console.log(`Remaining invalid transactions: ${invalidCount[0].count}`);
    
    if (Number(invalidCount[0].count) > 0) {
      // Fix any remaining invalid transactions
      const fixResult = await prisma.$executeRaw`
        UPDATE transactions 
        SET 
          type = CASE 
            WHEN type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT') THEN 'CREDIT'
            ELSE type
          END,
          status = CASE 
            WHEN status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') THEN 'COMPLETED'
            ELSE status
          END
        WHERE type NOT IN ('CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT')
           OR status NOT IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
      `;
      
      console.log(`Fixed ${fixResult} additional transaction(s)`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database fixed successfully',
      updatedTransactions: result,
      remainingInvalid: Number(invalidCount[0].count)
    });
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 