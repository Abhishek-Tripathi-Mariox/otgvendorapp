import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {
  MenuIcon,
  PaymentsCardIcon,
} from '../assets/dashboard/icons';
import {
  fetchVendorPayments,
  PaymentStatus,
  PaymentsSummary,
  VendorPayment,
} from '../services/orders';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

const formatINR = (n: number) =>
  Math.round(n || 0).toLocaleString('en-IN');

const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', {month: 'short'});
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const PaymentCard: React.FC<{payment: VendorPayment}> = ({payment}) => {
  const isPending = payment.status === 'Pending';
  const accent = isPending ? '#e48714' : '#00c950';
  const badgeBg = isPending ? 'rgba(228,135,20,0.13)' : 'rgba(0,201,80,0.13)';

  return (
    <View
      className="bg-white rounded-2xl mb-3 p-4"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: accent,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
        gap: 12,
      }}>
      <View className="flex-row items-start justify-between">
        <View style={{gap: 2}}>
          <Text
            className="text-[16px] leading-[24px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            {payment.orderId}
          </Text>
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
            {payment.payId}
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1"
          style={{backgroundColor: badgeBg}}>
          <Text
            className="text-[12px] leading-[16px]"
            style={{fontFamily: 'Poppins-SemiBold', color: accent}}>
            {payment.status}
          </Text>
        </View>
      </View>

      <View className="flex-row">
        <View className="flex-1">
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
            Amount
          </Text>
          <Text
            className="text-[18px] leading-[27px]"
            style={{fontFamily: 'Poppins-Bold', color: accent}}>
            ₹{formatINR(payment.amount)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
            Order Date
          </Text>
          <Text
            className="text-[14px] leading-[20px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            {formatDate(payment.orderDate)}
          </Text>
        </View>
      </View>

      {payment.settlementDate && (
        <View
          className="flex-row pt-3"
          style={{borderTopWidth: 1, borderTopColor: '#f3f4f6'}}>
          <View className="flex-1">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              Settlement Date
            </Text>
            <Text
              className="text-[13px] leading-[18px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {formatDate(payment.settlementDate)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              Method
            </Text>
            <Text
              className="text-[13px] leading-[18px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {payment.method || '—'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const EMPTY_SUMMARY: PaymentsSummary = {
  pendingTotal: 0,
  pendingCount: 0,
  completedTotal: 0,
  completedCount: 0,
  totalRevenue: 0,
};

const PaymentsScreen: React.FC<{navigation?: any}> = ({navigation: _nav}) => {
  const {openSidebar} = useSidebar();
  const [tab, setTab] = useState<PaymentStatus>('Pending');
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [summary, setSummary] = useState<PaymentsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchVendorPayments();
      setPayments(res.data);
      setSummary(res.summary);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Unable to load payments',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const visible = payments.filter(p => p.status === tab);

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
              Payments
            </Text>
          </View>
        </View>
        <NotificationBell />
      </View>

      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading && payments.length === 0 ? (
          <View className="items-center justify-center" style={{paddingTop: 60}}>
            <ActivityIndicator size="large" color="#e48714" />
            <Text className="font-poppins-regular text-[14px] text-[#6a7282] mt-3">
              Loading payments...
            </Text>
          </View>
        ) : (
          <>
            {error && (
              <View
                className="rounded-xl mb-4 p-3"
                style={{
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                }}>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={{fontFamily: 'Poppins-SemiBold', color: '#b91c1c'}}>
                  {error}
                </Text>
                <TouchableOpacity onPress={load} activeOpacity={0.7}>
                  <Text
                    className="text-[12px] leading-[16px] mt-1"
                    style={{fontFamily: 'Poppins-SemiBold', color: '#7f1d1d'}}>
                    Tap to retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Summary Cards */}
            <View className="flex-row" style={{gap: 12, marginBottom: 12}}>
              <View
                className="flex-1 rounded-2xl p-4"
                style={{backgroundColor: '#e48714', gap: 6}}>
                <Text
                  className="text-[12px] leading-[16px] text-white"
                  style={{fontFamily: 'Poppins-Medium'}}>
                  Pending
                </Text>
                <Text
                  className="text-[20px] leading-[28px] text-white"
                  style={{fontFamily: 'Poppins-Bold'}}>
                  ₹{formatINR(summary.pendingTotal)}
                </Text>
                <Text
                  className="text-[11px] leading-[14px] text-white"
                  style={{fontFamily: 'Poppins-Regular', opacity: 0.9}}>
                  {summary.pendingCount} orders
                </Text>
              </View>
              <View
                className="flex-1 rounded-2xl p-4"
                style={{backgroundColor: '#22c55e', gap: 6}}>
                <Text
                  className="text-[12px] leading-[16px] text-white"
                  style={{fontFamily: 'Poppins-Medium'}}>
                  Completed
                </Text>
                <Text
                  className="text-[20px] leading-[28px] text-white"
                  style={{fontFamily: 'Poppins-Bold'}}>
                  ₹{formatINR(summary.completedTotal)}
                </Text>
                <Text
                  className="text-[11px] leading-[14px] text-white"
                  style={{fontFamily: 'Poppins-Regular', opacity: 0.9}}>
                  {summary.completedCount} orders
                </Text>
              </View>
            </View>

            {/* Total Revenue Card */}
            <View
              className="rounded-2xl p-4 flex-row items-center mb-4"
              style={{backgroundColor: '#404040', gap: 12}}>
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{backgroundColor: 'rgba(255,255,255,0.15)'}}>
                <PaymentsCardIcon size={24} color="#fff" />
              </View>
              <View style={{flex: 1, gap: 2}}>
                <Text
                  className="text-[12px] leading-[16px] text-white"
                  style={{fontFamily: 'Poppins-Regular', opacity: 0.8}}>
                  Total Revenue
                </Text>
                <Text
                  className="text-[22px] leading-[30px] text-white"
                  style={{fontFamily: 'Poppins-Bold'}}>
                  ₹{formatINR(summary.totalRevenue)}
                </Text>
              </View>
            </View>

            {/* Tabs */}
            <View
              className="flex-row rounded-xl mb-4"
              style={{backgroundColor: '#f3f4f6', padding: 4}}>
              {(['Pending', 'Completed'] as PaymentStatus[]).map(t => {
                const active = tab === t;
                const count =
                  t === 'Pending' ? summary.pendingCount : summary.completedCount;
                return (
                  <TouchableOpacity
                    key={t}
                    className="flex-1 items-center justify-center rounded-lg"
                    style={{
                      height: 40,
                      backgroundColor: active ? '#fff' : 'transparent',
                      shadowColor: active ? '#000' : 'transparent',
                      shadowOffset: {width: 0, height: 1},
                      shadowOpacity: active ? 0.08 : 0,
                      shadowRadius: 2,
                      elevation: active ? 2 : 0,
                    }}
                    activeOpacity={0.7}
                    onPress={() => setTab(t)}>
                    <Text
                      className="text-[14px] leading-[20px]"
                      style={{
                        fontFamily: active
                          ? 'Poppins-SemiBold'
                          : 'Poppins-Medium',
                        color: active ? '#e48714' : '#6a7282',
                      }}>
                      {t} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Payment list */}
            {visible.length === 0 ? (
              <View
                className="items-center justify-center bg-white rounded-2xl"
                style={{paddingVertical: 32, paddingHorizontal: 16}}>
                <Text
                  className="text-[14px] leading-[20px] text-[#6a7282] text-center"
                  style={{fontFamily: 'Poppins-Medium'}}>
                  No {tab.toLowerCase()} payments yet
                </Text>
              </View>
            ) : (
              visible.map(p => <PaymentCard key={p.payId} payment={p} />)
            )}
          </>
        )}
      </ScrollView>

      <BottomNavBar activeTab="Home" />
    </View>
  );
};

export default PaymentsScreen;
