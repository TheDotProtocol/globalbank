import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { notificationManager } from '@/lib/notifications';
import { verifyToken } from '@/lib/jwt';

// Helper function to extract user from token
async function getUserFromToken(token: string) {
  try {
    const payload = verifyToken(token);
    if (!payload) return null;
    
    // You might want to verify user still exists in database here
    return { id: payload.userId, email: payload.email };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// SSE endpoint for real-time notifications
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if this is an SSE request (Accept header contains text/event-stream)
    const acceptHeader = request.headers.get('accept');
    const isSSERequest = acceptHeader?.includes('text/event-stream');

    if (isSSERequest) {
      // SSE response
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
    } else {
      // Regular fetch request - return notifications as JSON
      const notifications = notificationManager.getNotifications(user.id);
      return NextResponse.json({
        notifications: notifications,
        count: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length
      });
    }
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

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