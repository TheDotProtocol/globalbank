import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Database connection configuration with fallback
const getDatabaseUrl = (): string => {
  // Only run on server side
  if (typeof window !== 'undefined') {
    throw new Error('Prisma client should only be used on the server side');
  }
  
  // Check for production database URL first
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Fallback to local development database
  if (process.env.NODE_ENV === 'development') {
    return 'postgresql://postgres:password@localhost:5432/globalbank';
  }
  
  throw new Error('DATABASE_URL is not configured');
};

class PrismaClientSingleton {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    // Only run on server side
    if (typeof window !== 'undefined') {
      throw new Error('Prisma client should only be used on the server side');
    }
    
    if (!PrismaClientSingleton.instance) {
      try {
        const databaseUrl = getDatabaseUrl();
        
        PrismaClientSingleton.instance = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        });

        // Handle graceful shutdown
        if (process.env.NODE_ENV !== 'production') {
          global.__prisma = PrismaClientSingleton.instance;
        }
      } catch (error) {
        console.error('❌ Failed to create Prisma client:', error);
        throw error;
      }
    }

    return PrismaClientSingleton.instance;
  }

  static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = undefined as any;
    }
  }
}

// Export the singleton instance (server-side only)
export const prisma = typeof window === 'undefined' ? PrismaClientSingleton.getInstance() : null;

// Export disconnect function for cleanup
export const disconnectPrisma = () => PrismaClientSingleton.disconnect();

// Database connection test (server-side only)
export const testDatabaseConnection = async (): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    console.log('❌ Database connection test should only be run on server side');
    return false;
  }
  
  try {
    if (!prisma) {
      console.log('❌ Prisma client not available');
      return false;
    }
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}; 