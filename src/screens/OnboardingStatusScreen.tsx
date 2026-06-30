import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import GreenTickIcon from '../assets/registration/GreenTickIcon';
import {fetchMe, reapplyVendor, getStoredVendor, VendorProfile} from '../services/auth';

const otgLogo = require('../assets/registration/source_OTG_Grey.png');

type Approval = 'pending' | 'approved' | 'rejected';

const OnboardingStatusScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reapplying, setReapplying] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // Show stored data instantly, then refresh from the server.
      const stored = await getStoredVendor();
      if (stored) setVendor(stored);
      const fresh = await fetchMe();
      setVendor(fresh);
    } catch (_e) {
      // keep whatever we have
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approval: Approval = (vendor?.approvalStatus as Approval) || 'pending';

  const handleGoToDashboard = () => {
    navigation?.reset({index: 0, routes: [{name: 'Dashboard'}]});
  };

  const handleReapply = async () => {
    try {
      setReapplying(true);
      const updated = await reapplyVendor();
      setVendor(updated);
      Alert.alert(
        'Request submitted',
        'Your application has been sent for review again.',
      );
    } catch (e: any) {
      Alert.alert(
        'Could not submit',
        e?.response?.data?.message || 'Please try again.',
      );
    } finally {
      setReapplying(false);
    }
  };

  // Per-state content
  const config = {
    approved: {
      color: '#008236',
      title: 'Approved!',
      message: 'Congratulations! Your vendor account has been approved.',
    },
    pending: {
      color: '#e48714',
      title: 'Waiting for Approval',
      message:
        'Your documents have been submitted. Our team is reviewing your application. You will be able to receive orders once approved.',
    },
    rejected: {
      color: '#ef4444',
      title: 'Application Rejected',
      message:
        vendor?.rejectionReason ||
        'Your application was rejected. Please review and submit again.',
    },
  }[approval];

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{backgroundColor: '#f9fafb'}}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" translucent />

      <View
        className="bg-white rounded-2xl px-8 pt-8 pb-8 items-center"
        style={{
          width: 360,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 10},
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 10,
        }}>
        {/* Logo */}
        <View
          className="h-20 w-20 items-center justify-center rounded-[10px] mb-4"
          style={{overflow: 'hidden'}}>
          <Image source={otgLogo} className="h-20 w-20" resizeMode="contain" />
        </View>

        <Text className="font-poppins-bold text-[24px] leading-[32px] text-primary text-center mb-4">
          Onboarding Status
        </Text>

        {/* Status icon */}
        <View className="mb-4">
          {approval === 'approved' ? (
            <GreenTickIcon size={64} />
          ) : (
            <View
              className="h-16 w-16 rounded-full items-center justify-center"
              style={{backgroundColor: config.color}}>
              <Text
                className="text-white"
                style={{fontFamily: 'Poppins-Bold', fontSize: 32}}>
                {approval === 'rejected' ? '!' : '…'}
              </Text>
            </View>
          )}
        </View>

        <Text
          className="text-[20px] leading-[28px] text-center mb-2"
          style={{fontFamily: 'Poppins-SemiBold', color: config.color}}>
          {config.title}
        </Text>

        <Text className="font-poppins-regular text-[15px] leading-[22px] text-[#4a5565] text-center mb-6 px-2">
          {config.message}
        </Text>

        {loading ? (
          <ActivityIndicator color={config.color} />
        ) : approval === 'approved' ? (
          <TouchableOpacity
            className="bg-[#ffe403] h-12 items-center justify-center rounded-lg px-8"
            onPress={handleGoToDashboard}
            activeOpacity={0.8}>
            <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
              Go to Dashboard
            </Text>
          </TouchableOpacity>
        ) : approval === 'rejected' ? (
          <TouchableOpacity
            className="bg-[#ffe403] h-12 items-center justify-center rounded-lg px-8"
            onPress={handleReapply}
            disabled={reapplying}
            activeOpacity={0.8}>
            {reapplying ? (
              <ActivityIndicator color="#404040" />
            ) : (
              <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
                Request Again
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          // pending — let the vendor re-check approval status
          <TouchableOpacity
            className="border border-[#e5e7eb] h-12 items-center justify-center rounded-lg px-8"
            onPress={load}
            activeOpacity={0.8}>
            <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
              Refresh Status
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default OnboardingStatusScreen;
