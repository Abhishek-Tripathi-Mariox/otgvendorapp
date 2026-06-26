import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RegistrationHeader from '../components/RegistrationHeader';
import DocumentSourceField, {
  PickedFile,
} from '../components/DocumentSourceField';
import {submitDocumentsStep} from '../services/auth';

const RegistrationStep3Screen: React.FC<{navigation?: any}> = ({
  navigation,
}) => {
  const [gstCertificate, setGstCertificate] = useState<PickedFile | null>(null);
  const [panCard, setPanCard] = useState<PickedFile | null>(null);
  const [tradeLicense, setTradeLicense] = useState<PickedFile | null>(null);
  const [bankDetails, setBankDetails] = useState<PickedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Document URLs are persisted once S3 upload is wired; for now this marks
      // onboarding complete so the vendor lands on the dashboard next login.
      await submitDocumentsStep({});
      navigation?.navigate('OnboardingStatus');
    } catch (err: any) {
      Alert.alert(
        'Could not submit',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    navigation?.goBack();
  };

  return (
    <View className="flex-1" style={{backgroundColor: '#f9fafb'}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f9fafb"
        translucent
      />
      <ScrollView
        className="flex-1"
        bounces={false}
        contentContainerStyle={{paddingVertical: 32}}>
        <View className="px-4">
          <RegistrationHeader currentStep={3} />

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
              Documents Upload
            </Text>

            {/* Upload Boxes */}
            <View style={{gap: 16}} className="mb-6">
              <DocumentSourceField
                label="GST Certificate*"
                file={gstCertificate}
                onPick={setGstCertificate}
              />
              <DocumentSourceField
                label="PAN Card*"
                file={panCard}
                onPick={setPanCard}
              />
              <DocumentSourceField
                label="Trade License*"
                file={tradeLicense}
                onPick={setTradeLicense}
              />
              <DocumentSourceField
                label="Bank Details (Cancelled Cheque)*"
                file={bankDetails}
                onPick={setBankDetails}
              />
            </View>

            {/* Previous / Submit Buttons */}
            <View className="flex-row" style={{gap: 16}}>
              <TouchableOpacity
                className="flex-1 border border-[#d1d5dc] h-11 items-center justify-center rounded-lg"
                onPress={handlePrevious}
                activeOpacity={0.7}>
                <Text className="font-poppins-semibold text-[16px] leading-[24px] text-[#364153] text-center">
                  Previous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#ffe403] h-11 items-center justify-center rounded-lg px-4"
                style={{minWidth: 165, opacity: submitting ? 0.7 : 1}}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}>
                {submitting ? (
                  <ActivityIndicator color="#404040" />
                ) : (
                  <Text className="font-poppins-semibold text-[16px] leading-[24px] text-primary text-center">
                    Submit for Review
                  </Text>
                )}
              </TouchableOpacity>
            </View>

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
      </ScrollView>
    </View>
  );
};

export default RegistrationStep3Screen;
