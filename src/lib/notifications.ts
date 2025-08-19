import { NextRequest, NextResponse } from 'next/server';

interface Notification {
  id: string;
  userId: string;
  type: 'transaction' | 'security' | 'kyc' | 'card' | 'deposit' | 'general';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

class NotificationManager {
  private clients = new Map<string, Set<ReadableStreamDefaultController>>();
  private notifications = new Map<string, Notification[]>();

  addClient(userId: string, controller: ReadableStreamDefaultController) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(controller);
  }

  removeClient(userId: string, controller: ReadableStreamDefaultController) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(controller);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  async sendNotification(userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) {
    const fullNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.unshift(fullNotification);

    // Keep only last 50 notifications
    const userNotifications = this.notifications.get(userId)!;
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    // Send to connected clients
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = `data: ${JSON.stringify(fullNotification)}\n\n`;
      userClients.forEach(controller => {
        try {
          controller.enqueue(new TextEncoder().encode(message));
        } catch (error) {
          // Client disconnected
          this.removeClient(userId, controller);
        }
      });
    }
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications.get(userId) || [];
  }

  markAsRead(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  markAllAsRead(userId: string) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach(n => n.read = true);
    }
  }
}

export const notificationManager = new NotificationManager();

// Notification types
export const createTransactionNotification = (userId: string, transaction: any) => ({
  userId,
  type: 'transaction' as const,
  title: 'New Transaction',
  message: `${transaction.type} of $${transaction.amount} - ${transaction.description}`,
  data: transaction,
  read: false
});

export const createSecurityNotification = (userId: string, event: string) => ({
  userId,
  type: 'security' as const,
  title: 'Security Alert',
  message: event,
  read: false
});

export const createKycNotification = (userId: string, status: string) => ({
  userId,
  type: 'kyc' as const,
  title: 'KYC Update',
  message: `Your KYC verification status has been updated to ${status}`,
  data: { status },
  read: false
});

export const createCardNotification = (userId: string, cardType: string) => ({
  userId,
  type: 'card' as const,
  title: 'Card Generated',
  message: `Your ${cardType} card has been generated successfully`,
  data: { cardType },
  read: false
});

export const createDepositNotification = (userId: string, amount: number, duration: number) => ({
  userId,
  type: 'deposit' as const,
  title: 'Fixed Deposit Created',
  message: `Fixed deposit of $${amount} for ${duration} months created successfully`,
  data: { amount, duration },
  read: false
}); 