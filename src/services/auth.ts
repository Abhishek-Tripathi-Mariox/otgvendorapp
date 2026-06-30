import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'vendorToken';
const VENDOR_KEY = 'vendorProfile';

export type VendorOnboardingStep =
  | 'business'
  | 'categories'
  | 'documents'
  | 'completed';

export interface VendorProfile {
  _id: string;
  vendorCode?: string;
  name?: string;
  mobile: string;
  email?: string;
  business?: {
    name?: string;
    type?: string;
    gstNumber?: string;
    panNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
    branchName?: string;
  };
  categories?: string[];
  documents?: {
    gstCertificate?: string;
    panCard?: string;
    tradeLicense?: string;
    bankCheque?: string;
  };
  onboardingStep?: VendorOnboardingStep;
  status?: 'active' | 'inactive';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isVerified?: boolean;
  addedByAdmin?: boolean;
}

// The registration screen a vendor should resume at, based on their saved
// onboarding progress. "completed" (and admin-created vendors) go to Dashboard.
export const onboardingRoute = (
  vendor?: VendorProfile | null,
):
  | 'Dashboard'
  | 'RegistrationStep1'
  | 'RegistrationStep2'
  | 'RegistrationStep3'
  | 'OnboardingStatus' => {
  switch (vendor?.onboardingStep) {
    case 'business':
      return 'RegistrationStep1';
    case 'categories':
      return 'RegistrationStep2';
    case 'documents':
      return 'RegistrationStep3';
    default:
      // Onboarding complete — but if the vendor is awaiting approval or was
      // rejected, send them to the status screen instead of the dashboard.
      if (
        vendor?.approvalStatus === 'pending' ||
        vendor?.approvalStatus === 'rejected'
      ) {
        return 'OnboardingStatus';
      }
      return 'Dashboard';
  }
};

export const isProfileComplete = (vendor?: VendorProfile | null): boolean => {
  if (!vendor) return false;
  const hasBusiness = Boolean(vendor.business?.name && vendor.business?.address);
  const hasBank = Boolean(
    vendor.bankDetails?.accountNumber && vendor.bankDetails?.ifscCode,
  );
  return hasBusiness && hasBank;
};

export const saveSession = async (
  token: string,
  vendor: VendorProfile,
): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(VENDOR_KEY, JSON.stringify(vendor));
};

export const getStoredToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const getStoredVendor = async (): Promise<VendorProfile | null> => {
  const raw = await AsyncStorage.getItem(VENDOR_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VendorProfile;
  } catch {
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(VENDOR_KEY);
};

export const sendOtp = async (mobile: string) => {
  const {data} = await api.post('/vendor/auth/send-otp', {mobile});
  return data;
};

export const verifyOtp = async (
  mobile: string,
  otp: string,
): Promise<{token: string; vendor: VendorProfile}> => {
  const {data} = await api.post('/vendor/auth/verify-otp', {mobile, otp});
  return data.data;
};

export const resendOtp = async (mobile: string) => {
  const {data} = await api.post('/vendor/auth/resend-otp', {mobile});
  return data;
};

// --- Registration / onboarding steps (each returns the updated vendor) ---
export interface BusinessStepPayload {
  name?: string;
  businessName?: string;
  businessType?: string;
  address?: string;
  gstNumber?: string;
  location?: {coordinates: [number, number]; address?: string};
}

const persistStep = async (data: {
  onboardingStep: VendorOnboardingStep;
  vendor: VendorProfile;
}): Promise<VendorProfile> => {
  const token = await getStoredToken();
  if (token) await saveSession(token, data.vendor);
  return data.vendor;
};

export const saveBusinessStep = async (
  payload: BusinessStepPayload,
): Promise<VendorProfile> => {
  const {data} = await api.post('/vendor/auth/onboarding/business', payload);
  return persistStep(data.data);
};

export const saveCategoriesStep = async (
  categories: string[],
): Promise<VendorProfile> => {
  const {data} = await api.post('/vendor/auth/onboarding/categories', {
    categories,
  });
  return persistStep(data.data);
};

export const submitDocumentsStep = async (documents: {
  gstCertificate?: string;
  panCard?: string;
  tradeLicense?: string;
  bankCheque?: string;
}): Promise<VendorProfile> => {
  const {data} = await api.post('/vendor/auth/onboarding/documents', {
    documents,
  });
  return persistStep(data.data);
};

export const fetchMe = async (): Promise<VendorProfile> => {
  const {data} = await api.get('/vendor/auth/me');
  return data.data as VendorProfile;
};

// A rejected vendor re-submits their application (optionally updated docs).
// Moves approvalStatus back to "pending".
export const reapplyVendor = async (documents?: {
  gstCertificate?: string;
  panCard?: string;
  tradeLicense?: string;
  bankCheque?: string;
}): Promise<VendorProfile> => {
  const {data} = await api.post('/vendor/auth/onboarding/reapply', {
    documents,
  });
  return persistStep(data.data);
};

export type VendorProfileUpdate = Partial<{
  name: string;
  email: string;
  business: Partial<NonNullable<VendorProfile['business']>>;
  bankDetails: Partial<NonNullable<VendorProfile['bankDetails']>>;
}>;

export const updateMe = async (
  updates: VendorProfileUpdate,
): Promise<VendorProfile> => {
  const {data} = await api.put('/vendor/auth/me', updates);
  return data.data as VendorProfile;
};
