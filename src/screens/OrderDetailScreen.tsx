import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {
  fetchVendorOrder,
  updateVendorOrderStatus,
  VendorOrder,
} from '../services/orders';
import {
  OrdersMenuIcon,
  OrdersBellIcon,
  BackArrowIcon,
  StatusDot,
  CloseIcon,
  AcceptCheckIcon,
  XCircleIcon,
  QrCodeIcon,
  TruckIcon,
  PencilIcon,
  ChevronDownSmallIcon,
} from '../assets/orders/icons';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'QC Pending'
  | 'QC Approved'
  | 'Packed'
  | 'Dispatched'
  | 'Delivered';

const STATUS_CONFIG: Record<
  string,
  {textColor: string; bgColor: string; dotColor: string}
> = {
  Pending: {
    textColor: '#e48714',
    bgColor: 'rgba(228,135,20,0.13)',
    dotColor: '#e48714',
  },
  Accepted: {
    textColor: '#2196f3',
    bgColor: 'rgba(33,150,243,0.13)',
    dotColor: '#2196f3',
  },
  'QC Pending': {
    textColor: '#ff9800',
    bgColor: 'rgba(255,152,0,0.13)',
    dotColor: '#ff9800',
  },
  'QC Approved': {
    textColor: '#4caf50',
    bgColor: 'rgba(76,175,80,0.13)',
    dotColor: '#4caf50',
  },
  Packed: {
    textColor: '#9c27b0',
    bgColor: 'rgba(156,39,176,0.13)',
    dotColor: '#9c27b0',
  },
  Dispatched: {
    textColor: '#00bcd4',
    bgColor: 'rgba(0,188,212,0.13)',
    dotColor: '#00bcd4',
  },
  'In Transit': {
    textColor: '#00bcd4',
    bgColor: 'rgba(0,188,212,0.13)',
    dotColor: '#00bcd4',
  },
  Delivered: {
    textColor: '#4caf50',
    bgColor: 'rgba(76,175,80,0.13)',
    dotColor: '#4caf50',
  },
  Cancelled: {
    textColor: '#ef4444',
    bgColor: 'rgba(239,68,68,0.13)',
    dotColor: '#ef4444',
  },
};

const REJECT_REASONS = [
  'Out of stock',
  'Unable to meet deadline',
  'Pricing mismatch',
  'Specification issue',
  'Other',
];

const OrderDetailScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const {openSidebar} = useSidebar();
  const routeOrderId: string = route?.params?.orderId ?? '';

  const [order, setOrder] = useState<VendorOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!routeOrderId) {
      setLoadError('Missing order id');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError(null);
      const data = await fetchVendorOrder(routeOrderId);
      setOrder(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to load order';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [routeOrderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Fall back to route params while the API call is in flight so the header
  // doesn't flash empty state.
  const orderId = order?.id ?? routeOrderId ?? '';
  const status: OrderStatus = (order?.status as OrderStatus) ??
    (route?.params?.status as OrderStatus) ??
    'Pending';
  const category = order?.category ?? route?.params?.category ?? '';
  const quantity = order?.quantity ?? route?.params?.quantity ?? '';
  const location = order?.location || 'Not specified';
  const materialName = order?.materialName || '';

  // Fall back to the Pending palette for any status not in the map so an
  // unexpected/legacy status label can never crash the screen.
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectComments, setRejectComments] = useState('');

  const isQcApprovedOrPacked =
    status === 'QC Approved' || status === 'Packed';
  const isDispatchedOrDelivered =
    status === 'Dispatched' || status === 'Delivered';
  // Only a brand-new order can be accepted/rejected.
  const showAcceptReject = status === 'Pending';
  // Accepted but QC photos not uploaded yet -> let the vendor upload them.
  const isAccepted = status === 'Accepted';
  // QC submitted, waiting for admin approval -> no packing yet.
  const isQcPending = status === 'QC Pending';

  const handleAccept = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      await updateVendorOrderStatus(order.id, 'accept');
      navigation?.navigate('Dashboard', {
        successMessage: 'Accepted this order and proceed to QC upload?',
        nextScreen: 'QcUpload',
        nextParams: {orderId: order.id},
      });
    } catch (err: any) {
      Alert.alert(
        'Could not accept',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const reasonPayload = [rejectReason, rejectComments.trim()]
        .filter(Boolean)
        .join(' - ');
      await updateVendorOrderStatus(order.id, 'reject', reasonPayload);
      setRejectVisible(false);
      setRejectReason('');
      setRejectComments('');
      navigation?.goBack();
    } catch (err: any) {
      Alert.alert(
        'Could not reject',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#404040" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-6"
        style={{gap: 12}}>
        <Text
          className="text-[16px] text-primary text-center"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Couldn't load order
        </Text>
        <Text className="font-poppins-regular text-[14px] text-[#6a7282] text-center">
          {loadError}
        </Text>
        <View className="flex-row" style={{gap: 12}}>
          <TouchableOpacity
            className="bg-white rounded-xl px-4 py-2"
            style={{borderWidth: 1, borderColor: '#404040'}}
            activeOpacity={0.7}
            onPress={() => navigation?.goBack()}>
            <Text
              className="text-[14px] text-primary"
              style={{fontFamily: 'Poppins-Medium'}}>
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-primary rounded-xl px-4 py-2"
            activeOpacity={0.7}
            onPress={loadOrder}>
            <Text
              className="text-white text-[14px]"
              style={{fontFamily: 'Poppins-Medium'}}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
              Orders
            </Text>
          </View>
        </View>
        <NotificationBell Icon={OrdersBellIcon} />
      </View>

      {/* Sub Header - Order ID + Status */}
      <View
        className="bg-white px-2 pr-4"
        style={{
          height: 88,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}>
        <View className="flex-row items-center" style={{gap: 12, flex: 1}}>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-lg"
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}>
            <BackArrowIcon size={24} color="#404040" />
          </TouchableOpacity>
          <View style={{gap: 4, flex: 1}}>
            <Text
              className="text-[24px] leading-[36px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {orderId}
            </Text>
            <View className="flex-row items-center" style={{gap: 8}}>
              <StatusDot size={10} color={statusConfig.dotColor} />
              <View
                className="rounded-full px-2 py-1"
                style={{backgroundColor: statusConfig.bgColor}}>
                <Text
                  className="text-[12px] leading-[16px]"
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    color: statusConfig.textColor,
                  }}>
                  {status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 120, gap: 16}}>
        {/* Requirement — the vendor only needs to know what is required */}
        <View
          className="bg-white rounded-2xl p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
          }}>
          <Text
            className="text-[18px] leading-[27px] text-primary mb-3"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Requirement
          </Text>
          <View
            className="rounded-xl p-4"
            style={{backgroundColor: '#f9fafb', gap: 6}}>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {materialName || category || 'Material'}
            </Text>
            <View className="flex-row">
              <View className="flex-1">
                <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                  Quantity
                </Text>
                <Text
                  className="text-[14px] leading-[20px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  {quantity || '-'}
                </Text>
              </View>
              {category ? (
                <View className="flex-1">
                  <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                    Category
                  </Text>
                  <Text
                    className="text-[14px] leading-[20px] text-primary"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    {category}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Drop off / Delivery Location */}
        <View
          className="bg-white rounded-2xl p-4"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
          }}>
          <Text
            className="text-[18px] leading-[27px] text-primary mb-3"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Drop off Location
          </Text>
          <View className="bg-[#f9fafb] rounded-xl px-3 py-3">
            <Text
              className="text-[14px] leading-[20px] text-primary"
              style={{fontFamily: 'Poppins-Medium'}}>
              {location}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Buttons */}
      <View
        className="bg-white px-4 pt-4 pb-4"
        style={{
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 10,
        }}>
        {showAcceptReject ? (
          <View className="flex-row" style={{gap: 12}}>
            {/* Reject Button */}
            <TouchableOpacity
              className="flex-1 rounded-xl flex-row items-center justify-center bg-white"
              style={{
                height: 58,
                borderWidth: 1,
                borderColor: '#fb2c36',
                gap: 8,
              }}
              activeOpacity={0.7}
              onPress={() => setRejectVisible(true)}>
              <CloseIcon size={20} color="#fb2c36" />
              <Text
                className="text-[16px] leading-[24px]"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  color: '#fb2c36',
                }}>
                Reject
              </Text>
            </TouchableOpacity>

            {/* Accept Button */}
            <TouchableOpacity
              className="flex-1 bg-[#ffe403] rounded-xl flex-row items-center justify-center"
              style={{height: 58, gap: 8, opacity: submitting ? 0.6 : 1}}
              activeOpacity={0.8}
              disabled={submitting || !order}
              onPress={handleAccept}>
              {submitting ? (
                <ActivityIndicator size="small" color="#404040" />
              ) : (
                <>
                  <AcceptCheckIcon size={20} color="#404040" />
                  <Text
                    className="text-[16px] leading-[24px] text-primary"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    Accept
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : isAccepted ? (
          // Accepted — vendor must upload QC photos for admin review first.
          <TouchableOpacity
            className="rounded-xl flex-row items-center justify-center bg-[#ffe403]"
            style={{height: 58, gap: 8}}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('QcUpload', {orderId})}>
            <QrCodeIcon size={20} color="#404040" />
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Upload QC Photos
            </Text>
          </TouchableOpacity>
        ) : isQcPending ? (
          // QC submitted — waiting for admin to review & approve before packing.
          <View
            className="rounded-xl items-center justify-center"
            style={{
              minHeight: 58,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: 'rgba(255,152,0,0.13)',
              borderWidth: 1,
              borderColor: '#ff9800',
            }}>
            <Text
              className="text-[15px] leading-[22px] text-center"
              style={{fontFamily: 'Poppins-SemiBold', color: '#ff9800'}}>
              Waiting for admin QC approval
            </Text>
            <Text
              className="text-[12px] leading-[18px] text-center"
              style={{fontFamily: 'Poppins-Regular', color: '#6a7282'}}>
              You can pack the order once the admin approves your QC photos.
            </Text>
          </View>
        ) : isQcApprovedOrPacked ? (
          <TouchableOpacity
            className="rounded-xl flex-row items-center justify-center bg-[#ffe403]"
            style={{height: 58, gap: 8}}
            activeOpacity={0.8}
            onPress={() =>
              navigation?.navigate('PackDispatch', {orderId})
            }>
            <QrCodeIcon size={20} color="#404040" />
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Pack Order
            </Text>
          </TouchableOpacity>
        ) : isDispatchedOrDelivered ? (
          <TouchableOpacity
            className="rounded-xl flex-row items-center justify-center"
            style={{height: 58, gap: 8, backgroundColor: '#e48714'}}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('DispatchConfirmation', {orderId})}>
            <TruckIcon size={22} color="#fff" />
            <Text
              className="text-[16px] leading-[24px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Track Order
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Reject Invoice Modal */}
      <Modal
        visible={rejectVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectVisible(false)}>
        <Pressable
          className="flex-1 items-center justify-center px-4"
          style={{backgroundColor: 'rgba(0,0,0,0.41)'}}
          onPress={() => setRejectVisible(false)}>
          <KeyboardAvoidingView
            behavior="padding"
            style={{width: '100%', alignItems: 'center'}}>
          <Pressable
            className="bg-white rounded-2xl w-full"
            style={{maxWidth: 360, padding: 20, gap: 16}}
            onPress={() => {}}>
            <View className="items-center" style={{gap: 8}}>
              <XCircleIcon size={56} color="#ef4444" />
              <Text
                className="text-[20px] leading-[28px] text-primary"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Reject Invoice
              </Text>
              <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
                Order ID: {orderId}
              </Text>
            </View>

            <View style={{height: 1, backgroundColor: '#e5e7eb'}} />

            <View style={{gap: 8}}>
              <Text
                className="text-[14px] leading-[20px] text-primary"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Select the reason for rejecting this order:
              </Text>
              <Text
                className="text-[13px] leading-[18px] text-primary"
                style={{fontFamily: 'Poppins-Medium'}}>
                Select Reason<Text style={{color: '#ef4444'}}>*</Text>
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-xl bg-white px-3"
                style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                }}
                activeOpacity={0.7}
                onPress={() => setRejectReasonOpen(!rejectReasonOpen)}>
                <Text
                  className="font-poppins-regular text-[14px] leading-[20px]"
                  style={{
                    color: rejectReason ? '#404040' : 'rgba(64,64,64,0.4)',
                  }}>
                  {rejectReason || 'Select Reason'}
                </Text>
                <ChevronDownSmallIcon size={18} color="#6a7282" />
              </TouchableOpacity>
              {rejectReasonOpen && (
                <View
                  className="rounded-xl bg-white"
                  style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    overflow: 'hidden',
                  }}>
                  {REJECT_REASONS.map(reason => (
                    <TouchableOpacity
                      key={reason}
                      className="px-3 py-3"
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#f3f4f6',
                      }}
                      activeOpacity={0.6}
                      onPress={() => {
                        setRejectReason(reason);
                        setRejectReasonOpen(false);
                      }}>
                      <Text className="font-poppins-regular text-[14px] leading-[20px] text-primary">
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={{gap: 8}}>
              <Text
                className="text-[13px] leading-[18px] text-primary"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Additional Comments{' '}
                <Text className="font-poppins-regular text-[#6a7282]">
                  (Optional)
                </Text>
              </Text>
              <View
                className="rounded-xl bg-white px-3 py-2"
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  minHeight: 80,
                }}>
                <View className="flex-row items-start">
                  <TextInput
                    className="flex-1 text-[14px] text-primary"
                    style={{
                      fontFamily: 'Poppins-Regular',
                      textAlignVertical: 'top',
                      minHeight: 64,
                    }}
                    placeholder="Enter comments here..."
                    placeholderTextColor="rgba(64,64,64,0.4)"
                    multiline
                    value={rejectComments}
                    onChangeText={setRejectComments}
                  />
                  <View style={{marginTop: 4}}>
                    <PencilIcon size={14} color="#9ca3af" />
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row" style={{gap: 12}}>
              <TouchableOpacity
                className="flex-1 rounded-xl items-center justify-center bg-white"
                style={{
                  height: 47,
                  borderWidth: 1,
                  borderColor: '#404040',
                }}
                activeOpacity={0.7}
                onPress={() => setRejectVisible(false)}>
                <Text
                  className="text-[15px] leading-[22px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl items-center justify-center bg-[#ffe403]"
                style={{height: 47, opacity: submitting ? 0.6 : 1}}
                activeOpacity={0.8}
                disabled={submitting}
                onPress={handleReject}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#404040" />
                ) : (
                  <Text
                    className="text-[15px] leading-[22px] text-primary"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    Confirm Rejection
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Orders" />
    </View>
  );
};

export default OrderDetailScreen;
