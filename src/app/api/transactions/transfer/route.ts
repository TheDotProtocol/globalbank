import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { generateTransferReference, generateUTR } from '@/lib/reference-generator';
import { preTransferComplianceCheck } from '@/lib/regulatory/compliance-guard';
import { postInternalTransferJournal } from '@/lib/regulatory/post-journal';
import { auditUserAction } from '@/lib/regulatory/audit-log';
import { applyComplianceFlags } from '@/lib/compliance-detector';
import { maybeFileCtr } from '@/lib/aml/ctr';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = await request.json();
    const user = (request as any).user;

    if (!fromAccountId || !toAccountNumber || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transfer parameters' }, { status: 400 });
    }

    const compliance = await preTransferComplianceCheck({
      userId: user.id,
      amount: Number(amount),
      type: 'DEBIT',
      transferMode: 'INTERNAL_TRANSFER',
      description,
    });

    if (compliance.blockTransfer) {
      await auditUserAction(request, user, 'TRANSFER_BLOCKED', 'Transaction', null, {
        reason: compliance.reason,
        amount,
        transferMode: 'INTERNAL_TRANSFER',
        sanctionsHit: compliance.sanctionsHit,
      });
      return NextResponse.json(
        {
          error: 'Transfer blocked by compliance controls',
          code: compliance.sanctionsHit ? 'SANCTIONS_BLOCK' : 'COMPLIANCE_BLOCK',
          reason: compliance.reason,
        },
        { status: 403 }
      );
    }

    const sourceAccount = await prisma.account.findFirst({
      where: { id: fromAccountId, userId: user.id, isActive: true },
    });

    if (!sourceAccount) {
      return NextResponse.json({ error: 'Source account not found or access denied' }, { status: 404 });
    }

    const destinationAccount = await prisma.account.findFirst({
      where: { accountNumber: toAccountNumber, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!destinationAccount) {
      return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });
    }

    const available =
      Number(sourceAccount.balance) - Number(sourceAccount.holdAmount ?? 0);
    if (available < amount) {
      return NextResponse.json({ error: 'Insufficient available balance' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { branchId: true },
    });

    const transferRef = generateTransferReference();
    const debitUtr = generateUTR();
    const creditUtr = generateUTR();

    const transferResult = await prisma.$transaction(async (tx) => {
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          userId: user.id,
          type: 'DEBIT',
          amount,
          description: `Transfer to ${destinationAccount.accountNumber} - ${description || 'Internal Transfer'}`,
          reference: transferRef,
          utr: debitUtr,
          status: 'COMPLETED',
          transferMode: 'INTERNAL_TRANSFER',
          sourceAccountNumber: sourceAccount.accountNumber,
          sourceAccountHolder: `${user.firstName} ${user.lastName}`,
          destinationAccountNumber: destinationAccount.accountNumber,
          destinationAccountHolder: `${destinationAccount.user.firstName} ${destinationAccount.user.lastName}`,
          netAmount: amount,
          branchId: dbUser?.branchId,
          complianceStatus: compliance.shouldFlag ? 'FLAGGED' : 'CLEAR',
          complianceFlag: compliance.shouldFlag ? ('MANUAL_FLAG' as any) : null,
          flagReason: compliance.reason ?? null,
          flaggedAt: compliance.shouldFlag ? new Date() : null,
          flaggedBy: compliance.shouldFlag ? 'SYSTEM' : null,
          riskScore: compliance.riskScore,
        },
      });

      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: destinationAccount.id,
          userId: destinationAccount.userId,
          type: 'CREDIT',
          amount,
          description: `Transfer from ${sourceAccount.accountNumber} - ${description || 'Internal Transfer'}`,
          reference: transferRef,
          utr: creditUtr,
          status: 'COMPLETED',
          transferMode: 'INTERNAL_TRANSFER',
          sourceAccountNumber: sourceAccount.accountNumber,
          sourceAccountHolder: `${user.firstName} ${user.lastName}`,
          destinationAccountNumber: destinationAccount.accountNumber,
          destinationAccountHolder: `${destinationAccount.user.firstName} ${destinationAccount.user.lastName}`,
          netAmount: amount,
          branchId: dbUser?.branchId,
        },
      });

      return { debitTransaction, creditTransaction, transferRef };
    });

    await postInternalTransferJournal({
      fromAccountId,
      toAccountId: destinationAccount.id,
      amount: Number(amount),
      reference: transferResult.transferRef,
      transactionId: transferResult.debitTransaction.id,
      createdBy: user.id,
      currency: sourceAccount.currency,
    });

    await maybeFileCtr({
      userId: user.id,
      transactionId: transferResult.debitTransaction.id,
      amount: Number(amount),
      currency: sourceAccount.currency,
    });

    if (compliance.shouldFlag) {
      await applyComplianceFlags(transferResult.debitTransaction.id);
    }

    await auditUserAction(
      request,
      user,
      'INTERNAL_TRANSFER',
      'Transaction',
      transferResult.debitTransaction.id,
      {
        amount,
        reference: transferResult.transferRef,
        utr: transferResult.debitTransaction.utr,
        complianceFlagged: compliance.shouldFlag,
        amlCaseId: compliance.amlCaseId,
      }
    );

    return NextResponse.json({
      success: true,
      message: compliance.shouldFlag
        ? 'Transfer completed — flagged for compliance review'
        : 'Transfer completed successfully',
      complianceReview: compliance.shouldFlag,
      transfer: {
        fromAccount: sourceAccount.accountNumber,
        toAccount: destinationAccount.accountNumber,
        amount,
        utr: transferResult.debitTransaction.utr,
        description: description || 'Internal Transfer',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Transfer failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});
