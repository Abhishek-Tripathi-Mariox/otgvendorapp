import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {BellIcon} from '../assets/dashboard/icons';
import {useNotifications} from './NotificationsProvider';

type BellComponent = React.FC<{size?: number; color?: string}>;

interface NotificationBellProps {
  /**
   * Bell variant to render. Defaults to the dashboard BellIcon.
   * Pass `OrdersBellIcon`, `InventoryBellIcon`, etc. for screen-specific styling.
   */
  Icon?: BellComponent;
  iconSize?: number;
  iconColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  Icon = BellIcon,
  iconSize = 24,
  iconColor = '#fff',
  badgeColor = '#e48714',
  badgeTextColor = '#fff',
  onPress,
}) => {
  const navigation = useNavigation<any>();
  const {unreadCount} = useNotifications();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    navigation?.navigate('Notifications');
  };

  return (
    <TouchableOpacity
      className="w-8 h-8 items-center justify-center rounded-lg"
      activeOpacity={0.7}
      onPress={handlePress}>
      <Icon size={iconSize} color={iconColor} />
      {unreadCount > 0 && (
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            width: 20,
            height: 20,
            top: -6,
            right: -4,
            backgroundColor: badgeColor,
          }}>
          <Text
            className="text-[12px] text-center"
            style={{fontFamily: 'Roboto', color: badgeTextColor}}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;
