import api from './api';

export interface VendorNotification {
  _id: string;
  title: string;
  message: string;
  targetType: 'all' | 'vendors' | 'specific';
  createdAt: string;
  sentAt: string | null;
  unread: boolean;
}

export interface NotificationsResponse {
  items: VendorNotification[];
  unreadCount: number;
  total: number;
}

export const fetchNotifications = async (): Promise<NotificationsResponse> => {
  const {data} = await api.get('/vendor/auth/notifications');
  return {
    items: data.data as VendorNotification[],
    unreadCount: data.meta?.unreadCount ?? 0,
    total: data.meta?.total ?? 0,
  };
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const {data} = await api.get('/vendor/auth/notifications/unread-count');
  return (data?.data?.unreadCount as number) ?? 0;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/vendor/auth/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/vendor/auth/notifications/read-all');
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/vendor/auth/notifications/${id}`);
};

export interface HelpSettings {
  address: string | null;
  mobile: string | null;
  email: string | null;
  whatsappNumber: string | null;
}

export const fetchHelpSettings = async (): Promise<HelpSettings> => {
  const {data} = await api.get('/vendor/auth/help-settings');
  return data.data as HelpSettings;
};

export interface CreateSupportTicketPayload {
  issueType?: string;
  description: string;
}

export interface SupportTicketReply {
  by: 'admin' | 'customer';
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketCode: string;
  issueType?: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  replies?: SupportTicketReply[];
}

export const createSupportTicket = async (
  payload: CreateSupportTicketPayload,
): Promise<SupportTicket> => {
  const {data} = await api.post('/vendor/auth/support', payload);
  return data.data as SupportTicket;
};

export const fetchSupportTickets = async (): Promise<SupportTicket[]> => {
  const {data} = await api.get('/vendor/auth/support');
  return (data?.data ?? []) as SupportTicket[];
};
