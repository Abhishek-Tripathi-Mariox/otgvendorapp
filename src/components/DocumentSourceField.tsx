import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import {
  pick,
  types as docTypes,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import UploadIcon from '../assets/registration/UploadIcon';

export interface PickedFile {
  name: string;
  uri: string;
  type?: string;
}

const assetFromResponse = (r: ImagePickerResponse): Asset | null => {
  if (r.didCancel || r.errorCode) return null;
  const a = r.assets?.[0];
  if (!a?.uri) return null;
  return a;
};

// CAMERA is declared in the manifest, so Android requires a runtime grant
// before launchCamera will open — without this it silently does nothing.
const ensureCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera permission',
        message: 'Allow camera access to capture a document.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

type Props = {
  label: string;
  file: PickedFile | null;
  onPick: (file: PickedFile) => void;
};

const DocumentSourceField: React.FC<Props> = ({label, file, onPick}) => {
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleCamera = async () => {
    setSheetVisible(false);
    const allowed = await ensureCameraPermission();
    if (!allowed) {
      Alert.alert(
        'Camera permission needed',
        'Enable camera access in Settings to capture a document.',
      );
      return;
    }
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 2000,
        maxHeight: 2000,
        saveToPhotos: false,
      });
      if (res.errorCode === 'permission') {
        Alert.alert(
          'Camera permission needed',
          'Enable camera access in Settings to capture a document.',
        );
        return;
      }
      const asset = assetFromResponse(res);
      if (!asset?.uri) return;
      onPick({
        name: asset.fileName || 'photo.jpg',
        uri: asset.uri,
        type: asset.type,
      });
    } catch {
      Alert.alert('Error', 'Could not open the camera.');
    }
  };

  const handleGallery = async () => {
    setSheetVisible(false);
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 2000,
        maxHeight: 2000,
        selectionLimit: 1,
      });
      if (res.errorCode === 'permission') {
        Alert.alert(
          'Gallery permission needed',
          'Enable photo access in Settings to pick a document.',
        );
        return;
      }
      const asset = assetFromResponse(res);
      if (!asset?.uri) return;
      onPick({
        name: asset.fileName || 'image.jpg',
        uri: asset.uri,
        type: asset.type,
      });
    } catch {
      Alert.alert('Error', 'Could not open the gallery.');
    }
  };

  const handleFiles = async () => {
    setSheetVisible(false);
    try {
      const [doc] = await pick({
        type: [docTypes.pdf, docTypes.images],
        allowMultiSelection: false,
      });
      if (!doc?.uri) return;
      onPick({
        name: doc.name || 'document',
        uri: doc.uri,
        type: doc.type ?? undefined,
      });
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      Alert.alert('Error', 'Could not open the file manager.');
    }
  };

  return (
    <View>
      <TouchableOpacity
        className="border border-[#d1d5dc] rounded-lg items-center justify-center py-6 px-6"
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.7}
        style={{minHeight: 144}}>
        <UploadIcon size={35} />
        <Text
          className="text-[14px] leading-[20px] text-[#364153] text-center mt-3"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          {label}
        </Text>
        {file ? (
          <Text
            className="font-poppins-regular text-[12px] text-[#4a5565] mt-1 text-center"
            numberOfLines={1}>
            {file.name}
          </Text>
        ) : (
          <Text className="font-poppins-regular text-[12px] text-[#9ca3af] mt-1 text-center">
            Camera, Gallery or File (PDF)
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={sheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetVisible(false)}>
        <Pressable
          onPress={() => setSheetVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#ffffff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 20,
              paddingBottom: 32,
              paddingHorizontal: 16,
              gap: 12,
            }}>
            <Text
              className="text-[16px] leading-[24px] text-primary text-center mb-1"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {label}
            </Text>
            <SheetButton label="Take Photo" onPress={handleCamera} />
            <SheetButton label="Choose from Gallery" onPress={handleGallery} />
            <SheetButton label="Choose File (PDF)" onPress={handleFiles} />
            <SheetButton
              label="Cancel"
              onPress={() => setSheetVisible(false)}
              variant="cancel"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const SheetButton: React.FC<{
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'cancel';
}> = ({label, onPress, variant = 'primary'}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="h-[48px] rounded-lg items-center justify-center"
    style={{backgroundColor: variant === 'cancel' ? '#f5f5f5' : '#ffe403'}}>
    <Text
      className="text-[14px] leading-[20px]"
      style={{
        fontFamily: 'Poppins-SemiBold',
        color: variant === 'cancel' ? '#757575' : '#404040',
      }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default DocumentSourceField;
