import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {useSidebar} from '../components/SidebarProvider';
import {CheckCircleIcon} from '../assets/orders/icons';
import {
  MenuIcon,
  CartIcon,
  CartIcon24,
  SyncIcon,
  TruckIcon,
  PaymentCheckIcon,
  QcPendingIcon,
  DispatchCheckIcon,
  InTransitTruckIcon,
  DelayedIcon,
  ToolsIcon,
  InvoiceDocIcon,
} from '../assets/dashboard/icons';
import NotificationBell from '../components/NotificationBell';
import {
  fetchVendorDashboard,
  VendorDashboard,
} from '../services/dashboard';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  borderColor,
  label,
  value,
}) => (
  <View
    className="flex-1 bg-white rounded-2xl"
    style={{
      height: 140,
      borderLeftWidth: 3.5,
      borderLeftColor: borderColor,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    }}>
    <View className="p-4">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{backgroundColor: iconBg}}>
        {icon}
      </View>
      <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#4a5565]">
        {label}
      </Text>
      <Text className="font-poppins-bold text-[30px] leading-[36px] text-primary">
        {value}
      </Text>
    </View>
  </View>
);

interface OperationRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  count?: number;
  countColor?: string;
  showBorder?: boolean;
}

const OperationRow: React.FC<OperationRowProps> = ({
  icon,
  iconBg,
  title,
  subtitle,
  count,
  countColor,
  showBorder = true,
}) => (
  <View
    className={`flex-row items-center justify-between py-2 ${
      showBorder ? 'border-b border-[#f3f4f6]' : ''
    }`}
    style={{minHeight: 56}}>
    <View className="flex-row items-center flex-1" style={{gap: 12}}>
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{backgroundColor: iconBg}}>
        {icon}
      </View>
      <View>
        <Text
          className="text-[14px] leading-[20px] text-primary"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          {title}
        </Text>
        <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
          {subtitle}
        </Text>
      </View>
    </View>
    {count !== undefined && count > 0 && (
      <Text
        className="text-[20px] leading-[28px]"
        style={{fontFamily: 'Poppins-Bold', color: countColor}}>
        {count}
      </Text>
    )}
  </View>
);

interface WeeklyChartProps {
  data: {date: string; orders: number}[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({data}) => {
  const max = Math.max(1, ...data.map(d => d.orders));
  const dayLabels = data.map(d => {
    const date = new Date(d.date);
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
  });
  return (
    <View style={{height: 96}}>
      <View
        className="flex-row items-end justify-between"
        style={{height: 72, gap: 6}}>
        {data.map((d, i) => {
          const heightPx = Math.max(2, (d.orders / max) * 72);
          return (
            <View key={d.date} className="flex-1 items-center justify-end">
              <Text
                className="font-poppins-regular text-[10px] text-[#6a7282]"
                style={{marginBottom: 2}}>
                {d.orders > 0 ? d.orders : ''}
              </Text>
              <View
                style={{
                  width: '70%',
                  height: heightPx,
                  backgroundColor: '#e48714',
                  borderRadius: 4,
                  opacity: d.orders === 0 ? 0.25 : 1,
                }}
              />
              <Text
                className="font-poppins-regular text-[10px] text-[#6a7282]"
                style={{marginTop: 4}}>
                {dayLabels[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const DashboardScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const successMessage: string | undefined = route?.params?.successMessage;
  const nextScreen: string | undefined = route?.params?.nextScreen;
  const nextParams: any = route?.params?.nextParams;
  const [successVisible, setSuccessVisible] = useState(false);
  const {openSidebar} = useSidebar();

  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchVendorDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load dashboard',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', () => {
      loadDashboard();
    });
    return unsub;
  }, [navigation, loadDashboard]);

  useEffect(() => {
    if (successMessage) {
      setSuccessVisible(true);
      navigation?.setParams({successMessage: undefined});
    }
  }, [successMessage, navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, [loadDashboard]);

  const dismissSuccess = () => {
    setSuccessVisible(false);
    if (nextScreen) {
      navigation?.navigate(nextScreen, nextParams);
    }
  };

  const stats = dashboard?.statCards;
  const ops = dashboard?.operations;
  const weekly = dashboard?.weeklyOrders || [];

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
            <MenuIcon size={24} color="#fff" />
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
              Dashboard
            </Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading && !dashboard ? (
          <View className="items-center justify-center" style={{paddingTop: 60}}>
            <ActivityIndicator size="large" color="#e48714" />
            <Text className="font-poppins-regular text-[14px] text-[#6a7282] mt-3">
              Loading dashboard...
            </Text>
          </View>
        ) : (
          <>
            {error && (
              <View
                className="rounded-xl mb-4 p-3"
                style={{backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca'}}>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={{fontFamily: 'Poppins-SemiBold', color: '#b91c1c'}}>
                  {error}
                </Text>
                <TouchableOpacity onPress={loadDashboard} activeOpacity={0.7}>
                  <Text
                    className="text-[12px] leading-[16px] mt-1"
                    style={{fontFamily: 'Poppins-SemiBold', color: '#7f1d1d'}}>
                    Tap to retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Stat Cards - Row 1 */}
            <View className="flex-row mb-4" style={{gap: 16}}>
              <StatCard
                icon={<CartIcon size={20} color="#404040" />}
                iconBg="#ffe403"
                borderColor="#ffe403"
                label="New Orders"
                value={stats?.newOrders ?? 0}
              />
              <StatCard
                icon={<SyncIcon size={20} color="#fff" />}
                iconBg="#e48714"
                borderColor="#e48714"
                label="In Progress"
                value={stats?.inProgress ?? 0}
              />
            </View>

            {/* Stat Cards - Row 2 */}
            <View className="flex-row mb-4" style={{gap: 16}}>
              <StatCard
                icon={<TruckIcon size={20} color="#fff" />}
                iconBg="#404040"
                borderColor="#404040"
                label="Today's Dispatch"
                value={stats?.todayDispatch ?? 0}
              />
              <StatCard
                icon={<PaymentCheckIcon size={20} color="#00A63E" />}
                iconBg="#dcfce7"
                borderColor="#00c950"
                label="Pending Payment"
                value={stats?.pendingPayment ?? 0}
              />
            </View>

            {/* Weekly Orders */}
            <View
              className="bg-white rounded-2xl p-4 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-[18px] leading-[27px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Weekly Orders
                </Text>
                <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                  Last 7 days
                </Text>
              </View>
              {weekly.length > 0 ? (
                <WeeklyChart data={weekly} />
              ) : (
                <View className="h-20 items-center justify-center">
                  <Text className="font-poppins-regular text-[12px] text-[#6a7282]">
                    No data yet
                  </Text>
                </View>
              )}
            </View>

            {/* Operations Snapshot */}
            <View
              className="bg-white rounded-2xl p-4 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}>
              <Text
                className="text-[18px] leading-[27px] text-primary mb-4"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Operations Snapshot
              </Text>

              <OperationRow
                icon={<QcPendingIcon size={20} color="#E48714" />}
                iconBg="#fefce8"
                title="QC Pending"
                subtitle="Awaiting QC upload"
                count={ops?.qcPending ?? 0}
                countColor="#e48714"
              />
              <OperationRow
                icon={<DispatchCheckIcon size={20} color="#00A63E" />}
                iconBg="#f0fdf4"
                title="Ready for Dispatch"
                subtitle="QC approved & packed"
                count={ops?.readyForDispatch ?? 0}
                countColor="#00a63e"
              />
              <OperationRow
                icon={<InTransitTruckIcon size={20} color="#155DFC" />}
                iconBg="#eff6ff"
                title="In Transit"
                subtitle="Out for delivery"
                count={ops?.inTransit ?? 0}
                countColor="#155DFC"
              />
              <OperationRow
                icon={<DelayedIcon size={20} color="#E7000B" />}
                iconBg="#fef2f2"
                title="Delayed"
                subtitle="Past expected date"
                count={ops?.delayed ?? 0}
                countColor="#E7000B"
                showBorder={false}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row" style={{gap: 12}}>
              <TouchableOpacity
                className="flex-1 bg-[#ffe403] rounded-2xl items-center justify-center"
                style={{
                  height: 100,
                  gap: 8,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                }}
                activeOpacity={0.8}
                onPress={() => navigation?.navigate('OrderList')}>
                <CartIcon24 size={24} color="#404040" />
                <Text
                  className="text-[14px] leading-[20px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  View New Orders
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-[#e48714] rounded-2xl items-center justify-center"
                style={{
                  height: 100,
                  gap: 8,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 5,
                }}
                activeOpacity={0.8}
                onPress={() => navigation?.navigate('AddNewMaterial')}>
                <ToolsIcon size={24} color="#fff" />
                <Text
                  className="text-[14px] leading-[20px] text-white"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Add New Material
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quotations entry */}
            <TouchableOpacity
              className="bg-primary rounded-2xl items-center justify-center flex-row mt-3"
              style={{
                height: 64,
                gap: 10,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 5,
              }}
              activeOpacity={0.8}
              onPress={() => navigation?.navigate('AssignedQuotations')}>
              <InvoiceDocIcon size={22} color="#ffe403" />
              <Text
                className="text-[14px] leading-[20px] text-white"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                View Assigned Quotations
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Home" />

      {/* Success Modal */}
      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissSuccess}>
        <Pressable
          className="flex-1 items-center justify-center px-6"
          style={{backgroundColor: 'rgba(0,0,0,0.41)'}}
          onPress={dismissSuccess}>
          <Pressable
            className="bg-white rounded-2xl items-center"
            style={{
              paddingVertical: 32,
              paddingHorizontal: 24,
              gap: 20,
              width: '100%',
              maxWidth: 340,
            }}
            onPress={() => {}}>
            <CheckCircleIcon size={64} color="#22c55e" />
            <Text
              className="text-[20px] leading-[28px] text-primary text-center"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {successMessage}
            </Text>
            {nextScreen ? (
              <TouchableOpacity
                className="rounded-xl items-center justify-center bg-[#ffe403]"
                style={{height: 48, paddingHorizontal: 24}}
                activeOpacity={0.8}
                onPress={dismissSuccess}>
                <Text
                  className="text-[15px] leading-[22px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  Continue
                </Text>
              </TouchableOpacity>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default DashboardScreen;
