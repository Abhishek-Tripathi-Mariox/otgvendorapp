import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {
  fetchVendorOrder,
  VendorFulfilmentBooking,
} from '../services/orders';
import {
  OrdersMenuIcon,
  OrdersBellIcon,
  BackArrowIcon,
  CheckCircleIcon,
} from '../assets/orders/icons';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

interface InfoRowProps {
  label: string;
  value: string;
  valueColor?: string;
  badge?: boolean;
  showBorder?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  valueColor = '#404040',
  badge = false,
  showBorder = true,
}) => (
  <View
    className="flex-row items-center justify-between py-3"
    style={
      showBorder ? {borderBottomWidth: 1, borderBottomColor: '#f3f4f6'} : undefined
    }>
    <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
      {label}
    </Text>
    {badge ? (
      <View
        className="rounded-full px-3 py-1"
        style={{backgroundColor: 'rgba(34,197,94,0.15)'}}>
        <Text
          className="text-[12px] leading-[16px]"
          style={{fontFamily: 'Poppins-SemiBold', color: '#16a34a'}}>
          {value}
        </Text>
      </View>
    ) : (
      <Text
        className="text-[14px] leading-[20px]"
        style={{fontFamily: 'Poppins-SemiBold', color: valueColor}}>
        {value}
      </Text>
    )}
  </View>
);

// Render a human-friendly date (e.g. 24-Jan-2026) from an ISO/date string.
const formatDate = (value?: string | null): string => {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = parsed.toLocaleString('en-US', {month: 'short'});
  return `${day}-${month}-${parsed.getFullYear()}`;
};

const DispatchConfirmationScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const {openSidebar} = useSidebar();
  const routeBooking: VendorFulfilmentBooking | undefined =
    route?.params?.booking;
  const routeOrderId: string = route?.params?.orderId ?? '';

  const [booking, setBooking] = useState<VendorFulfilmentBooking | null>(
    routeBooking ?? null,
  );
  const [loading, setLoading] = useState(!routeBooking && !!routeOrderId);

  // If we weren't handed the booking via navigation (e.g. arriving from the
  // "Track Order" button on the order detail screen), fetch it by id so the
  // dispatch details below are real instead of hardcoded.
  useEffect(() => {
    if (routeBooking || !routeOrderId) {
      return;
    }
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = (await fetchVendorOrder(
          routeOrderId,
        )) as VendorFulfilmentBooking;
        if (active) {
          setBooking(data);
        }
      } catch {
        if (active) {
          setBooking(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [routeBooking, routeOrderId]);

  const orderId = booking?.id ?? routeOrderId ?? '';
  const dispatch = booking?.dispatch;
  const driverName = dispatch?.driverName || 'Auto-assigned';
  const vehicleNumber = dispatch?.vehicleNumber || 'To be assigned';
  const dispatchDate = formatDate(dispatch?.dispatchDate ?? booking?.deliveryDate);
  const statusLabel = booking?.status || 'Driver Assigned';

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#404040" />
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
            <View className="w-8 h-8 rounded-[10px]" style={{overflow: 'hidden'}}>
              <Image source={otgLogo} className="w-8 h-8" resizeMode="contain" />
            </View>
            <Text
              className="text-[16px] leading-[24px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Dispatch Confirmation
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
              className="text-[22px] leading-[30px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Dispatch Confirmation
            </Text>
            <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
              Order: {orderId}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 32}}>
        <View
          className="bg-white rounded-2xl p-6 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 5,
            gap: 16,
          }}>
          <CheckCircleIcon size={64} color="#22c55e" />
          <Text
            className="text-[22px] leading-[30px] text-primary text-center"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Ready for Dispatch
          </Text>

          <View className="w-full" style={{gap: 0}}>
            <InfoRow label="Driver Assigned:" value={driverName} />
            <InfoRow label="Vehicle Number:" value={vehicleNumber} />
            <InfoRow label="Dispatch Date:" value={dispatchDate} />
            <InfoRow label="Status:" value={statusLabel} badge showBorder={false} />
          </View>

          <Text className="font-poppins-regular text-[13px] leading-[18px] text-[#6a7282] text-center mt-2">
            POD (Proof of Delivery) will be required after delivery
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-xl items-center justify-center mt-4"
          style={{
            height: 56,
            backgroundColor: '#ffe403',
          }}
          activeOpacity={0.8}
          onPress={() => navigation?.navigate('Dashboard')}>
          <Text
            className="text-[16px] leading-[24px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar activeTab="Orders" />
    </View>
  );
};

export default DispatchConfirmationScreen;
