import { NextRequest, NextResponse } from 'next/server';
import { blockIfProductionDisabled } from '@/lib/regulatory/production-guard';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { auditAdminAction } from '@/lib/regulatory/audit-log';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  const blocked = blockIfProductionDisabled();
  if (blocked) return blocked;

  try {
    const admin = (request as any).admin;
    const { email, kycStatus, notes } = await request.json();

    if (!email || !kycStatus) {
      return NextResponse.json({ error: 'Email and KYC status are required' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(kycStatus)) {
      return NextResponse.json({ error: 'Invalid KYC status' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        kycStatus: kycStatus as any,
        emailVerified: kycStatus === 'VERIFIED',
        emailVerifiedAt: kycStatus === 'VERIFIED' ? new Date() : null,
      },
      include: { accounts: true },
    });

    await auditAdminAction(
      request,
      admin,
      'KYC_STATUS_UPDATE',
      'User',
      updatedUser.id,
      { kycStatus: existing.kycStatus },
      { kycStatus: updatedUser.kycStatus, notes }
    );

    return NextResponse.json({
      message: 'KYC status updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        kycStatus: updatedUser.kycStatus,
      },
    });
  } catch (error) {
    console.error('KYC status update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
