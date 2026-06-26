import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import {
  CloseIcon,
  DashboardGridIcon,
  CartIcon,
  InventoryBoxIcon,
  TruckIcon,
  PaymentsCardIcon,
  InvoiceDocIcon,
  SupportHelpIcon,
  PersonIcon,
} from '../assets/dashboard/icons';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

export type SidebarItem =
  | 'Dashboard'
  | 'Orders'
  | 'Quotations'
  | 'Inventory'
  | 'Tracking'
  | 'Payments'
  | 'Invoices'
  | 'Support'
  | 'Profile';

interface SidebarDrawerProps {
  visible: boolean;
  activeItem?: SidebarItem;
  vendorName?: string;
  vendorId?: string;
  onClose: () => void;
  onItemPress: (item: SidebarItem) => void;
}

interface MenuRow {
  key: SidebarItem;
  label: string;
  icon: (color: string) => React.ReactNode;
}

const MENU: MenuRow[] = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    icon: color => <DashboardGridIcon size={20} color={color} />,
  },
  {
    key: 'Orders',
    label: 'Orders',
    icon: color => <CartIcon size={20} color={color} />,
  },
  {
    key: 'Quotations',
    label: 'Quotations',
    icon: color => <InvoiceDocIcon size={20} color={color} />,
  },
  {
    key: 'Inventory',
    label: 'Inventory',
    icon: color => <InventoryBoxIcon size={20} color={color} />,
  },
  {
    key: 'Tracking',
    label: 'Tracking',
    icon: color => <TruckIcon size={20} color={color} />,
  },
  {
    key: 'Payments',
    label: 'Payments',
    icon: color => <PaymentsCardIcon size={20} color={color} />,
  },
  {
    key: 'Invoices',
    label: 'Invoices',
    icon: color => <InvoiceDocIcon size={20} color={color} />,
  },
  {
    key: 'Support',
    label: 'Support',
    icon: color => <SupportHelpIcon size={20} color={color} />,
  },
  {
    key: 'Profile',
    label: 'Profile',
    icon: color => <PersonIcon size={20} color={color} />,
  },
];

const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  activeItem = 'Dashboard',
  vendorName = 'Vendor',
  vendorId = '—',
  onClose,
  onItemPress,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View className="flex-1 flex-row">
        <View
          className="bg-[#404040]"
          style={{
            width: 280,
            height: '100%',
            shadowColor: '#000',
            shadowOffset: {width: 8, height: 0},
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 16,
          }}>
          {/* Header */}
          <View
            className="flex-row items-center bg-[#ffe403] pl-4 pr-2"
            style={{height: 80, gap: 12}}>
            <View
              className="rounded-[10px] items-center justify-center bg-white"
              style={{width: 48, height: 48, overflow: 'hidden'}}>
              <Image
                source={otgLogo}
                style={{width: 48, height: 48}}
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[16px] leading-[24px] text-primary"
                style={{fontFamily: 'Poppins-SemiBold'}}>
                OTG Vendor Panel
              </Text>
              <Text className="font-poppins-regular text-[12px] leading-[16px] text-primary">
                {vendorName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center rounded-lg"
              activeOpacity={0.7}>
              <CloseIcon size={24} color="#404040" />
            </TouchableOpacity>
          </View>

          {/* Menu items */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16}}>
            {MENU.map(item => {
              const isActive = item.key === activeItem;
              const iconColor = isActive ? '#404040' : '#fff';
              const textColor = isActive ? 'text-primary' : 'text-white';
              return (
                <TouchableOpacity
                  key={item.key}
                  activeOpacity={0.7}
                  onPress={() => onItemPress(item.key)}
                  className={`flex-row items-center rounded-lg ${
                    isActive ? 'bg-[#ffe403]' : ''
                  }`}
                  style={{
                    height: 48,
                    paddingLeft: 16,
                    gap: 12,
                    marginBottom: 8,
                  }}>
                  {item.icon(iconColor)}
                  <Text
                    className={`text-[16px] leading-[24px] ${textColor}`}
                    style={{fontFamily: 'Poppins-Medium'}}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View
            className="border-t border-[#e48714] flex-row items-center"
            style={{
              paddingVertical: 16,
              paddingHorizontal: 32,
              gap: 12,
            }}>
            <View
              className="bg-[#ffe403] rounded-full items-center justify-center"
              style={{width: 40, height: 40}}>
              <PersonIcon size={24} color="#404040" />
            </View>
            <View className="flex-1">
              <Text
                className="text-[14px] leading-[20px] text-white"
                style={{fontFamily: 'Poppins-Medium'}}>
                {vendorName}
              </Text>
              <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#d1d5dc]">
                Vendor ID: {vendorId}
              </Text>
            </View>
          </View>
        </View>

        {/* Backdrop */}
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />
      </View>
    </Modal>
  );
};

export default SidebarDrawer;
