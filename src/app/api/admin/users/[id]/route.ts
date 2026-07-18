import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const GET = requireAdminAuth(async (
  _request: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) => {
  try {
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }));

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        kycStatus: true,
        emailVerified: true,
        twoFactorEnabled: true,
        sumsubApplicantId: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            balance: true,
            currency: true,
            isActive: true,
            createdAt: true,
            cards: {
              select: {
                id: true,
                cardNumber: true,
                cardType: true,
                status: true,
                expiryDate: true,
                isVirtual: true,
                isActive: true,
                dailyLimit: true,
                monthlyLimit: true,
              },
            },
          },
        },
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            documentType: true,
            status: true,
            fileName: true,
            documentUrl: true,
            createdAt: true,
          },
        },
        fixedDeposits: {
          select: {
            id: true,
            amount: true,
            interestRate: true,
            duration: true,
            status: true,
            maturityDate: true,
          },
        },
        internationalTransfers: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            amount: true,
            beneficiaryName: true,
            status: true,
            utr: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const branch = user.branchId
      ? await prisma.branch.findUnique({
          where: { id: user.branchId },
          select: { id: true, name: true, country: true, city: true },
        })
      : null;

    const transactions = await prisma.transaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        reference: true,
        utr: true,
        status: true,
        complianceStatus: true,
        complianceFlag: true,
        flagReason: true,
        riskScore: true,
        transferMode: true,
        sourceAccountNumber: true,
        destinationAccountNumber: true,
        createdAt: true,
        branchId: true,
      },
    });

    const flaggedCount = await prisma.transaction.count({
      where: {
        userId: id,
        complianceStatus: { in: ['FLAGGED', 'UNDER_REVIEW', 'ON_HOLD', 'REPORTED'] },
      },
    });

    const totalBalance = user.accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        sumsubApplicantId: user.sumsubApplicantId,
        createdAt: user.createdAt,
        branch,
        totalBalance,
        flaggedTransactionCount: flaggedCount,
      },
      accounts: user.accounts.map((a) => ({
        ...a,
        balance: Number(a.balance),
        cards: a.cards.map((c) => ({
          ...c,
          cardNumber: c.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim(),
          dailyLimit: Number(c.dailyLimit),
          monthlyLimit: Number(c.monthlyLimit),
        })),
      })),
      transactions: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      kycDocuments: user.kycDocuments,
      fixedDeposits: user.fixedDeposits.map((fd) => ({ ...fd, amount: Number(fd.amount) })),
      internationalTransfers: user.internationalTransfers.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
    });
  } catch (error) {
    console.error('User detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

export const PATCH = requireAdminAuth(async (
  request: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) => {
  try {
    const admin = (request as any).admin;
    const { id } = await (context?.params ?? Promise.resolve({ id: '' }));
    const body = await request.json();
    const { branchId, email, firstName, lastName, phone, password, kycStatus } = body;

    const data: Record<string, unknown> = {};
    if (branchId !== undefined) data.branchId = branchId || null;
    if (email !== undefined) data.email = String(email).trim().toLowerCase();
    if (firstName !== undefined) data.firstName = String(firstName).trim();
    if (lastName !== undefined) data.lastName = String(lastName).trim();
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
    if (kycStatus !== undefined) data.kycStatus = String(kycStatus).toUpperCase();
    if (password) {
      if (String(password).length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
      }
      data.password = await bcrypt.hash(String(password), 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email as string, NOT: { id } },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        kycStatus: true,
        branchId: true,
      },
    });

    console.log(`Admin ${admin.email} updated user ${user.email}`);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});
