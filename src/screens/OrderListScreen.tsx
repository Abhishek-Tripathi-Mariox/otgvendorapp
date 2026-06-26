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
  RefreshControl,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {
  OrdersMenuIcon,
  OrdersBellIcon,
  SearchIcon,
  FilterIcon,
  ChevronRightIcon,
  StatusDot,
} from '../assets/orders/icons';
import {
  fetchVendorOrders,
  VendorOrder,
  OrderStatus as ApiOrderStatus,
} from '../services/orders';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

type OrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'QC Pending'
  | 'QC Approved'
  | 'Packed'
  | 'Dispatched'
  | 'Delivered';

type FilterOption = 'All Orders' | OrderStatus;

const FILTER_OPTIONS: FilterOption[] = [
  'All Orders',
  'Pending',
  'Accepted',
  'QC Pending',
  'QC Approved',
  'Packed',
  'Dispatched',
  'Delivered',
];

type Order = VendorOrder;

const STATUS_CONFIG: Record<
  string,
  {borderColor: string; textColor: string; bgColor: string; dotColor: string}
> = {
  Pending: {
    borderColor: '#e48714',
    textColor: '#e48714',
    bgColor: 'rgba(228,135,20,0.13)',
    dotColor: '#e48714',
  },
  Accepted: {
    borderColor: '#2196f3',
    textColor: '#2196f3',
    bgColor: 'rgba(33,150,243,0.13)',
    dotColor: '#2196f3',
  },
  'QC Pending': {
    borderColor: '#ff9800',
    textColor: '#ff9800',
    bgColor: 'rgba(255,152,0,0.13)',
    dotColor: '#ff9800',
  },
  'QC Approved': {
    borderColor: '#4caf50',
    textColor: '#4caf50',
    bgColor: 'rgba(76,175,80,0.13)',
    dotColor: '#4caf50',
  },
  Packed: {
    borderColor: '#9c27b0',
    textColor: '#9c27b0',
    bgColor: 'rgba(156,39,176,0.13)',
    dotColor: '#9c27b0',
  },
  Dispatched: {
    borderColor: '#00bcd4',
    textColor: '#00bcd4',
    bgColor: 'rgba(0,188,212,0.13)',
    dotColor: '#00bcd4',
  },
  'In Transit': {
    borderColor: '#00bcd4',
    textColor: '#00bcd4',
    bgColor: 'rgba(0,188,212,0.13)',
    dotColor: '#00bcd4',
  },
  Delivered: {
    borderColor: '#4caf50',
    textColor: '#4caf50',
    bgColor: 'rgba(76,175,80,0.13)',
    dotColor: '#4caf50',
  },
  Cancelled: {
    borderColor: '#ef4444',
    textColor: '#ef4444',
    bgColor: 'rgba(239,68,68,0.13)',
    dotColor: '#ef4444',
  },
};

const OrderCard: React.FC<{order: Order; onPress?: () => void}> = ({
  order,
  onPress,
}) => {
  // Fall back to the Pending palette for any unmapped/legacy status so the
  // card can never crash on an undefined config.
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-3"
      style={{
        borderLeftWidth: 3.5,
        borderLeftColor: config.borderColor,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
      }}
      activeOpacity={0.7}
      onPress={onPress}>
      <View className="pl-5 pt-4 pr-4 pb-3" style={{gap: 12}}>
        {/* Header Row: Order ID + Chevron */}
        <View className="flex-row items-start justify-between">
          <View style={{gap: 4}}>
            <Text
              className="text-[18px] leading-[27px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {order.id}
            </Text>
            <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
              {order.category}
            </Text>
          </View>
          <ChevronRightIcon size={24} color="#9ca3af" />
        </View>

        {/* Quantity + Delivery Date Row */}
        <View className="flex-row">
          <View className="flex-1">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              Quantity
            </Text>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {order.quantity}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
              Delivery Date
            </Text>
            <Text
              className="text-[16px] leading-[24px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              {order.deliveryDate}
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
                {order.status}
              </Text>
            </View>
          </View>
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
            Due: {order.deliveryDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const OrderListScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All Orders');
  const [searchText, setSearchText] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (showSpinner: boolean = true) => {
      try {
        if (showSpinner) setLoading(true);
        setError(null);
        const data = await fetchVendorOrders(
          activeFilter as ApiOrderStatus | 'All Orders',
        );
        setOrders(data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load orders';
        setError(msg);
        setOrders([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilter],
  );

  useEffect(() => {
    loadOrders(true);
  }, [loadOrders]);

  // Reload when the screen regains focus so newly placed orders show up.
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadOrders(false);
    });
    return unsubscribe;
  }, [navigation, loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(false);
  }, [loadOrders]);

  const filteredOrders = orders.filter(o => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.category || '').toLowerCase().includes(q) ||
      (o.materialName || '').toLowerCase().includes(q)
    );
  });

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

      {/* Search + Filter Bar */}
      <View
        className="bg-white px-4 pt-4 pb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
          zIndex: 10,
        }}>
        <View className="flex-row items-center" style={{gap: 12}}>
          {/* Search Input */}
          <View
            className="flex-1 flex-row items-center border border-[#d1d5db] rounded-xl"
            style={{height: 50}}>
            <View className="pl-3">
              <SearchIcon size={20} color="rgba(64,64,64,0.5)" />
            </View>
            <TextInput
              className="flex-1 px-3 text-[16px] text-primary"
              style={{height: 50, fontFamily: 'Poppins-Regular'}}
              placeholder="Search orders..."
              placeholderTextColor="rgba(64,64,64,0.5)"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            className="bg-primary rounded-xl flex-row items-center justify-center"
            style={{height: 50, width: 94, gap: 8}}
            activeOpacity={0.7}
            onPress={() => setFilterOpen(true)}>
            <FilterIcon size={20} color="#fff" />
            <Text
              className="text-[14px] leading-[20px] text-white"
              style={{fontFamily: 'Poppins-Medium'}}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>
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
              onPress={() => loadOrders(true)}>
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
                {filteredOrders.length}
              </Text>{' '}
              orders
            </Text>

            {filteredOrders.length === 0 ? (
              <View
                className="items-center justify-center"
                style={{paddingTop: 40, gap: 8}}>
                <Text
                  className="text-[16px] text-primary"
                  style={{fontFamily: 'Poppins-SemiBold'}}>
                  No orders yet
                </Text>
                <Text className="font-poppins-regular text-[13px] text-[#6a7282] text-center">
                  Orders assigned to you will appear here.
                </Text>
              </View>
            ) : (
              filteredOrders.map(order => (
                <OrderCard
                  key={order._id || order.id}
                  order={order}
                  onPress={() =>
                    navigation?.navigate('OrderDetail', {
                      orderId: order.id,
                      status: order.status,
                      category: order.category,
                      quantity: order.quantity,
                      deliveryDate: order.deliveryDate,
                    })
                  }
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Dropdown Modal */}
      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}>
        <Pressable
          className="flex-1"
          onPress={() => setFilterOpen(false)}>
          <View
            className="bg-white rounded-xl"
            style={{
              position: 'absolute',
              top: 122,
              right: 16,
              width: 200,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 5},
              shadowOpacity: 0.2,
              shadowRadius: 14,
              elevation: 10,
              overflow: 'hidden',
            }}>
            {FILTER_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                className="px-4 py-3"
                style={
                  activeFilter === option
                    ? {backgroundColor: 'rgba(25,118,210,0.08)'}
                    : undefined
                }
                onPress={() => {
                  setActiveFilter(option);
                  setFilterOpen(false);
                }}
                activeOpacity={0.6}>
                <Text
                  className="text-[16px] leading-[24px]"
                  style={{
                    fontFamily: 'Roboto',
                    color: 'rgba(0,0,0,0.87)',
                  }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Orders" />
    </View>
  );
};

export default OrderListScreen;
