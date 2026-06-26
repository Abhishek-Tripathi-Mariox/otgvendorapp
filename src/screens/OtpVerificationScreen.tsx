import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {
  verifyOtp,
  resendOtp,
  saveSession,
  onboardingRoute,
} from '../services/auth';

const otgLogo = require('../assets/login/source_OTG_Grey.png');

const OtpVerificationScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const identifier = route?.params?.identifier ?? '';
  const [mobileOrEmail, setMobileOrEmail] = useState(identifier);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmitOtp = async () => {
    const mobile = mobileOrEmail.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert('Invalid mobile number', 'Please enter a valid mobile number.');
      return;
    }
    if (!/^\d{4,6}$/.test(otp)) {
      Alert.alert('Invalid OTP', 'Please enter the OTP you received.');
      return;
    }
    setSubmitting(true);
    try {
      const {token, vendor} = await verifyOtp(mobile, otp);
      await saveSession(token, vendor);
      const target = onboardingRoute(vendor);
      navigation?.reset({
        index: 0,
        routes: [
          {
            name: target,
            params: target === 'RegistrationStep1' ? {mobile} : undefined,
          },
        ],
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'OTP verification failed. Please try again.';
      Alert.alert('Verification failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const mobile = mobileOrEmail.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert('Invalid mobile number', 'Please enter a valid mobile number.');
      return;
    }
    setResending(true);
    try {
      await resendOtp(mobile);
      Alert.alert('OTP sent', 'A new OTP has been sent to your mobile.');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to resend OTP.';
      Alert.alert('Resend failed', message);
    } finally {
      setResending(false);
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
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <View className="items-center px-4">
            {/* Logo Section */}
            <View className="items-center mb-8">
              <View
                className="h-20 w-20 items-center justify-center rounded-[10px] mb-4"
                style={{overflow: 'hidden'}}>
                <Image
                  source={otgLogo}
                  className="h-20 w-20"
                  resizeMode="contain"
                />
              </View>
              <Text className="font-poppins-bold text-[30px] leading-[36px] text-primary text-center">
                ON THE GO
              </Text>
              <Text className="font-poppins-regular text-[16px] leading-[24px] text-[#4a5565] text-center mt-1">
                Vendor Login
              </Text>
            </View>

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
              <Text className="font-poppins-semibold text-[24px] leading-[32px] text-primary mb-6">
                Login
              </Text>

              {/* Mobile Number / Email Field */}
              <View className="mb-4">
                <Text
                  className="font-poppins-regular text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Mobile Number / Email
                </Text>
                <View className="border border-[#d1d5dc] rounded-lg px-4 h-[50px] justify-center">
                  <TextInput
                    className="font-poppins-regular text-[16px] text-primary p-0"
                    placeholder="Enter mobile number or email"
                    placeholderTextColor="rgba(64,64,64,0.5)"
                    value={mobileOrEmail}
                    onChangeText={setMobileOrEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* OTP Field + Resend Button */}
              <View className="mb-4">
                <Text
                  className="font-poppins-regular text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  OTP
                </Text>
                <View className="flex-row items-center" style={{gap: 8}}>
                  <View className="flex-1 border border-[#d1d5dc] rounded-lg px-4 h-[50px] justify-center">
                    <TextInput
                      className="font-poppins-regular text-[16px] text-primary p-0"
                      placeholder="Enter OTP"
                      placeholderTextColor="rgba(64,64,64,0.5)"
                      keyboardType="number-pad"
                      value={otp}
                      onChangeText={setOtp}
                      maxLength={6}
                    />
                  </View>
                  <TouchableOpacity
                    className="bg-[#e48714] h-[50px] items-center justify-center rounded-lg px-4"
                    onPress={handleResendOtp}
                    disabled={resending}
                    activeOpacity={0.8}
                    style={{opacity: resending ? 0.7 : 1}}>
                    {resending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text
                        className="text-[16px] leading-[24px] text-white text-center"
                        style={{fontFamily: 'Poppins-SemiBold'}}>
                        Resend OTP
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit OTP Button */}
              <TouchableOpacity
                className="bg-[#ffe403] h-12 items-center justify-center rounded-lg"
                onPress={handleSubmitOtp}
                disabled={submitting}
                activeOpacity={0.8}
                style={{opacity: submitting ? 0.7 : 1}}>
                {submitting ? (
                  <ActivityIndicator color="#404040" />
                ) : (
                  <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
                    Submit OTP
                  </Text>
                )}
              </TouchableOpacity>

              {/* Bottom Links */}
              <View className="items-center mt-6">
                <Text className="font-poppins-regular text-[16px] leading-[24px] text-[#4a5565] text-center">
                  Don't have an account?
                </Text>
                <TouchableOpacity
                  className="mt-1"
                  onPress={() => navigation?.navigate('Login')}>
                  <Text
                    className="font-poppins-regular text-[16px] leading-[24px] text-[#e48714] text-center">
                    Already have an account? Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default OtpVerificationScreen;
