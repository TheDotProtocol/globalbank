import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

class PrismaClientSingleton {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Handle graceful shutdown
      if (process.env.NODE_ENV !== 'production') {
        global.__prisma = PrismaClientSingleton.instance;
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

// Export the singleton instance
export const prisma = PrismaClientSingleton.getInstance();

// Export disconnect function for cleanup
export const disconnectPrisma = () => PrismaClientSingleton.disconnect(); 