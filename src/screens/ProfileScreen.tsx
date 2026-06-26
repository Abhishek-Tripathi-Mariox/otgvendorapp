import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {MenuIcon} from '../assets/dashboard/icons';
import NotificationBell from '../components/NotificationBell';
import {useNotifications} from '../components/NotificationsProvider';
import {useSidebar} from '../components/SidebarProvider';
import {
  UserIcon,
  StarIcon,
  StarOutlineIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  LocationIcon,
  SettingsIcon,
  BankCircleIcon,
  BellCircleIcon,
  ShieldCheckIcon,
  HelpCircleIcon,
  DocumentIcon,
  LogoutIcon,
  ChevronRightIcon,
  BusinessIcon,
} from '../assets/profile/icons';
import {useAppDispatch, logout} from '../store';
import {
  clearSession,
  fetchMe,
  updateMe,
  saveSession,
  getStoredToken,
  getStoredVendor,
  VendorProfile,
} from '../services/auth';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 5,
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  showBorder?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({icon, label, value, showBorder = true}) => (
  <View
    className={`flex-row items-start ${showBorder ? 'border-t border-[#f3f4f6]' : ''}`}
    style={{paddingVertical: 12, gap: 12}}>
    <View style={{marginTop: 2}}>{icon}</View>
    <View className="flex-1">
      <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text
          className="text-[16px] leading-[24px] text-primary"
          style={{fontFamily: 'Poppins-Medium'}}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  </View>
);

interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  showBorder?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  onPress,
  showBorder = true,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className={`flex-row items-center justify-between px-4 ${
      showBorder ? 'border-b border-[#f3f4f6]' : ''
    }`}
    style={{height: 72}}>
    <View className="flex-row items-center flex-1" style={{gap: 12}}>
      <View
        className="rounded-full items-center justify-center"
        style={{width: 40, height: 40, backgroundColor: iconBg}}>
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className="text-[16px] leading-[24px] text-primary"
          style={{fontFamily: 'Poppins-Medium'}}>
          {title}
        </Text>
        <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
          {subtitle}
        </Text>
      </View>
    </View>
    <ChevronRightIcon size={24} color="#9ca3af" />
  </TouchableOpacity>
);

type EditDraft = {
  businessName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
};

const emptyDraft: EditDraft = {
  businessName: '',
  email: '',
  mobile: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  panNumber: '',
};

const draftFromVendor = (v: VendorProfile | null): EditDraft => ({
  businessName: v?.business?.name ?? '',
  email: v?.email ?? '',
  mobile: v?.mobile ?? '',
  address: v?.business?.address ?? '',
  city: v?.business?.city ?? '',
  state: v?.business?.state ?? '',
  pincode: v?.business?.pincode ?? '',
  gstNumber: v?.business?.gstNumber ?? '',
  panNumber: v?.business?.panNumber ?? '',
});

interface EditFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
  editable?: boolean;
}

const EditField: React.FC<EditFieldProps> = ({
  label,
  value,
  onChange,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
}) => (
  <View style={{marginBottom: 12}}>
    <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282] mb-1">
      {label}
    </Text>
    <View
      className={`border rounded-lg px-3 ${
        editable ? 'border-[#d1d5dc] bg-white' : 'border-[#e5e7eb] bg-[#f3f4f6]'
      }`}
      style={{minHeight: 44, justifyContent: 'center'}}>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="font-poppins-regular text-[16px] text-primary p-0"
      />
    </View>
  </View>
);

const ProfileScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const dispatch = useAppDispatch();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loadingVendor, setLoadingVendor] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<EditDraft>(emptyDraft);
  const {unreadCount} = useNotifications();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const cached = await getStoredVendor();
        if (!cancelled && cached) setVendor(cached);
        const fresh = await fetchMe();
        if (cancelled) return;
        setVendor(fresh);
        const token = await getStoredToken();
        if (token) await saveSession(token, fresh);
      } catch {
        // keep cached vendor if refresh fails
      } finally {
        if (!cancelled) setLoadingVendor(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = () => {
    setDraft(draftFromVendor(vendor));
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft(emptyDraft);
  };

  const handleSave = async () => {
    if (!draft.businessName.trim()) {
      Alert.alert('Validation', 'Business name is required');
      return;
    }
    if (draft.gstNumber.trim() && draft.gstNumber.trim().length !== 15) {
      Alert.alert('Validation', 'GST number must be 15 characters');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMe({
        email: draft.email.trim() || undefined,
        business: {
          name: draft.businessName.trim(),
          address: draft.address.trim(),
          city: draft.city.trim(),
          state: draft.state.trim(),
          pincode: draft.pincode.trim(),
          gstNumber: draft.gstNumber.trim().toUpperCase(),
          panNumber: draft.panNumber.trim().toUpperCase(),
        },
      });
      setVendor(updated);
      const token = await getStoredToken();
      if (token) await saveSession(token, updated);
      setEditing(false);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || 'Could not update profile. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearSession();
    } finally {
      dispatch(logout());
      navigation?.reset({index: 0, routes: [{name: 'Login'}]});
    }
  };

  const businessName = vendor?.business?.name || vendor?.name || 'Vendor';
  const vendorCode = vendor?.vendorCode || '—';
  const displayMobile = vendor?.mobile ? `+91 ${vendor.mobile}` : '—';
  const displayEmail = vendor?.email || '—';
  const addressLine1 = vendor?.business?.address || '—';
  const cityState = [vendor?.business?.city, vendor?.business?.state]
    .filter(Boolean)
    .join(', ');
  const pincode = vendor?.business?.pincode;
  const addressLine2 = pincode
    ? `${cityState ? cityState + ' - ' : ''}${pincode}`
    : cityState;

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#404040"
        translucent={false}
      />

      {/* Top Bar */}
      <View
        className="flex-row items-center justify-between px-4 bg-primary"
        style={{
          height: 56,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}>
        <View className="flex-row items-center" style={{gap: 12}}>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center rounded-lg"
            activeOpacity={0.7}
            onPress={openSidebar}>
            <MenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center" style={{gap: 8}}>
            <View
              className="w-8 h-8 rounded-[10px]"
              style={{overflow: 'hidden'}}>
              <Image
                source={otgLogo}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-[16px] leading-[24px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Profile
            </Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{paddingBottom: 120}}>
        {/* Vendor header */}
        <View className="bg-primary px-6 pt-6 pb-6">
          <View className="flex-row items-center" style={{gap: 16}}>
            <View
              className="rounded-full items-center justify-center"
              style={{width: 80, height: 80, backgroundColor: '#ffe403'}}>
              <UserIcon size={40} color="#404040" />
            </View>
            <View className="flex-1">
              <Text
                className="text-[20px] leading-[28px] text-white"
                style={{fontFamily: 'Poppins-Bold'}}>
                {businessName}
              </Text>
              <Text
                className="font-poppins-regular text-[14px] leading-[20px] text-white"
                style={{opacity: 0.9}}>
                Vendor ID: {vendorCode}
              </Text>
              {vendor?.isVerified ? (
                <View className="flex-row items-center mt-1" style={{gap: 4}}>
                  <ShieldCheckIcon size={16} color="#22c55e" />
                  <Text className="font-poppins-regular text-[12px] leading-[16px] text-white ml-1">
                    Verified Vendor
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center mt-1" style={{gap: 4}}>
                  <Text className="font-poppins-regular text-[12px] leading-[16px] text-white">
                    Status: {vendor?.status === 'inactive' ? 'Inactive' : 'Pending verification'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pt-4" style={{gap: 16}}>
          {/* Business Information card */}
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={CARD_SHADOW}>
            <View
              className="flex-row items-center justify-between px-4"
              style={{height: 51, backgroundColor: '#ffe403'}}>
              <View className="flex-row items-center" style={{gap: 12}}>
                <BusinessIcon size={20} color="#404040" />
                <Text
                  className="text-[18px] leading-[27px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Business Information
                </Text>
              </View>
              {!editing && !loadingVendor && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={startEdit}
                  className="px-3 py-1 rounded-md"
                  style={{backgroundColor: '#404040'}}>
                  <Text
                    className="text-[12px] leading-[16px] text-white"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingVendor ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#404040" />
              </View>
            ) : editing ? (
              <View className="px-4 pb-4 pt-3">
                <EditField
                  label="Business Name *"
                  value={draft.businessName}
                  onChange={t => setDraft({...draft, businessName: t})}
                />
                <EditField
                  label="Email"
                  value={draft.email}
                  onChange={t => setDraft({...draft, email: t})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <EditField
                  label="Phone (login mobile)"
                  value={draft.mobile}
                  onChange={() => {}}
                  keyboardType="phone-pad"
                  editable={false}
                />
                <EditField
                  label="Address"
                  value={draft.address}
                  onChange={t => setDraft({...draft, address: t})}
                />
                <EditField
                  label="City"
                  value={draft.city}
                  onChange={t => setDraft({...draft, city: t})}
                />
                <EditField
                  label="State"
                  value={draft.state}
                  onChange={t => setDraft({...draft, state: t})}
                />
                <EditField
                  label="Pincode"
                  value={draft.pincode}
                  onChange={t =>
                    setDraft({...draft, pincode: t.replace(/\D/g, '').slice(0, 6)})
                  }
                  keyboardType="number-pad"
                />
                <EditField
                  label="GST Number"
                  value={draft.gstNumber}
                  onChange={t =>
                    setDraft({
                      ...draft,
                      // GSTIN is 15 alphanumeric characters.
                      gstNumber: t
                        .toUpperCase()
                        .replace(/[^0-9A-Z]/g, '')
                        .slice(0, 15),
                    })
                  }
                  autoCapitalize="characters"
                />
                <EditField
                  label="PAN Number"
                  value={draft.panNumber}
                  onChange={t =>
                    setDraft({...draft, panNumber: t.toUpperCase()})
                  }
                  autoCapitalize="characters"
                />

                <View className="flex-row mt-2" style={{gap: 12}}>
                  <TouchableOpacity
                    className="flex-1 border border-[#d1d5dc] h-11 items-center justify-center rounded-lg"
                    onPress={cancelEdit}
                    disabled={saving}
                    activeOpacity={0.7}>
                    <Text
                      className="text-[14px] leading-[20px] text-[#364153]"
                      style={{fontFamily: 'Poppins-SemiBold'}}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 h-11 items-center justify-center rounded-lg"
                    style={{backgroundColor: '#ffe403'}}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.8}>
                    {saving ? (
                      <ActivityIndicator color="#404040" />
                    ) : (
                      <Text
                        className="text-[14px] leading-[20px] text-primary"
                        style={{fontFamily: 'Poppins-SemiBold'}}>
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="px-4 pb-2 pt-2">
                <InfoRow
                  icon={<BuildingIcon size={20} color="#6a7282" />}
                  label="Business Name"
                  value={businessName}
                  showBorder={false}
                />
                <InfoRow
                  icon={<MailIcon size={20} color="#6a7282" />}
                  label="Email"
                  value={displayEmail}
                />
                <InfoRow
                  icon={<PhoneIcon size={20} color="#6a7282" />}
                  label="Phone"
                  value={displayMobile}
                />
                <InfoRow
                  icon={<LocationIcon size={20} color="#6a7282" />}
                  label="Address"
                  value={
                    <View>
                      <Text
                        className="text-[16px] leading-[24px] text-primary"
                        style={{fontFamily: 'Poppins-Medium'}}>
                        {addressLine1}
                      </Text>
                      {addressLine2 ? (
                        <Text
                          className="text-[16px] leading-[24px] text-primary"
                          style={{fontFamily: 'Poppins-Medium'}}>
                          {addressLine2}
                        </Text>
                      ) : null}
                    </View>
                  }
                />
                {vendor?.business?.gstNumber ? (
                  <InfoRow
                    icon={<DocumentIcon size={20} color="#6a7282" />}
                    label="GST Number"
                    value={vendor.business.gstNumber}
                  />
                ) : null}
                {vendor?.business?.panNumber ? (
                  <InfoRow
                    icon={<DocumentIcon size={20} color="#6a7282" />}
                    label="PAN Number"
                    value={vendor.business.panNumber}
                  />
                ) : null}
              </View>
            )}
          </View>

          {/* Account & Settings card */}
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={CARD_SHADOW}>
            <View
              className="flex-row items-center px-4"
              style={{height: 51, backgroundColor: '#e48714', gap: 12}}>
              <SettingsIcon size={20} color="#fff" />
              <Text
                className="text-[18px] leading-[27px] text-white"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Account & Settings
              </Text>
            </View>
            <SettingsRow
              icon={<BankCircleIcon size={20} color="#155dfc" />}
              iconBg="#eff6ff"
              title="Bank Details"
              subtitle="Manage payment information"
              onPress={() => navigation?.navigate('BankDetails')}
            />
            <SettingsRow
              icon={<BellCircleIcon size={20} color="#ca8a04" />}
              iconBg="#fefce8"
              title="Notifications"
              subtitle={
                unreadCount > 0
                  ? `${unreadCount} new notification${unreadCount === 1 ? '' : 's'}`
                  : 'No new notifications'
              }
              showBorder={false}
              onPress={() => navigation?.navigate('Notifications')}
            />
          </View>

          {/* Help & Legal card */}
          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={CARD_SHADOW}>
            <SettingsRow
              icon={<HelpCircleIcon size={20} color="#9810fa" />}
              iconBg="#faf5ff"
              title="Help & Support"
              subtitle="Get help and contact us"
              onPress={() => navigation?.navigate('Support')}
            />
            <SettingsRow
              icon={<DocumentIcon size={20} color="#6a7282" />}
              iconBg="#f9fafb"
              title="Terms & Conditions"
              subtitle="Legal information"
              showBorder={false}
            />
          </View>

          {/* Logout button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            className="bg-white rounded-2xl items-center justify-center flex-row"
            style={{
              height: 58,
              borderWidth: 1,
              borderColor: '#fb2c36',
              gap: 8,
              ...CARD_SHADOW,
            }}>
            <LogoutIcon size={20} color="#fb2c36" />
            <Text
              className="text-[16px] leading-[24px]"
              style={{fontFamily: 'Poppins-SemiBold', color: '#fb2c36'}}>
              Logout
            </Text>
          </TouchableOpacity>

          {/* Footer text */}
          <View className="pt-4 items-center">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#99a1af]">
              OTG Vendor App v1.0.0
            </Text>
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#99a1af]">
              © 2026 OTG Construction Materials
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <BottomNavBar activeTab="Profile" />
    </View>
  );
};

export default ProfileScreen;
