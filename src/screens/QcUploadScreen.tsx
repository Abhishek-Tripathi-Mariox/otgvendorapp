import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {launchImageLibrary} from 'react-native-image-picker';
import {submitVendorQc, uploadVendorImage} from '../services/orders';
import {
  OrdersMenuIcon,
  OrdersBellIcon,
  BackArrowIcon,
  CameraIcon,
  CloudUploadIcon,
} from '../assets/orders/icons';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

interface UploadCardProps {
  label: string;
  description: string;
  hint: string;
  selected: number;
  onChoose: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({
  label,
  description,
  hint,
  selected,
  onChoose,
}) => (
  <View style={{gap: 8}}>
    <Text
      className="text-[16px] leading-[24px] text-primary"
      style={{fontFamily: 'Poppins-SemiBold'}}>
      {label} <Text style={{color: '#ef4444'}}>*</Text>
    </Text>
    <View
      className="rounded-2xl items-center justify-center"
      style={{
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        paddingVertical: 24,
        paddingHorizontal: 16,
        gap: 12,
      }}>
      <View
        className="w-14 h-14 rounded-full items-center justify-center"
        style={{backgroundColor: '#f3f4f6'}}>
        <CameraIcon size={28} color="#6a7282" />
      </View>
      <Text
        className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565] text-center"
        style={{maxWidth: 220}}>
        {description}
      </Text>
      <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#9ca3af]">
        {hint}
      </Text>
      <TouchableOpacity
        className="flex-row items-center justify-center bg-[#ffe403] rounded-xl"
        style={{height: 44, paddingHorizontal: 20, gap: 8}}
        activeOpacity={0.8}
        onPress={onChoose}>
        <CloudUploadIcon size={20} color="#404040" />
        <Text
          className="text-[14px] leading-[20px] text-primary"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Choose Files
        </Text>
      </TouchableOpacity>
      {selected > 0 && (
        <Text
          className="text-[14px] leading-[20px]"
          style={{fontFamily: 'Poppins-SemiBold', color: '#22c55e'}}>
          {selected} file(s) selected
        </Text>
      )}
    </View>
  </View>
);

const QcUploadScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const {openSidebar} = useSidebar();
  const orderId = route?.params?.orderId ?? '';
  const [materialPhotos, setMaterialPhotos] = useState<string[]>([]);
  const [packagingPhotos, setPackagingPhotos] = useState<string[]>([]);
  const [uploadingKind, setUploadingKind] = useState<
    'material' | 'packaging' | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    materialPhotos.length > 0 &&
    packagingPhotos.length > 0 &&
    !submitting &&
    !uploadingKind &&
    !!orderId;

  // Pick a photo from the gallery, upload it to S3, and store the returned URL
  // so the admin can review the actual images during QC approval.
  const pickAndUpload = async (kind: 'material' | 'packaging') => {
    if (uploadingKind) return;
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 2000,
        maxHeight: 2000,
        selectionLimit: 1,
        includeBase64: true,
      });
      if (res.didCancel) return;
      if (res.errorCode === 'permission') {
        Alert.alert(
          'Permission needed',
          'Enable photo access in Settings to add QC photos.',
        );
        return;
      }
      const asset = res.assets?.[0];
      if (!asset?.base64) {
        Alert.alert('Could not read image', 'Please try another photo.');
        return;
      }
      const mime = asset.type || 'image/jpeg';
      const dataUri = `data:${mime};base64,${asset.base64}`;
      setUploadingKind(kind);
      const url = await uploadVendorImage(dataUri);
      if (kind === 'material') setMaterialPhotos(prev => [...prev, url]);
      else setPackagingPhotos(prev => [...prev, url]);
    } catch (err: any) {
      Alert.alert(
        'Upload failed',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setUploadingKind(null);
    }
  };

  const handleSubmit = async () => {
    if (!orderId) {
      Alert.alert('Missing order', 'Order id is missing for this QC upload.');
      return;
    }
    try {
      setSubmitting(true);
      await submitVendorQc(orderId, {
        materialPhotos,
        packagingPhotos,
        note: 'QC submitted from vendor app',
      });
      navigation?.navigate('Dashboard', {
        successMessage: 'QC photos submitted for approval!',
      });
    } catch (err: any) {
      Alert.alert(
        'Could not submit QC',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            <OrdersMenuIcon size={24} color="#fff" />
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
              QC Upload
            </Text>
          </View>
        </View>
        <NotificationBell Icon={OrdersBellIcon} />
      </View>

      {/* Sub Header */}
      <View
        className="bg-white px-2 pr-4"
        style={{
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}>
        <View className="flex-row items-center" style={{gap: 8}}>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-lg"
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}>
            <BackArrowIcon size={24} color="#404040" />
          </TouchableOpacity>
          <View style={{gap: 2, flex: 1}}>
            <Text
              className="text-[20px] leading-[28px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Quality Check Upload
            </Text>
            <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
              Order: {orderId}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 32, gap: 20}}>
        <UploadCard
          label="Material Photos"
          description="Upload clear front view of material"
          hint={uploadingKind === 'material' ? 'Uploading…' : 'Auto timestamp will be added'}
          selected={materialPhotos.length}
          onChoose={() => pickAndUpload('material')}
        />
        <UploadCard
          label="Packaging Photos"
          description="Upload packaging and labeling photos"
          hint={uploadingKind === 'packaging' ? 'Uploading…' : ''}
          selected={packagingPhotos.length}
          onChoose={() => pickAndUpload('packaging')}
        />

        {/* Guidelines */}
        <View
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#eff6ff',
            borderLeftWidth: 4,
            borderLeftColor: '#2563eb',
            gap: 8,
          }}>
          <Text
            className="text-[14px] leading-[20px]"
            style={{fontFamily: 'Poppins-SemiBold', color: '#1d4ed8'}}>
            QC Upload Guidelines:
          </Text>
          {[
            'Upload clear, well-lit photos',
            'Include material labels and batch numbers',
            'Show packaging quality',
            'All photos must be in focus',
          ].map(line => (
            <Text
              key={line}
              className="font-poppins-regular text-[13px] leading-[18px]"
              style={{color: '#1d4ed8'}}>
              {line}
            </Text>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="rounded-xl items-center justify-center"
          style={{
            height: 56,
            backgroundColor: canSubmit ? '#ffe403' : '#fef3c7',
          }}
          disabled={!canSubmit}
          activeOpacity={0.8}
          onPress={handleSubmit}>
          {submitting ? (
            <ActivityIndicator size="small" color="#404040" />
          ) : (
            <Text
              className="text-[16px] leading-[24px]"
              style={{
                fontFamily: 'Poppins-SemiBold',
                color: canSubmit ? '#404040' : '#a16207',
              }}>
              Submit QC for Approval
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar activeTab="Orders" />
    </View>
  );
};

export default QcUploadScreen;
