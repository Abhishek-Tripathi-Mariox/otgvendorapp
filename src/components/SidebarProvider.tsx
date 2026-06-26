import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useNavigation} from '@react-navigation/native';
import SidebarDrawer, {SidebarItem} from './SidebarDrawer';
import {fetchMe, getStoredVendor, VendorProfile} from '../services/auth';

interface SidebarContextValue {
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export const useSidebar = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return ctx;
};

const ROUTE_BY_ITEM: Partial<Record<SidebarItem, string>> = {
  Dashboard: 'Dashboard',
  Orders: 'OrderList',
  Quotations: 'AssignedQuotations',
  Inventory: 'Inventory',
  // No dedicated Tracking screen exists — order status/dispatch progress lives
  // on the Orders list, so route Tracking there instead of being a dead item.
  Tracking: 'OrderList',
  Payments: 'Payments',
  Support: 'Support',
  Profile: 'Profile',
};

export const SidebarProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const navigation = useNavigation<any>();
  const [visible, setVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<SidebarItem>('Dashboard');
  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  // Load the real vendor so the sidebar shows the actual business name and
  // vendor code instead of the placeholder "ABC Supplies" / "V12345".
  useEffect(() => {
    let cancelled = false;
    getStoredVendor().then(v => {
      if (!cancelled && v) setVendor(v);
    });
    fetchMe()
      .then(fresh => {
        if (!cancelled && fresh) setVendor(fresh);
      })
      .catch(() => {
        /* keep cached vendor */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openSidebar = useCallback(() => {
    const current = navigation.getState?.()?.routes?.slice(-1)?.[0]?.name;
    const match = (Object.keys(ROUTE_BY_ITEM) as SidebarItem[]).find(
      key => ROUTE_BY_ITEM[key] === current,
    );
    if (match) setActiveItem(match);
    setVisible(true);
  }, [navigation]);

  const closeSidebar = useCallback(() => setVisible(false), []);

  const handleItemPress = useCallback(
    (item: SidebarItem) => {
      setVisible(false);
      const target = ROUTE_BY_ITEM[item];
      if (!target) return;
      const current = navigation.getState?.()?.routes?.slice(-1)?.[0]?.name;
      if (current === target) return;
      navigation.navigate(target);
    },
    [navigation],
  );

  return (
    <SidebarContext.Provider value={{openSidebar, closeSidebar}}>
      {children}
      <SidebarDrawer
        visible={visible}
        activeItem={activeItem}
        vendorName={vendor?.business?.name || vendor?.name || undefined}
        vendorId={vendor?.vendorCode || undefined}
        onClose={closeSidebar}
        onItemPress={handleItemPress}
      />
    </SidebarContext.Provider>
  );
};
