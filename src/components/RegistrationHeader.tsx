import React from 'react';
import {View, Text, Image} from 'react-native';

const otgLogo = require('../assets/registration/source_OTG_Grey.png');

interface RegistrationHeaderProps {
  currentStep: 1 | 2 | 3;
}

const RegistrationHeader: React.FC<RegistrationHeaderProps> = ({
  currentStep,
}) => {
  const steps = [1, 2, 3] as const;

  return (
    <View>
      {/* Logo + Title */}
      <View className="items-center mb-8">
        <View
          className="h-16 w-16 items-center justify-center rounded-[10px] mb-2"
          style={{overflow: 'hidden'}}>
          <Image
            source={otgLogo}
            className="h-16 w-16"
            resizeMode="contain"
          />
        </View>
        <Text className="font-poppins-bold text-[30px] leading-[36px] text-primary text-center">
          Vendor Registration
        </Text>
      </View>

      {/* Stepper */}
      <View className="flex-row items-center justify-between mb-8">
        {steps.map((step, index) => (
          <View key={step} className="flex-row items-center" style={{flex: index < 2 ? 1 : undefined}}>
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                step <= currentStep ? 'bg-[#ffe403]' : 'bg-[#d1d5dc]'
              }`}>
              <Text
                className={`text-[16px] leading-[24px] ${
                  step <= currentStep
                    ? 'text-primary'
                    : 'text-[#4a5565]'
                }`}
                style={{fontFamily: 'Poppins-SemiBold'}}>
                {step}
              </Text>
            </View>
            {index < 2 && (
              <View
                className={`flex-1 h-1 ${
                  step < currentStep ? 'bg-[#ffe403]' : 'bg-[#d1d5dc]'
                }`}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default RegistrationHeader;
