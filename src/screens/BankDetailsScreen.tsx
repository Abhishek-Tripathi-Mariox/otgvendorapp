import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {MenuIcon} from '../assets/dashboard/icons';
import NotificationBell from '../components/NotificationBell';
import {useSidebar} from '../components/SidebarProvider';
import {
  BackArrowIcon,
  InfoCircleIcon,
  CheckCircleIcon,
  ShieldLargeIcon,
} from '../assets/profile/icons';
import {
  VendorProfile,
  fetchMe,
  getStoredToken,
  getStoredVendor,
  saveSession,
  updateMe,
} from '../services/auth';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  required,
}) => (
  <View className="mb-4">
    <View className="flex-row mb-2">
      <Text
        className="text-[14px] leading-[20px]"
        style={{fontFamily: 'Poppins-Medium', color: '#364153'}}>
        {label}
      </Text>
      {required ? (
        <Text
          className="text-[14px] leading-[20px]"
          style={{fontFamily: 'Poppins-Medium', color: '#fb2c36'}}>
          {' *'}
        </Text>
      ) : null}
    </View>
    <View
      className="rounded-lg"
      style={{
        borderWidth: 1,
        borderColor: '#d1d5dc',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 12,
      }}>
      <TextInput
        className="text-[16px] text-primary"
        style={{fontFamily: 'Poppins-Regular', padding: 0}}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(64,64,64,0.5)"
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

// Mask all but the last 4 digits of an account number ("XXXXXXXX1234").
const maskAccount = (acc?: string): string => {
  if (!acc) return '';
  const trimmed = acc.trim();
  if (trimmed.length <= 4) return trimmed;
  return `${'X'.repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
};

// Format a 10-digit Indian mobile as "+91 98765 43210" for display only.
const formatIndianMobile = (m?: string): string => {
  if (!m) return '';
  const digits = String(m).replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return m;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const BankDetailsScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [holder, setHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [branch, setBranch] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = (v: VendorProfile | null) => {
      if (!v) return;
      setVendor(v);
      const bd = v.bankDetails || {};
      setHolder(bd.accountHolderName || v.business?.name || v.name || '');
      setBankName(bd.bankName || '');
      setAccountNumber(bd.accountNumber || '');
      setConfirmAccount(bd.accountNumber || '');
      setIfsc((bd.ifscCode || '').toUpperCase());
      setBranch(bd.branchName || '');
    };

    const load = async () => {
      try {
        const cached = await getStoredVendor();
        if (!cancelled) hydrate(cached);
        const fresh = await fetchMe();
        if (cancelled) return;
        hydrate(fresh);
        const token = await getStoredToken();
        if (token) await saveSession(token, fresh);
      } catch {
        // keep cached values on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit =
    !saving &&
    holder.trim() &&
    bankName.trim() &&
    accountNumber.trim() &&
    confirmAccount.trim() &&
    ifsc.trim() &&
    accountNumber === confirmAccount;

  const handleProceed = () => {
    if (!canSubmit) return;
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
      Alert.alert('Invalid IFSC', 'IFSC code must be 11 characters (e.g. HDFC0001234).');
      return;
    }
    setOtpVisible(true);
  };

  const handleVerify = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await updateMe({
        bankDetails: {
          accountHolderName: holder.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifsc.trim().toUpperCase(),
          branchName: branch.trim(),
        },
      });
      const token = await getStoredToken();
      if (token) await saveSession(token, updated);
      setVendor(updated);
      setOtpVisible(false);
      setOtp('');
      Alert.alert('Saved', 'Bank details updated successfully.', [
        {text: 'OK', onPress: () => navigation?.navigate('Profile')},
      ]);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Could not update bank details. Try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const registeredMobileDisplay =
    formatIndianMobile(vendor?.mobile) || 'your registered mobile';

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
        contentContainerStyle={{padding: 12, paddingBottom: 120}}>
        {/* Title row */}
        <View className="flex-row items-start mb-4" style={{gap: 16}}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation?.goBack()}
            className="items-center justify-center rounded-lg"
            style={{width: 40, height: 40}}>
            <BackArrowIcon size={24} color="#404040" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text
              className="text-[20px] leading-[28px] text-primary"
              style={{fontFamily: 'Poppins-Bold'}}>
              Update Bank Details
            </Text>
            <Text className="font-poppins-regular text-[16px] leading-[24px] text-[#4a5565]">
              {vendor?.bankDetails?.accountNumber
                ? `Current account: ${maskAccount(vendor.bankDetails.accountNumber)}`
                : 'Add your bank account to receive payments'}
            </Text>
          </View>
        </View>

        {/* Security notice */}
        <View
          className="rounded-lg mb-4"
          style={{
            backgroundColor: '#eff6ff',
            borderLeftWidth: 3.5,
            borderLeftColor: '#2b7fff',
            padding: 16,
          }}>
          <View className="flex-row" style={{gap: 12}}>
            <InfoCircleIcon size={24} color="#2b7fff" />
            <View className="flex-1">
              <Text
                className="text-[16px] leading-[24px]"
                style={{fontFamily: 'Poppins-SemiBold', color: '#193cb8'}}>
                Security Notice
              </Text>
              <Text
                className="font-poppins-regular text-[14px] leading-[20px] mt-1"
                style={{color: '#1447e6'}}>
                Bank details updates require OTP verification sent to your
                registered mobile number. All changes will be verified by admin
                before activation to ensure security.
              </Text>
            </View>
          </View>
        </View>

        {/* Form card */}
        <View
          className="bg-white rounded-xl"
          style={{
            padding: 24,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
          }}>
          {loading ? (
            <View className="items-center justify-center" style={{paddingVertical: 32}}>
              <ActivityIndicator color="#404040" />
            </View>
          ) : null}
          <FormField
            label="Account Holder Name"
            value={holder}
            onChangeText={setHolder}
            placeholder="ABC Construction Supplies Pvt Ltd"
            required
          />
          <FormField
            label="Bank Name"
            value={bankName}
            onChangeText={setBankName}
            placeholder="HDFC Bank"
            required
          />
          <FormField
            label="Account Number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="1234567890126789"
            keyboardType="numeric"
            required
          />
          <FormField
            label="Confirm Account Number"
            value={confirmAccount}
            onChangeText={setConfirmAccount}
            placeholder="1234567890126789"
            keyboardType="numeric"
            required
          />
          <FormField
            label="IFSC Code"
            value={ifsc}
            onChangeText={setIfsc}
            placeholder="HDFC0001234"
            required
          />
          <FormField
            label="Branch Name"
            value={branch}
            onChangeText={setBranch}
            placeholder="Mumbai Main"
            required
          />

          {/* Verification process notice */}
          <View
            className="rounded-lg mb-4"
            style={{
              backgroundColor: '#fefce8',
              borderWidth: 1,
              borderColor: '#fff085',
              padding: 16,
            }}>
            <View className="flex-row" style={{gap: 8}}>
              <CheckCircleIcon size={20} color="#ca8a04" />
              <Text
                className="text-[14px] leading-[20px]"
                style={{fontFamily: 'Poppins-Medium', color: '#894b00'}}>
                Verification Process
              </Text>
            </View>
            <View className="pl-7 mt-2" style={{gap: 4}}>
              <Text
                className="font-poppins-regular text-[14px] leading-[20px]"
                style={{color: '#a65f00'}}>
                • OTP will be sent to your registered mobile: {registeredMobileDisplay}
              </Text>
              <Text
                className="font-poppins-regular text-[14px] leading-[20px]"
                style={{color: '#a65f00'}}>
                • Admin will verify the bank details within 24-48 hours
              </Text>
              <Text
                className="font-poppins-regular text-[14px] leading-[20px]"
                style={{color: '#a65f00'}}>
                • You'll receive a notification once verified
              </Text>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation?.goBack()}
            className="rounded-lg items-center justify-center mb-3"
            style={{
              height: 48,
              borderWidth: 1,
              borderColor: '#d1d5dc',
            }}>
            <Text
              className="text-[16px] leading-[24px]"
              style={{fontFamily: 'Poppins-SemiBold', color: '#364153'}}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleProceed}
            className="rounded-lg items-center justify-center"
            style={{
              height: 48,
              backgroundColor: canSubmit ? '#ffe403' : '#f3e8a0',
            }}>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Proceed to OTP Verification
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <BottomNavBar activeTab="Profile" />

      {/* OTP Verification Modal */}
      <Modal
        visible={otpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOtpVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center px-6"
          style={{backgroundColor: 'rgba(0,0,0,0.41)'}}
          onPress={() => setOtpVisible(false)}>
          <Pressable
            className="bg-white rounded-[15px] overflow-hidden"
            style={{
              width: '100%',
              maxWidth: 329,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 11},
              shadowOpacity: 0.2,
              shadowRadius: 15,
              elevation: 20,
            }}
            onPress={() => {}}>
            {/* Dialog header */}
            <View
              className="bg-primary"
              style={{height: 64, justifyContent: 'center', paddingHorizontal: 24}}>
              <Text
                className="text-[20px] text-white"
                style={{fontFamily: 'Poppins-Medium', letterSpacing: 0.15}}>
                OTP Verification
              </Text>
            </View>

            {/* Dialog content */}
            <View className="px-6 pt-4 pb-6">
              <View className="items-center mb-4">
                <ShieldLargeIcon size={48} color="#e48714" />
                <Text
                  className="font-poppins-regular text-[16px] leading-[24px] text-center mt-3"
                  style={{color: '#364153'}}>
                  Enter the 6-digit OTP sent to
                </Text>
                <Text
                  className="text-[16px] leading-[24px] text-primary text-center"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  {registeredMobileDisplay}
                </Text>
              </View>

              {/* OTP input */}
              <View
                className="rounded"
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.23)',
                  height: 56,
                  justifyContent: 'center',
                  paddingHorizontal: 14,
                  marginBottom: 8,
                }}>
                <TextInput
                  className="text-[16px] text-primary"
                  style={{fontFamily: 'Poppins-Regular', padding: 0}}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter OTP"
                  placeholderTextColor="rgba(0,0,0,0.6)"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              {/* Resend */}
              <TouchableOpacity
                activeOpacity={0.7}
                className="items-center justify-center py-2 mb-3">
                <Text
                  className="text-[14px] leading-[20px]"
                  style={{fontFamily: 'Poppins-Medium', color: '#e48714'}}>
                  Resend OTP
                </Text>
              </TouchableOpacity>

              {/* Buttons */}
              <View className="flex-row" style={{gap: 12}}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setOtpVisible(false)}
                  className="rounded-lg items-center justify-center"
                  style={{
                    width: 101,
                    height: 48,
                    borderWidth: 1,
                    borderColor: '#d1d5dc',
                  }}>
                  <Text
                    className="text-[16px] leading-[24px]"
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      color: 'rgba(0,0,0,0.87)',
                    }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleVerify}
                  disabled={saving}
                  className="flex-1 rounded-lg items-center justify-center"
                  style={{height: 48, backgroundColor: '#ffe403'}}>
                  {saving ? (
                    <ActivityIndicator color="#404040" />
                  ) : (
                    <Text
                      className="text-[16px] leading-[24px] text-primary"
                      style={{fontFamily: 'Poppins-SemiBold'}}>
                      Verify & Update
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default BankDetailsScreen;
