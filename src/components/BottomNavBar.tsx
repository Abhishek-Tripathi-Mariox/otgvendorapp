import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import HomeIcon from './nav-icons/HomeIcon';
import OrdersIcon from './nav-icons/OrdersIcon';
import InventoryIcon from './nav-icons/InventoryIcon';
import ProfileIcon from './nav-icons/ProfileIcon';

type TabName = 'Home' | 'Orders' | 'Inventory' | 'Profile';

interface BottomNavBarProps {
  activeTab: TabName;
  onTabPress?: (tab: TabName) => void;
}

const TABS: {name: TabName; Icon: React.FC<{size?: number; color?: string}>}[] = [
  {name: 'Home', Icon: HomeIcon},
  {name: 'Orders', Icon: OrdersIcon},
  {name: 'Inventory', Icon: InventoryIcon},
  {name: 'Profile', Icon: ProfileIcon},
];

const ROUTE_BY_TAB: Record<TabName, string> = {
  Home: 'Dashboard',
  Orders: 'OrderList',
  Inventory: 'Inventory',
  Profile: 'Profile',
};

const ACTIVE_COLOR = '#E48714';
const INACTIVE_COLOR = '#4A5565';

const BottomNavBar: React.FC<BottomNavBarProps> = ({activeTab, onTabPress}) => {
  const navigation = useNavigation<any>();

  const handlePress = (tab: TabName) => {
    if (onTabPress) {
      onTabPress(tab);
      return;
    }
    if (tab === activeTab) return;
    const target = ROUTE_BY_TAB[tab];
    const current = navigation.getState?.()?.routes?.slice(-1)?.[0]?.name;
    if (current === target) return;
    navigation.navigate(target);
  };

  return (
    <View
      className="flex-row items-center justify-between bg-white"
      style={{
        height: 64,
        paddingHorizontal: 13,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
      }}>
      {TABS.map(({name, Icon}) => {
        const isActive = activeTab === name;
        return (
          <TouchableOpacity
            key={name}
            className="items-center justify-center"
            style={{height: 56, minWidth: 64, gap: 4}}
            onPress={() => handlePress(name)}
            activeOpacity={0.7}>
            <Icon
              size={20}
              color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
            <Text
              className="text-[12px] leading-[16px]"
              style={{
                fontFamily: 'Poppins-SemiBold',
                color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
              }}>
              {name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavBar;
