import api from './api';

// Quotations the admin has assigned to this vendor. Read-only on the vendor
// side — the vendor sees the customer's requirement and the admin's quote so
// they can prepare/fulfil; status changes are driven by admin/customer.

export type QuotationStatus =
  | 'new'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'expired';

export type QuotationFilter = 'All' | QuotationStatus;

export interface VendorQuotationItem {
  categoryName?: string;
  subCategoryName?: string;
  materialName?: string;
  quantity?: string;
  unit?: string;
  note?: string;
}

export interface VendorQuotationCustomer {
  _id?: string;
  name?: string;
  mobile?: string;
  email?: string;
}

export interface VendorQuotation {
  _id: string;
  quotationCode: string;
  customerType?: 'contractor' | 'individual';
  name: string;
  mobile: string;
  email?: string;
  company?: string;
  address?: string;
  landmark?: string;
  items?: VendorQuotationItem[];
  // Legacy single-item fields
  category?: string;
  quantity?: string;
  unit?: string;
  materialRequirement?: string;
  status: QuotationStatus;
  quotedPrice?: number | null;
  quotedCurrency?: string;
  quotedValidTill?: string | null;
  adminNotes?: string;
  user?: VendorQuotationCustomer | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const fetchAssignedQuotations = async (
  filter: QuotationFilter = 'All',
): Promise<VendorQuotation[]> => {
  const res = await api.get('/quotations/vendor/assigned', {
    params: filter && filter !== 'All' ? {status: filter} : undefined,
  });
  return (res.data?.data ?? []) as VendorQuotation[];
};

export const fetchAssignedQuotation = async (
  id: string,
): Promise<VendorQuotation> => {
  const res = await api.get(`/quotations/vendor/assigned/${id}`);
  return res.data?.data as VendorQuotation;
};
