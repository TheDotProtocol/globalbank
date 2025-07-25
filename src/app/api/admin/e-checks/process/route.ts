import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    
    console.log('🏦 Admin E-Check processing request from:', admin.email);

    // Get all signed checks that need processing
    const signedChecks = await prisma.eCheck.findMany({
      where: {
        status: 'SIGNED',
        signatureUrl: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            kycStatus: true
          }
        },
        account: {
          select: {
            id: true,
            accountNumber: true,
            balance: true
          }
        }
      }
    });

    console.log(`📋 Found ${signedChecks.length} signed checks to process`);

    const processedChecks = [];
    const failedChecks = [];

    for (const check of signedChecks) {
      try {
        // Check KYC status
        if (check.user.kycStatus !== 'VERIFIED') {
          console.log(`⚠️ Skipping check ${check.checkNumber} - KYC not verified for user ${check.user.email}`);
          failedChecks.push({
            checkId: check.id,
            checkNumber: check.checkNumber,
            reason: 'KYC not verified',
            userEmail: check.user.email
          });
          continue;
        }

        // Check sufficient balance
        const currentBalance = parseFloat(check.account.balance.toString());
        const checkAmount = parseFloat(check.amount.toString());
        
        if (currentBalance < checkAmount) {
          console.log(`⚠️ Skipping check ${check.checkNumber} - Insufficient balance`);
          failedChecks.push({
            checkId: check.id,
            checkNumber: check.checkNumber,
            reason: 'Insufficient balance',
            userEmail: check.user.email
          });
          continue;
        }

        // Process the check
        await prisma.$transaction(async (tx) => {
          // Update check status
          await tx.eCheck.update({
            where: { id: check.id },
            data: {
              status: 'CLEARED',
              clearedAt: new Date(),
              processedAt: new Date()
            }
          });

          // Deduct amount from account
          await tx.account.update({
            where: { id: check.accountId },
            data: {
              balance: {
                decrement: checkAmount
              }
            }
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              userId: check.userId,
              accountId: check.accountId,
              type: 'DEBIT',
              amount: checkAmount,
              description: `E-Check payment to ${check.payeeName}`,
              reference: `ECHECK-${check.checkNumber}`,
              status: 'COMPLETED',
              transferMode: 'EXTERNAL_TRANSFER'
            }
          });
        });

        processedChecks.push({
          checkId: check.id,
          checkNumber: check.checkNumber,
          amount: checkAmount,
          payeeName: check.payeeName,
          userEmail: check.user.email
        });

        console.log(`✅ Processed check ${check.checkNumber} for $${checkAmount}`);

      } catch (error) {
        console.error(`❌ Error processing check ${check.checkNumber}:`, error);
        failedChecks.push({
          checkId: check.id,
          checkNumber: check.checkNumber,
          reason: 'Processing error',
          userEmail: check.user.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ E-Check processing completed:`);
    console.log(`   - Processed: ${processedChecks.length}`);
    console.log(`   - Failed: ${failedChecks.length}`);

    return NextResponse.json({
      success: true,
      message: 'E-Check processing completed',
      summary: {
        totalChecks: signedChecks.length,
        processed: processedChecks.length,
        failed: failedChecks.length
      },
      processedChecks,
      failedChecks
    });

  } catch (error: any) {
    console.error('❌ Error in E-Check processing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process E-Checks', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    
    console.log('🔍 Admin E-Check status request from:', admin.email);

    // Get all checks with their status
    const checks = await prisma.eCheck.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            kycStatus: true
          }
        },
        account: {
          select: {
            accountNumber: true,
            balance: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const statusSummary = {
      pending: checks.filter(c => c.status === 'PENDING').length,
      signed: checks.filter(c => c.status === 'SIGNED').length,
      cleared: checks.filter(c => c.status === 'CLEARED').length,
      rejected: checks.filter(c => c.status === 'REJECTED').length,
      total: checks.length
    };

    return NextResponse.json({
      success: true,
      summary: statusSummary,
      checks: checks.map(check => ({
        id: check.id,
        checkNumber: check.checkNumber,
        payeeName: check.payeeName,
        amount: check.amount,
        currency: check.currency,
        status: check.status,
        signatureUrl: check.signatureUrl,
        clearedAt: check.clearedAt,
        processedAt: check.processedAt,
        createdAt: check.createdAt,
        user: check.user,
        account: check.account
      }))
    });

  } catch (error: any) {
    console.error('❌ Error getting E-Check status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get E-Check status', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 