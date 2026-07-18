import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    if (process.env.NODE_ENV === 'development') {
      return 'postgresql://postgres:password@localhost:5432/globalbank';
    }
    throw new Error('DATABASE_URL is not configured');
  }

  // Supabase session pooler allows ~15 connections — cap Prisma's pool to avoid EMAXCONNSESSION
  const url = new URL(raw);
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', '5');
  }
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '30');
  }
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: { url: getDatabaseUrl() },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  globalForPrisma.prisma = undefined;
};

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};
