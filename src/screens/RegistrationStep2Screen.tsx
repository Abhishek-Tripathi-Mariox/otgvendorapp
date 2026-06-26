import React, {useEffect, useState} from 'react';
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
import CheckboxIcon from '../assets/registration/CheckboxIcon';
import {fetchCategories, Category} from '../services/catalog';
import {getStoredVendor, saveCategoriesStep} from '../services/auth';

const RegistrationStep2Screen: React.FC<{navigation?: any}> = ({
  navigation,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    fetchCategories()
      .then(data => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load categories. Please retry.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore previously-selected categories on resume.
  useEffect(() => {
    getStoredVendor().then(vendor => {
      if (vendor?.categories?.length) setSelectedCategories(vendor.categories);
    });
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      await saveCategoriesStep(selectedCategories);
      navigation?.navigate('RegistrationStep3');
    } catch (err: any) {
      Alert.alert(
        'Could not save',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setSaving(false);
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
          <RegistrationHeader currentStep={2} />

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
              Categories Supplied
            </Text>

            {/* Category Checkboxes */}
            {loading ? (
              <View className="mb-4 items-center py-6">
                <ActivityIndicator color="#404040" />
              </View>
            ) : loadError ? (
              <View className="mb-4 items-center py-6">
                <Text
                  className="text-[14px] leading-[20px] text-[#fb2c36] text-center"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  {loadError}
                </Text>
              </View>
            ) : categories.length === 0 ? (
              <View className="mb-4 items-center py-6">
                <Text
                  className="text-[14px] leading-[20px] text-[#6b7280] text-center"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  No categories available yet.
                </Text>
              </View>
            ) : (
              <View style={{gap: 12}} className="mb-4">
                {categories.map(category => (
                  <TouchableOpacity
                    key={category._id}
                    className="flex-row items-center border border-[#d1d5dc] rounded-lg h-[58px] px-4"
                    onPress={() => toggleCategory(category._id)}
                    activeOpacity={0.7}
                    style={{gap: 12}}>
                    <CheckboxIcon
                      checked={selectedCategories.includes(category._id)}
                      size={20}
                    />
                    <Text
                      className="text-[16px] leading-[24px] text-[#364153]"
                      style={{fontFamily: 'Poppins-SemiBold'}}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Previous / Next Buttons */}
            <View className="flex-row" style={{gap: 16}}>
              <TouchableOpacity
                className="flex-1 border border-[#d1d5dc] h-[50px] items-center justify-center rounded-lg"
                onPress={handlePrevious}
                activeOpacity={0.7}>
                <Text className="font-poppins-semibold text-[16px] leading-[24px] text-[#364153] text-center">
                  Previous
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#ffe403] h-[50px] items-center justify-center rounded-lg"
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

export default RegistrationStep2Screen;
