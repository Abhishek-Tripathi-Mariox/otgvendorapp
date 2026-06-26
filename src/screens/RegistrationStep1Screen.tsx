import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import RegistrationHeader from '../components/RegistrationHeader';
import ChevronDownIcon from '../assets/registration/ChevronDownIcon';
import AddressSearchField, {
  SelectedLocation,
} from '../components/AddressSearchField';
import {getStoredVendor, saveBusinessStep} from '../services/auth';

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler',
  'Manufacturer',
  'Distributor',
];

const RegistrationStep1Screen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [mobile, setMobile] = useState<string>(route?.params?.mobile ?? '');
  const [mobileError, setMobileError] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<SelectedLocation | null>(null);
  const [businessType, setBusinessType] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [gstError, setGstError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  // Prefill from the stored session: keeps the verified mobile filled on
  // relaunch and restores any data already saved for this step on resume.
  useEffect(() => {
    getStoredVendor().then(vendor => {
      if (!vendor) return;
      if (vendor.mobile) setMobile(prev => prev || vendor.mobile);
      if (vendor.name) setVendorName(prev => prev || vendor.name!);
      if (vendor.business?.address)
        setAddress(prev => prev || vendor.business!.address!);
      if (vendor.business?.type)
        setBusinessType(prev => prev || vendor.business!.type!);
      if (vendor.business?.gstNumber)
        setGstNumber(prev => prev || vendor.business!.gstNumber!);
    });
  }, []);

  const handleNext = async () => {
    if (mobile.length !== 10) {
      setMobileError('Mobile number must be 10 digits');
      return;
    }
    // GST registration numbers are exactly 15 characters.
    if (gstNumber && gstNumber.trim().length !== 15) {
      setGstError('GST number must be 15 characters');
      return;
    }
    setGstError('');
    setSaving(true);
    try {
      await saveBusinessStep({
        name: vendorName,
        businessName: vendorName,
        businessType,
        address,
        gstNumber,
        location: location
          ? {
              coordinates: [location.longitude, location.latitude],
              address,
            }
          : undefined,
      });
      navigation?.navigate('RegistrationStep2');
    } catch (err: any) {
      Alert.alert(
        'Could not save',
        err?.response?.data?.message ||
          err?.message ||
          'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1" style={{backgroundColor: '#f9fafb'}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f9fafb"
        translucent
      />
      <KeyboardAwareScrollView
        className="flex-1"
        bounces={false}
        contentContainerStyle={{paddingVertical: 32}}>
        <View className="px-4">
            <RegistrationHeader currentStep={1} />

            {/* Card */}
            <View
              className="w-full bg-white rounded-2xl px-8 pt-8 pb-8"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 10},
                shadowOpacity: 0.1,
                shadowRadius: 15,
                elevation: 10,
              }}>
              {/* Heading */}
              <Text className="font-poppins-semibold text-[24px] leading-[32px] text-primary mb-4">
                Business Details
              </Text>

              {/* Vendor Name */}
              <View className="mb-4">
                <Text
                  className="text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Vendor Name *
                </Text>
                <View className="border border-[#d1d5dc] rounded-lg h-[50px] px-4 justify-center">
                  <TextInput
                    className="font-poppins-regular text-[16px] text-primary p-0"
                    value={vendorName}
                    onChangeText={setVendorName}
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View className="mb-4">
                <Text
                  className="text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Mobile Number *
                </Text>
                <View
                  className={`border rounded-lg h-[50px] px-4 justify-center bg-[#f3f4f6] ${
                    mobileError ? 'border-[#fb2c36]' : 'border-[#d1d5dc]'
                  }`}>
                  <TextInput
                    className="font-poppins-regular text-[16px] text-[#6b7280] p-0"
                    value={mobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={false}
                  />
                </View>
                {mobileError ? (
                  <Text
                    className="text-[12px] leading-[16px] text-[#fb2c36] mt-1"
                    style={{fontFamily: 'Poppins-Regular'}}>
                    {mobileError}
                  </Text>
                ) : null}
              </View>

              {/* Address */}
              <View className="mb-4">
                <AddressSearchField
                  label="Address *"
                  value={address}
                  onChangeText={setAddress}
                  onSelectLocation={setLocation}
                />
              </View>

              {/* Business Type Dropdown */}
              <View className="mb-4">
                <Text
                  className="text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Business Type *
                </Text>
                <TouchableOpacity
                  className="border border-[#d1d5dc] rounded-lg h-[48px] px-3 flex-row items-center justify-between"
                  onPress={() => setShowDropdown(!showDropdown)}
                  activeOpacity={0.7}>
                  <Text
                    className={`text-[14px] ${
                      businessType
                        ? 'text-primary font-poppins-regular'
                        : 'text-black font-poppins-light'
                    }`}>
                    {businessType || 'Select business type'}
                  </Text>
                  <ChevronDownIcon />
                </TouchableOpacity>
                {showDropdown && (
                  <View
                    className="border border-[#d1d5dc] rounded-lg mt-1 bg-white"
                    style={{elevation: 5}}>
                    {BUSINESS_TYPES.map(type => (
                      <TouchableOpacity
                        key={type}
                        className="px-4 py-3 border-b border-[#f3f4f6]"
                        onPress={() => {
                          setBusinessType(type);
                          setShowDropdown(false);
                        }}>
                        <Text className="font-poppins-regular text-[14px] text-primary">
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* GST Number */}
              <View className="mb-6">
                <Text
                  className="text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  GST Number *
                </Text>
                <View
                  className={`border rounded-lg h-[50px] px-4 justify-center ${
                    gstError ? 'border-[#fb2c36]' : 'border-[#d1d5dc]'
                  }`}>
                  <TextInput
                    className="font-poppins-regular text-[16px] text-primary p-0"
                    value={gstNumber}
                    onChangeText={t => {
                      // GSTIN is 15 alphanumeric characters.
                      setGstNumber(
                        t.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15),
                      );
                      if (gstError) setGstError('');
                    }}
                    autoCapitalize="characters"
                    maxLength={15}
                    placeholder="15-character GSTIN"
                    placeholderTextColor="rgba(64,64,64,0.4)"
                  />
                </View>
                {gstError ? (
                  <Text
                    className="text-[12px] leading-[16px] text-[#fb2c36] mt-1"
                    style={{fontFamily: 'Poppins-Regular'}}>
                    {gstError}
                  </Text>
                ) : null}
              </View>

              {/* Next Button */}
              <TouchableOpacity
                className="bg-[#ffe403] h-12 items-center justify-center rounded-lg"
                onPress={handleNext}
                disabled={saving}
                activeOpacity={0.8}
                style={{opacity: saving ? 0.7 : 1}}>
                {saving ? (
                  <ActivityIndicator color="#404040" />
                ) : (
                  <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
                    Next
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                className="items-center mt-6"
                onPress={() => navigation?.navigate('Login')}>
                <Text className="font-poppins-regular text-[16px] leading-[24px] text-[#e48714] text-center">
                  Already have an account? Login
                </Text>
              </TouchableOpacity>
            </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default RegistrationStep1Screen;
