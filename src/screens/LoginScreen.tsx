import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {sendOtp} from '../services/auth';

const otgLogo = require('../assets/login/source_OTG_Grey.png');

const LoginScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMobileChange = (value: string) => {
    setIdentifier(value.replace(/\D/g, '').slice(0, 10));
  };

  const handleSendOtp = async () => {
    const mobile = identifier.trim();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      Alert.alert(
        'Invalid mobile number',
        'Please enter a valid 10-digit Indian mobile number.',
      );
      return;
    }
    setLoading(true);
    try {
      await sendOtp(mobile);
      navigation?.navigate('OtpVerification', {identifier: mobile});
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to send OTP. Please try again.';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{backgroundColor: '#ffffff'}}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F9FAFB" />
            <Stop offset="1" stopColor="#F3F4F6" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
      </Svg>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F9FAFB"
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
                style={{backgroundColor: '#d9d9d9', overflow: 'hidden'}}>
                <Image
                  source={otgLogo}
                  style={{height: '90%', width: '90%'}}
                  resizeMode="contain"
                />
              </View>
              <Text
                className="text-[30px] leading-[36px] text-primary text-center"
                style={{fontFamily: 'Poppins-Bold'}}>
                ON THE GO
              </Text>
              <Text
                className="text-[16px] leading-[24px] text-[#4a5565] text-center mt-1"
                style={{fontFamily: 'Poppins-Regular'}}>
                Vendor Login
              </Text>
            </View>

            {/* Login Card */}
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
              <Text
                className="text-[24px] leading-[32px] text-primary mb-6"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Login
              </Text>

              {/* Mobile Number Field */}
              <View className="mb-4">
                <Text
                  className="text-[14px] leading-[20px] text-[#364153] mb-2"
                  style={{fontFamily: 'Poppins-Medium'}}>
                  Mobile Number
                </Text>
                <View className="border border-[#d1d5dc] rounded-lg px-4 h-[50px] justify-center">
                  <TextInput
                    className="text-[16px] text-primary p-0"
                    style={{fontFamily: 'Poppins-Regular'}}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="rgba(64,64,64,0.5)"
                    value={identifier}
                    onChangeText={handleMobileChange}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                className="bg-[#ffe403] h-12 items-center justify-center rounded-lg"
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.8}
                style={{opacity: loading ? 0.7 : 1}}>
                {loading ? (
                  <ActivityIndicator color="#404040" />
                ) : (
                  <Text
                    className="text-[16px] leading-[24px] text-primary text-center"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    Send OTP
                  </Text>
                )}
              </TouchableOpacity>

              {/* Register Link — new vendors register with the same
                  mobile + OTP. Sending the OTP first issues the auth token,
                  without which the onboarding steps fail ("No token provided").
                  So this triggers the same Send-OTP flow rather than jumping
                  straight to the registration form. */}
              <View className="items-center mt-6">
                <Text
                  className="text-[16px] leading-[24px] text-[#4a5565] text-center"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  Don't have an account?
                </Text>
                <TouchableOpacity className="mt-1" onPress={handleSendOtp}>
                  <Text
                    className="text-[16px] leading-[24px] text-[#e48714] text-center"
                    style={{fontFamily: 'Poppins-Medium'}}>
                    Register as Vendor
                  </Text>
                </TouchableOpacity>
                <Text
                  className="text-[12px] leading-[16px] text-[#9ca3af] text-center mt-1"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  Enter your mobile above and we'll send an OTP to get started.
                </Text>
              </View>
            </View>
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default LoginScreen;
