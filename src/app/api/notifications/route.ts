import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { notificationManager } from '@/lib/notifications';

// SSE endpoint for real-time notifications
export const GET = requireAuth(async (request: NextRequest) => {
  const user = (request as any).user;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(new TextEncoder().encode('data: {"type":"connected"}\n\n'));

      // Add client to notification manager
      notificationManager.addClient(user.id, controller);

      // Send existing notifications
      const notifications = notificationManager.getNotifications(user.id);
      notifications.forEach(notification => {
        const message = `data: ${JSON.stringify(notification)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        notificationManager.removeClient(user.id, controller);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
});

// Mark notification as read
export const PUT = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { notificationId, markAll } = await request.json();

    if (markAll) {
      notificationManager.markAllAsRead(user.id);
    } else if (notificationId) {
      notificationManager.markAsRead(user.id, notificationId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 