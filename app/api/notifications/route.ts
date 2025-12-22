import { NextResponse } from 'next/server';
import { supabaseNotificationService } from '@/lib/supabaseNotificationService';

/**
 * GET /api/notifications
 * Fetch notifications for a specific role from database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    
    if (!role) {
      return NextResponse.json({ error: 'Role parameter is required' }, { status: 400 });
    }

    const notifications = await supabaseNotificationService.getAllByRole(role);
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read in database
 */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    
    if (!role) {
      return NextResponse.json({ error: 'Role parameter is required' }, { status: 400 });
    }

    if (action === 'mark-all-read') {
      await supabaseNotificationService.markAllAsRead(role);
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { notificationId } = body;
    
    if (notificationId) {
      await supabaseNotificationService.markAsRead(notificationId, role);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
}
