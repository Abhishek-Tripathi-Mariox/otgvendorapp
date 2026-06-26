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
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {
  OrdersMenuIcon,
  OrdersBellIcon,
  ChevronRightIcon,
  StatusDot,
} from '../assets/orders/icons';
import {
  fetchAssignedQuotations,
  VendorQuotation,
  QuotationFilter,
  QuotationStatus,
} from '../services/quotations';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

const FILTER_OPTIONS: QuotationFilter[] = [
  'All',
  'new',
  'quoted',
  'accepted',
  'rejected',
];

const FILTER_LABEL: Record<QuotationFilter, string> = {
  All: 'All',
  new: 'New',
  quoted: 'Quoted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
};

const STATUS_CONFIG: Record<
  QuotationStatus,
  {label: string; textColor: string; bgColor: string; dotColor: string}
> = {
  new: {
    label: 'New',
    textColor: '#1976d2',
    bgColor: 'rgba(25,118,210,0.13)',
    dotColor: '#1976d2',
  },
  quoted: {
    label: 'Quoted',
    textColor: '#e48714',
    bgColor: 'rgba(228,135,20,0.13)',
    dotColor: '#e48714',
  },
  accepted: {
    label: 'Accepted',
    textColor: '#15803d',
    bgColor: 'rgba(21,128,61,0.13)',
    dotColor: '#15803d',
  },
  rejected: {
    label: 'Rejected',
    textColor: '#b91c1c',
    bgColor: 'rgba(185,28,28,0.13)',
    dotColor: '#b91c1c',
  },
  expired: {
    label: 'Expired',
    textColor: '#6b7280',
    bgColor: 'rgba(107,114,128,0.13)',
    dotColor: '#6b7280',
  },
};

const formatINR = (n?: number | null): string =>
  n == null ? '' : `₹${Number(n).toLocaleString('en-IN')}`;

const itemSummary = (q: VendorQuotation): string => {
  if (Array.isArray(q.items) && q.items.length > 0) {
    const first =
      q.items[0].materialName ||
      q.items[0].subCategoryName ||
      q.items[0].categoryName ||
      'Material';
    const extra = q.items.length - 1;
    return extra > 0 ? `${first} +${extra} more` : first;
  }
  return q.category || q.materialRequirement || 'Material requirement';
};

const QuotationCard: React.FC<{
  quotation: VendorQuotation;
  onPress?: () => void;
}> = ({quotation, onPress}) => {
  const config = STATUS_CONFIG[quotation.status] || STATUS_CONFIG.new;
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3"
      style={{
        borderLeftWidth: 3.5,
        borderLeftColor: config.dotColor,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
      }}
      activeOpacity={0.7}
      onPress={onPress}>
      <View className="pl-5 pt-4 pr-4 pb-3" style={{gap: 12}}>
        {/* Header Row */}
        <View className="flex-row items-start justify-between">
          <View style={{gap: 4, flex: 1}}>
            <Text
              className="text-[18px] leading-[27px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {quotation.quotationCode}
            </Text>
            <Text
              className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]"
              numberOfLines={1}>
              {itemSummary(quotation)}
            </Text>
          </View>
          <ChevronRightIcon size={24} color="#9ca3af" />
        </View>

        {/* Customer + Price */}
        <View className="flex-row">
          <View className="flex-1">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              Customer
            </Text>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}
              numberOfLines={1}>
              {quotation.name || quotation.user?.name || '—'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              Quoted Price
            </Text>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {quotation.quotedPrice != null
                ? formatINR(quotation.quotedPrice)
                : 'Not quoted'}
            </Text>
          </View>
        </View>

        {/* Status Row */}
        <View
          className="flex-row items-center justify-between pt-2"
          style={{borderTopWidth: 1, borderTopColor: '#f3f4f6'}}>
          <View className="flex-row items-center" style={{gap: 8}}>
            <StatusDot size={10} color={config.dotColor} />
            <View
              className="rounded-full px-3 py-1"
              style={{backgroundColor: config.bgColor}}>
              <Text
                className="text-[12px] leading-[16px]"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  color: config.textColor,
                }}>
                {config.label}
              </Text>
            </View>
          </View>
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
            {new Date(quotation.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AssignedQuotationsScreen: React.FC<{navigation?: any}> = ({
  navigation,
}) => {
  const {openSidebar} = useSidebar();
  const [activeFilter, setActiveFilter] = useState<QuotationFilter>('All');
  const [quotations, setQuotations] = useState<VendorQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (showSpinner: boolean = true) => {
      try {
        if (showSpinner) setLoading(true);
        setError(null);
        const data = await fetchAssignedQuotations(activeFilter);
        setQuotations(data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load quotations';
        setError(msg);
        setQuotations([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter],
  );

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => load(false));
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(false);
  }, [load]);

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
              Quotations
            </Text>
          </View>
        </View>
        <NotificationBell Icon={OrdersBellIcon} />
      </View>

      {/* Filter pills */}
      <View
        className="bg-white"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
          zIndex: 10,
        }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16, paddingVertical: 12, gap: 8}}>
          {FILTER_OPTIONS.map(option => {
            const isActive = activeFilter === option;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(option)}
                className={`rounded-full px-4 ${
                  isActive ? 'bg-primary' : 'bg-[#f3f4f6]'
                }`}
                style={{height: 36, justifyContent: 'center'}}>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={{
                    fontFamily: 'Poppins-Medium',
                    color: isActive ? '#fff' : '#4a5565',
                  }}>
                  {FILTER_LABEL[option]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading ? (
          <View className="items-center justify-center" style={{paddingTop: 60}}>
            <ActivityIndicator size="large" color="#404040" />
          </View>
        ) : error ? (
          <View
            className="items-center justify-center"
            style={{paddingTop: 60, gap: 12}}>
            <Text className="font-poppins-regular text-[14px] text-[#c10007] text-center">
              {error}
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl px-4 py-2"
              activeOpacity={0.7}
              onPress={() => load(true)}>
              <Text
                className="text-white text-[14px]"
                style={{fontFamily: 'Poppins-Medium'}}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565] mb-3">
              Showing{' '}
              <Text
                className="text-[14px] leading-[20px] text-primary"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                {quotations.length}
              </Text>{' '}
              quotations
            </Text>

            {quotations.length === 0 ? (
              <View
                className="items-center justify-center"
                style={{paddingTop: 40, gap: 8}}>
                <Text
                  className="text-[16px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  No quotations yet
                </Text>
                <Text className="font-poppins-regular text-[13px] text-[#6a7282] text-center">
                  Quotations the admin assigns to you will appear here.
                </Text>
              </View>
            ) : (
              quotations.map(q => (
                <QuotationCard
                  key={q._id}
                  quotation={q}
                  onPress={() =>
                    navigation?.navigate('QuotationDetail', {id: q._id})
                  }
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AssignedQuotationsScreen;
