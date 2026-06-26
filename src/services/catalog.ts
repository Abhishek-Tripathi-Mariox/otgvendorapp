import api from './api';

export interface Category {
  _id: string;
  name: string;
  image?: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  image?: string;
  category: string;
}

export interface MaterialOption {
  _id: string;
  name: string;
  images?: string[];
  brand?: string;
  unit: string;
  minOrderQty?: number;
  mrp?: number;
  sellingPrice?: number;
  basicPrice?: number;
  category?: {_id: string; name: string} | string;
  subCategory?: {_id: string; name: string} | string | null;
}

export interface MyVendorMaterial {
  _id: string;
  price: number;
  quantity?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  isAvailable: boolean;
  specs?: string;
  description?: string;
  images?: string[];
  addedByVendor: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  material: MaterialOption & {
    category?: {_id: string; name: string; image?: string};
    subCategory?: {_id: string; name: string; image?: string} | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CategorySummary {
  _id: string;
  categoryName: string;
  categoryImage?: string;
  unit?: string;
  available: number;
  totalProducts: number;
  totalQuantity: number;
}

// --- Public (legacy) endpoints kept for screens that don't require auth ---
export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get('/vendor/inventory/categories');
  return res.data?.data ?? [];
};

export const fetchSubCategories = async (
  categoryId: string,
): Promise<SubCategory[]> => {
  const res = await api.get(
    `/vendor/inventory/categories/${categoryId}/subcategories`,
  );
  return res.data?.data ?? [];
};

// --- Vendor-authenticated inventory endpoints ---
export const fetchMaterialsForCategory = async (params: {
  category?: string;
  subCategory?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<MaterialOption[]> => {
  const res = await api.get('/vendor/inventory/materials', {params});
  return res.data?.data ?? [];
};

export const fetchInventorySummary = async (): Promise<CategorySummary[]> => {
  const res = await api.get('/vendor/inventory/summary');
  return res.data?.data ?? [];
};

export const fetchMyMaterials = async (params?: {
  category?: string;
  subCategory?: string;
  search?: string;
}): Promise<MyVendorMaterial[]> => {
  const res = await api.get('/vendor/inventory/my-materials', {params});
  return res.data?.data ?? [];
};

export interface AddMyMaterialPayload {
  materialId: string;
  price: number;
  quantity?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  isAvailable?: boolean;
  specs?: string;
  description?: string;
  images?: string[];
}

export const addMyMaterial = async (
  payload: AddMyMaterialPayload,
): Promise<MyVendorMaterial> => {
  const res = await api.post('/vendor/inventory/my-materials', payload);
  return res.data?.data;
};

export const updateMyMaterial = async (
  id: string,
  payload: Partial<AddMyMaterialPayload>,
): Promise<MyVendorMaterial> => {
  const res = await api.patch(`/vendor/inventory/my-materials/${id}`, payload);
  return res.data?.data;
};

export const removeMyMaterial = async (id: string): Promise<void> => {
  await api.delete(`/vendor/inventory/my-materials/${id}`);
};
