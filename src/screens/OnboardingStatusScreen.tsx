import React from 'react';
import {View, Text, TouchableOpacity, StatusBar, Image} from 'react-native';
import GreenTickIcon from '../assets/registration/GreenTickIcon';

const otgLogo = require('../assets/registration/source_OTG_Grey.png');

const OnboardingStatusScreen: React.FC<{navigation?: any}> = ({
  navigation,
}) => {
  const handleGoToDashboard = () => {
    navigation?.reset({index: 0, routes: [{name: 'Dashboard'}]});
  };

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{backgroundColor: '#f9fafb'}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f9fafb"
        translucent
      />

      {/* Card */}
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
          <Image
            source={otgLogo}
            className="h-20 w-20"
            resizeMode="contain"
          />
        </View>

        {/* Onboarding Status Title */}
        <Text className="font-poppins-bold text-[24px] leading-[32px] text-primary text-center mb-4">
          Onboarding Status
        </Text>

        {/* Green Tick */}
        <View className="mb-4">
          <GreenTickIcon size={64} />
        </View>

        {/* Approved Text */}
        <Text
          className="text-[20px] leading-[28px] text-[#008236] text-center mb-2"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Approved!
        </Text>

        {/* Description */}
        <Text className="font-poppins-regular text-[16px] leading-[24px] text-[#4a5565] text-center mb-6 px-4">
          Congratulations! Your vendor account has been approved.
        </Text>

        {/* Go to Dashboard Button */}
        <TouchableOpacity
          className="bg-[#ffe403] h-12 items-center justify-center rounded-lg px-8"
          onPress={handleGoToDashboard}
          activeOpacity={0.8}>
          <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
            Go to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingStatusScreen;
