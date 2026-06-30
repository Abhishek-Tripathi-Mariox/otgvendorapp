import api from './api';

export type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'QC Pending'
  | 'QC Approved'
  | 'Packed'
  | 'Dispatched'
  | 'Delivered';

export type OrderFilter = 'All Orders' | OrderStatus;

export interface VendorOrderCustomer {
  name: string;
  mobile: string;
}

export interface VendorOrder {
  id: string;
  _id: string;
  status: OrderStatus;
  rawStatus: string;
  category: string;
  quantity: string;
  quantityValue: number;
  unit: string;
  deliveryDate: string;
  location: string;
  materialName: string;
  materialImage: string | null;
  price: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
  customer: VendorOrderCustomer;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCounts {
  total: number;
  Pending: number;
  Accepted: number;
  Dispatched: number;
  Delivered: number;
  Cancelled: number;
}

export const fetchVendorOrders = async (
  filter: OrderFilter = 'All Orders',
): Promise<VendorOrder[]> => {
  const res = await api.get('/vendor/orders', {
    params: filter && filter !== 'All Orders' ? {status: filter} : undefined,
  });
  return (res.data?.data ?? []) as VendorOrder[];
};

export const fetchVendorOrder = async (id: string): Promise<VendorOrder> => {
  const res = await api.get(`/vendor/orders/${encodeURIComponent(id)}`);
  return res.data?.data as VendorOrder;
};

export const fetchVendorOrderCounts = async (): Promise<OrderCounts> => {
  const res = await api.get('/vendor/orders/summary/counts');
  return res.data?.data as OrderCounts;
};

export type PaymentStatus = 'Pending' | 'Completed';

export interface VendorPayment {
  orderId: string;
  payId: string;
  amount: number;
  orderDate: string;
  settlementDate: string | null;
  method: string | null;
  status: PaymentStatus;
}

export interface PaymentsSummary {
  pendingTotal: number;
  pendingCount: number;
  completedTotal: number;
  completedCount: number;
  totalRevenue: number;
}

export interface PaymentsResponse {
  data: VendorPayment[];
  summary: PaymentsSummary;
}

export const fetchVendorPayments = async (): Promise<PaymentsResponse> => {
  const res = await api.get('/vendor/orders/payments');
  return {
    data: (res.data?.data ?? []) as VendorPayment[],
    summary: (res.data?.summary ?? {
      pendingTotal: 0,
      pendingCount: 0,
      completedTotal: 0,
      completedCount: 0,
      totalRevenue: 0,
    }) as PaymentsSummary,
  };
};

export const updateVendorOrderStatus = async (
  id: string,
  action: 'accept' | 'reject',
  reason?: string,
): Promise<VendorOrder> => {
  const res = await api.patch(`/vendor/orders/${encodeURIComponent(id)}/status`, {
    action,
    reason,
  });
  return res.data?.data as VendorOrder;
};

export interface VendorInvoiceVendor {
  code: string | null;
  name: string;
  contactName: string;
  email: string | null;
  mobile: string;
  gstNumber: string | null;
  panNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

export interface VendorInvoiceCustomer {
  name: string;
  mobile: string | null;
  site: string | null;
}

export interface VendorInvoiceItem {
  materialName: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface VendorInvoiceTotals {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface VendorInvoice {
  invoiceNo: string;
  issuedAt: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  deliveryDate: string;
  vendor: VendorInvoiceVendor;
  customer: VendorInvoiceCustomer;
  item: VendorInvoiceItem;
  totals: VendorInvoiceTotals;
  notes: string | null;
}

export const fetchVendorInvoice = async (id: string): Promise<VendorInvoice> => {
  const res = await api.get(`/vendor/orders/${encodeURIComponent(id)}/invoice`);
  return res.data?.data as VendorInvoice;
};

export interface VendorOrderDispatch {
  driverName: string | null;
  vehicleNumber: string | null;
  dispatchDate: string | null;
  dispatchTime: string | null;
  dispatchedAt: string | null;
}

// The QC/pack/dispatch endpoints return the full booking. We keep the response
// loosely typed (VendorOrder + optional dispatch/driver) so screens can read the
// real assigned driver/vehicle without forcing a strict shape on the booking.
export interface VendorFulfilmentBooking extends VendorOrder {
  dispatch?: VendorOrderDispatch;
  driver?: string | null;
}

export interface SubmitVendorQcPayload {
  materialPhotos?: string[];
  packagingPhotos?: string[];
  note?: string;
}

export const submitVendorQc = async (
  id: string,
  payload: SubmitVendorQcPayload,
): Promise<VendorFulfilmentBooking> => {
  const res = await api.patch(
    `/vendor/orders/${encodeURIComponent(id)}/qc`,
    payload,
  );
  return res.data?.data as VendorFulfilmentBooking;
};

// Uploads one image (base64 data URI) to S3 and returns its public URL.
// Used for QC photos and vendor material images.
export const uploadVendorImage = async (
  dataUri: string,
): Promise<string> => {
  const res = await api.post('/vendor/orders/upload', {file: dataUri});
  return res.data?.data?.url as string;
};

export interface PackVendorOrderPayload {
  note?: string;
}

export const packVendorOrder = async (
  id: string,
  payload: PackVendorOrderPayload = {},
): Promise<VendorFulfilmentBooking> => {
  const res = await api.patch(
    `/vendor/orders/${encodeURIComponent(id)}/pack`,
    payload,
  );
  return res.data?.data as VendorFulfilmentBooking;
};

export interface DispatchVendorOrderPayload {
  dispatchDate?: string;
  dispatchTime?: string;
  vehicleNumber?: string;
  driverId?: string;
}

export const dispatchVendorOrder = async (
  id: string,
  payload: DispatchVendorOrderPayload,
): Promise<VendorFulfilmentBooking> => {
  const res = await api.patch(
    `/vendor/orders/${encodeURIComponent(id)}/dispatch`,
    payload,
  );
  return res.data?.data as VendorFulfilmentBooking;
};

export interface AssignableDriver {
  id: string;
  name: string;
  vehicleNumber: string | null;
}

export const fetchAssignableDrivers = async (): Promise<AssignableDriver[]> => {
  const res = await api.get('/vendor/orders/assignable-drivers');
  return (res.data?.data ?? []) as AssignableDriver[];
};
