import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

// Get all users for admin management
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const kycStatus = searchParams.get('kycStatus') || '';

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (kycStatus && kycStatus !== 'all') {
      where.kycStatus = kycStatus.toUpperCase();
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          kycStatus: true,
          createdAt: true,
          updatedAt: true,
          accounts: {
            select: {
              id: true,
              accountNumber: true,
              accountType: true,
              balance: true,
              status: true
            }
          },
          kycDocuments: {
            select: {
              id: true,
              documentType: true,
              status: true,
              uploadedAt: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accounts: user.accounts,
        kycDocuments: user.kycDocuments
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 