import { supabase, createServiceClient } from './supabase';
import { Notification } from '@/types/notifications';

/**
 * Supabase-based Notification Service
 * Handles cross-panel real-time notifications
 */

export const supabaseNotificationService = {
  /**
   * Get all notifications for a role
   */
  async getAllByRole(role: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .contains('target_roles', [role])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.transformNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications for a role
   */
  async getUnreadByRole(role: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .contains('target_roles', [role])
        .not('read_by', 'cs', `{${role}}`) // Not in read_by array
        .order('created_at', { ascending: false });

      if (error) throw error;
      return this.transformNotifications(data || []);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread count for badge
   */
  async getUnreadCount(role: string): Promise<number> {
    try {
      const serviceClient = createServiceClient();
      const { data, error } = await serviceClient.rpc('get_unread_count', {
        p_role: role
      });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  /**
   * Create a new notification
   */
  async create(notification: {
    type: string;
    title: string;
    message: string;
    tenderId: string;
    createdBy: string;
    targetRoles: string[];
  }): Promise<Notification> {
    try {
      const serviceClient = createServiceClient();
      
      const { data, error } = await serviceClient.rpc('create_notification', {
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_tender_id: notification.tenderId,
        p_created_by: notification.createdBy,
        p_target_roles: notification.targetRoles
      });

      if (error) throw error;

      // Fetch the created notification
      const { data: newNotification, error: fetchError } = await serviceClient
        .from('notifications')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;
      return this.transformNotifications([newNotification])[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, role: string): Promise<void> {
    try {
      const serviceClient = createServiceClient();
      
      await serviceClient.rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_role: role
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a role
   */
  async markAllAsRead(role: string): Promise<void> {
    try {
      const serviceClient = createServiceClient();
      
      // Get all unread notifications for this role
      const { data: notifications, error: fetchError } = await serviceClient
        .from('notifications')
        .select('id')
        .contains('target_roles', [role])
        .not('read_by', 'cs', `{${role}}`);

      if (fetchError) throw fetchError;

      // Mark each as read
      if (notifications && notifications.length > 0) {
        for (const notification of notifications) {
          await serviceClient.rpc('mark_notification_read', {
            p_notification_id: notification.id,
            p_role: role
          });
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  /**
   * Transform database format to frontend format
   */
  transformNotifications(data: any[]): Notification[] {
    return data.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      tenderId: item.tender_id,
      createdAt: item.created_at,
      readBy: item.read_by || [],
      createdBy: item.created_by,
      targetRoles: item.target_roles || []
    }));
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(role: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `${role}=ANY(target_roles)`
        },
        (payload) => {
          const notification = this.transformNotifications([payload.new])[0];
          callback(notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

