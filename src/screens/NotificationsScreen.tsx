import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';
import {MenuIcon, CartIcon} from '../assets/dashboard/icons';
import NotificationBell from '../components/NotificationBell';
import {useNotifications} from '../components/NotificationsProvider';
import {useSidebar} from '../components/SidebarProvider';
import {
  VendorNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification as deleteNotificationApi,
} from '../services/vendorService';

interface IconProps {
  size?: number;
  color?: string;
}

const BackArrowIcon: React.FC<IconProps> = ({size = 24, color = '#404040'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
      fill={color}
    />
  </Svg>
);

const CheckAllIcon: React.FC<IconProps> = ({size = 20, color = '#E48714'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"
      fill={color}
    />
  </Svg>
);

const TrashIcon: React.FC<IconProps> = ({size = 20, color = '#99a1af'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      fill={color}
    />
  </Svg>
);

const InfoIcon: React.FC<IconProps> = ({size = 20, color = '#6a7282'}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      fill={color}
    />
  </Svg>
);

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

// Format an ISO date as "x mins ago / y hours ago / z days ago".
const formatRelativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (!then || Number.isNaN(then)) return '';
  const diffSec = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return `${diffSec} sec ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
};

// Notifications less than 24h old belong in the "New" group.
const isNewGroup = (iso: string): boolean => {
  const then = new Date(iso).getTime();
  return Date.now() - then < 24 * 60 * 60 * 1000;
};

interface NotificationCardProps {
  item: VendorNotification;
  onDelete: (id: string) => void;
  onPress: (item: VendorNotification) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  onDelete,
  onPress,
}) => {
  const isUnread = item.unread;
  const titleColor = isUnread ? '#E48714' : '#404040';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      className="bg-white rounded-2xl"
      style={{
        borderLeftWidth: isUnread ? 3.5 : 0,
        borderLeftColor: '#ffe403',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        padding: 16,
      }}>
      <View className="flex-row items-start" style={{gap: 12}}>
        <View
          className="items-center justify-center rounded-full"
          style={{width: 40, height: 40, backgroundColor: '#fff7ed'}}>
          {item.targetType === 'specific' ? (
            <CartIcon size={20} color="#E48714" />
          ) : (
            <InfoIcon size={20} color="#E48714" />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text
              className="text-[14px] leading-[20px] flex-1 pr-2"
              style={{fontFamily: 'Poppins-SemiBold', color: titleColor}}>
              {item.title}
            </Text>
            {isUnread && (
              <View
                className="rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: '#E48714',
                  marginTop: 6,
                }}
              />
            )}
          </View>
          <Text
            className="text-[14px] leading-[20px] text-[#4a5565]"
            style={{fontFamily: 'Poppins-Regular'}}
            numberOfLines={3}>
            {item.message}
          </Text>
          <Text
            className="text-[12px] leading-[16px] text-[#99a1af] mt-1"
            style={{fontFamily: 'Poppins-Regular'}}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onDelete(item._id)}
          className="items-center justify-center"
          style={{width: 30, height: 30}}>
          <TrashIcon size={20} color="#99a1af" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const NotificationsScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {refresh: refreshUnread} = useNotifications();

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications();
      setNotifications(res.items);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || 'Could not load notifications. Try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const unreadCount = useMemo(
    () => notifications.filter(n => n.unread).length,
    [notifications],
  );

  const visible = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter(n => n.unread);
    return notifications;
  }, [activeTab, notifications]);

  const newGroup = visible.filter(n => isNewGroup(n.createdAt));
  const earlierGroup = visible.filter(n => !isNewGroup(n.createdAt));

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    const snapshot = notifications;
    setNotifications(prev => prev.map(n => ({...n, unread: false})));
    try {
      await markAllNotificationsRead();
      refreshUnread();
    } catch (e: any) {
      setNotifications(snapshot);
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Failed to mark all as read.',
      );
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = notifications;
    setNotifications(prev => prev.filter(n => n._id !== id));
    try {
      await deleteNotificationApi(id);
      refreshUnread();
    } catch (e: any) {
      setNotifications(snapshot);
      Alert.alert(
        'Error',
        e?.response?.data?.message || 'Failed to remove notification.',
      );
    }
  };

  const handleCardPress = async (item: VendorNotification) => {
    if (!item.unread) return;
    setNotifications(prev =>
      prev.map(n => (n._id === item._id ? {...n, unread: false} : n)),
    );
    try {
      await markNotificationRead(item._id);
      refreshUnread();
    } catch {
      // silent — UI optimistic update is enough
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
              Notifications
            </Text>
          </View>
        </View>
        <NotificationBell onPress={() => {}} />
      </View>

      {/* Page Header + Tabs */}
      <View
        className="bg-white"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}>
        <View
          className="flex-row items-center justify-between px-4"
          style={{height: 76}}>
          <View className="flex-row items-center" style={{gap: 12}}>
            <TouchableOpacity
              className="items-center justify-center"
              style={{width: 40, height: 40}}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}>
              <BackArrowIcon size={24} color="#404040" />
            </TouchableOpacity>
            <View>
              <Text
                className="text-[24px] leading-[36px] text-[#404040]"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                Notifications
              </Text>
              <Text
                className="text-[12px] leading-[16px] text-[#6a7282]"
                style={{fontFamily: 'Poppins-Regular'}}>
                {unreadCount} unread
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center"
            style={{gap: 6, opacity: unreadCount === 0 ? 0.5 : 1}}
            onPress={handleMarkAllRead}
            disabled={unreadCount === 0}
            activeOpacity={0.7}>
            <CheckAllIcon size={20} color="#E48714" />
            <Text
              className="text-[14px] leading-[20px] text-[#E48714]"
              style={{fontFamily: 'Poppins-Medium'}}>
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>

        <View
          className="flex-row"
          style={{borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.12)'}}>
          {(['unread', 'all'] as const).map(tab => {
            const isActive = activeTab === tab;
            const label =
              tab === 'unread'
                ? `Unread (${notifications.filter(n => n.unread).length})`
                : `All (${notifications.length})`;
            return (
              <TouchableOpacity
                key={tab}
                className="flex-1 items-center justify-center"
                style={{height: 48}}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}>
                <Text
                  className="text-[14px]"
                  style={{
                    fontFamily: 'Roboto',
                    fontWeight: '600',
                    letterSpacing: 0.4,
                    color: isActive ? '#E48714' : '#9e9e9e',
                  }}>
                  {label}
                </Text>
                {isActive && (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: '#E48714',
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View
          className="flex-1 items-center justify-center"
          style={{backgroundColor: '#f9fafb'}}>
          <ActivityIndicator color="#404040" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          style={{backgroundColor: '#f9fafb'}}
          contentContainerStyle={{padding: 16, paddingBottom: 24}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(false);
              }}
              tintColor="#404040"
            />
          }>
          {error ? (
            <View
              className="rounded-lg mb-3"
              style={{backgroundColor: '#fef2f2', padding: 12}}>
              <Text
                className="text-[14px] text-[#b91c1c]"
                style={{fontFamily: 'Poppins-Medium'}}>
                {error}
              </Text>
            </View>
          ) : null}

          {newGroup.length > 0 && (
            <>
              <Text
                className="text-[12px] leading-[16px] text-[#6a7282] mb-3"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  textTransform: 'uppercase',
                  paddingLeft: 8,
                }}>
                New
              </Text>
              <View style={{gap: 12, marginBottom: earlierGroup.length ? 24 : 0}}>
                {newGroup.map(item => (
                  <NotificationCard
                    key={item._id}
                    item={item}
                    onDelete={handleDelete}
                    onPress={handleCardPress}
                  />
                ))}
              </View>
            </>
          )}

          {earlierGroup.length > 0 && (
            <>
              <Text
                className="text-[12px] leading-[16px] text-[#6a7282] mb-3"
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  textTransform: 'uppercase',
                  paddingLeft: 8,
                }}>
                Earlier
              </Text>
              <View style={{gap: 12}}>
                {earlierGroup.map(item => (
                  <NotificationCard
                    key={item._id}
                    item={item}
                    onDelete={handleDelete}
                    onPress={handleCardPress}
                  />
                ))}
              </View>
            </>
          )}

          {visible.length === 0 && !error && (
            <View
              className="items-center justify-center"
              style={{paddingTop: 80}}>
              <Text
                className="text-[14px] text-[#6a7282]"
                style={{fontFamily: 'Poppins-Regular'}}>
                {activeTab === 'unread'
                  ? "You're all caught up."
                  : 'No notifications yet.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Home" />
    </View>
  );
};

export default NotificationsScreen;
