import api from './api';

export interface DashboardStatCards {
  newOrders: number;
  inProgress: number;
  todayDispatch: number;
  pendingPayment: number;
}

export interface DashboardOperations {
  qcPending: number;
  readyForDispatch: number;
  inTransit: number;
  delayed: number;
}

export interface DashboardWeeklyPoint {
  date: string;
  orders: number;
}

export interface VendorDashboard {
  statCards: DashboardStatCards;
  operations: DashboardOperations;
  weeklyOrders: DashboardWeeklyPoint[];
  unreadNotifications: number;
}

export const fetchVendorDashboard = async (): Promise<VendorDashboard> => {
  const {data} = await api.get('/vendor/auth/dashboard');
  return data.data as VendorDashboard;
};
