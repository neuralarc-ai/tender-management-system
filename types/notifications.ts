export interface Notification {
  id: string;
  type: 'tender_created' | 'proposal_submitted' | 'proposal_accepted' | 'proposal_rejected' | 'tender_updated';
  title: string;
  message: string;
  tenderId: string;
  createdAt: string;
  readBy: string[]; // Array of user roles who have read this
  createdBy: string; // admin or client
  targetRoles: string[]; // which roles should see this notification
}

export interface NotificationData {
  notifications: Notification[];
}

