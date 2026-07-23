import { NextRequest, NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { postLoanDisbursement } from '@/lib/regulatory/post-journal';
import { randomUUID } from 'crypto';

export const GET = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const status = request.nextUrl.searchParams.get('status');

    const applications = await prisma.loanApplication.findMany({
      where: status && status !== 'all' ? { status: status as any } : undefined,
      orderBy: { submittedAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, kycStatus: true } },
        product: true,
        account: { select: { accountNumber: true, currency: true } },
        loan: true,
      },
    });

    const loans = await prisma.loan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        product: true,
      },
    });

    return NextResponse.json({ success: true, applications, loans });
  } catch (error) {
    console.error('Lending admin read error:', error);
    return NextResponse.json({ error: 'Failed to load lending data' }, { status: 500 });
  }
});

export const POST = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const { applicationId, action, reviewNotes, reviewedBy } = await request.json();

    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      include: { product: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (action === 'reject') {
      const updated = await prisma.loanApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          reviewNotes,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, application: updated });
    }

    if (action !== 'approve') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const loanRef = `LN-${Date.now().toString(36).toUpperCase()}`;
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + application.termMonths);

    const loan = await prisma.$transaction(async (tx) => {
      await tx.loanApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewNotes,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });

      const created = await tx.loan.create({
        data: {
          reference: loanRef,
          applicationId,
          userId: application.userId,
          accountId: application.accountId,
          productId: application.productId,
          principal: application.requestedAmount,
          outstanding: application.requestedAmount,
          apr: application.product.baseApr,
          termMonths: application.termMonths,
          status: 'ACTIVE',
          disbursedAt: new Date(),
          maturityDate,
          provisionRate: 0.01,
        },
      });

      const monthlyRate = Number(application.product.baseApr) / 100 / 12;
      const principal = Number(application.requestedAmount);
      const payment =
        monthlyRate > 0
          ? (principal * monthlyRate * Math.pow(1 + monthlyRate, application.termMonths)) /
            (Math.pow(1 + monthlyRate, application.termMonths) - 1)
          : principal / application.termMonths;

      for (let i = 1; i <= application.termMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        const interestDue = principal * monthlyRate;
        const principalDue = payment - interestDue;
        await tx.loanSchedulePayment.create({
          data: {
            loanId: created.id,
            installmentNo: i,
            dueDate,
            principalDue,
            interestDue,
            totalDue: payment,
            status: 'SCHEDULED',
          },
        });
      }

      return created;
    });

    await postLoanDisbursement({
      accountId: application.accountId,
      loanId: loan.id,
      amount: Number(application.requestedAmount),
      reference: loanRef,
      createdBy: reviewedBy ?? 'ADMIN',
    });

    return NextResponse.json({ success: true, loan });
  } catch (error) {
    console.error('Lending admin action error:', error);
    return NextResponse.json(
      { error: 'Lending action failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
});
