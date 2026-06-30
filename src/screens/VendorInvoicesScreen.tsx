import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import {
  fetchVendorOrders,
  fetchVendorInvoice,
  VendorOrder,
  VendorInvoice,
} from '../services/orders';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import BottomNavBar from '../components/BottomNavBar';
import {OrdersMenuIcon, OrdersBellIcon, BackArrowIcon} from '../assets/orders/icons';

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

const formatINR = (n?: number | null): string =>
  `₹${Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Row: React.FC<{label: string; value: string; bold?: boolean}> = ({
  label,
  value,
  bold,
}) => (
  <View
    className="flex-row items-center justify-between"
    style={{paddingVertical: 4}}>
    <Text
      className="text-[13px] text-[#6a7282]"
      style={{fontFamily: 'Poppins-Regular'}}>
      {label}
    </Text>
    <Text
      className="text-[13px]"
      style={{
        fontFamily: bold ? 'Poppins-SemiBold' : 'Poppins-Regular',
        color: bold ? '#e48714' : '#404040',
      }}>
      {value}
    </Text>
  </View>
);

const VendorInvoicesScreen: React.FC<{navigation?: any}> = ({navigation}) => {
  const {openSidebar} = useSidebar();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoice, setInvoice] = useState<VendorInvoice | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchVendorOrders('Delivered');
      setOrders(data);
    } catch {
      // keep whatever we have
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openInvoice = async (id: string) => {
    try {
      setInvoiceLoading(true);
      const inv = await fetchVendorInvoice(id);
      setInvoice(inv);
    } catch {
      setInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#404040" />

      {/* Top bar */}
      <View
        className="flex-row items-center justify-between px-4 bg-primary"
        style={{height: 56}}>
        <View className="flex-row items-center" style={{gap: 12}}>
          <TouchableOpacity activeOpacity={0.7} onPress={openSidebar}>
            <OrdersMenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center" style={{gap: 8}}>
            <View className="w-8 h-8 rounded-[10px]" style={{overflow: 'hidden'}}>
              <Image source={otgLogo} className="w-8 h-8" resizeMode="contain" />
            </View>
            <Text
              className="text-[16px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Invoices
            </Text>
          </View>
        </View>
        <NotificationBell Icon={OrdersBellIcon} />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#e48714" />
        </View>
      ) : (
        <ScrollView
          style={{backgroundColor: '#f9fafb'}}
          contentContainerStyle={{padding: 16, paddingBottom: 100, gap: 12}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }>
          {orders.length === 0 ? (
            <View style={{paddingVertical: 60, alignItems: 'center'}}>
              <Text
                className="text-[14px] text-[#6a7282] text-center"
                style={{fontFamily: 'Poppins-Regular'}}>
                No invoices yet. Invoices appear here once orders are delivered.
              </Text>
            </View>
          ) : (
            orders.map(o => (
              <TouchableOpacity
                key={o._id || o.id}
                activeOpacity={0.8}
                onPress={() => openInvoice(o._id || o.id)}
                className="bg-white rounded-xl p-4"
                style={{borderWidth: 1, borderColor: '#eee'}}>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-[15px] text-primary"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    #{o.id}
                  </Text>
                  <Text
                    className="text-[15px]"
                    style={{fontFamily: 'Poppins-SemiBold', color: '#e48714'}}>
                    {formatINR(o.totalAmount)}
                  </Text>
                </View>
                <Text
                  className="text-[13px] text-[#6a7282] mt-1"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  {o.materialName} · {o.customer?.name || 'Customer'}
                </Text>
                <Text
                  className="text-[12px] text-[#9ca3af] mt-1"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  Delivered: {o.deliveryDate}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Invoice detail modal */}
      <Modal
        visible={invoiceLoading || !!invoice}
        transparent
        animationType="fade"
        onRequestClose={() => setInvoice(null)}>
        <Pressable
          onPress={() => setInvoice(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 18,
              maxHeight: '85%',
            }}>
            {invoiceLoading || !invoice ? (
              <View style={{paddingVertical: 30, alignItems: 'center'}}>
                <ActivityIndicator color="#e48714" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-[18px] text-primary"
                    style={{fontFamily: 'Poppins-Bold'}}>
                    Invoice
                  </Text>
                  <TouchableOpacity onPress={() => setInvoice(null)}>
                    <BackArrowIcon size={22} color="#404040" />
                  </TouchableOpacity>
                </View>
                <Text
                  className="text-[12px] text-[#6a7282] mb-3"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  {invoice.invoiceNo} · {invoice.orderId}
                </Text>

                <Row label="Customer" value={invoice.customer?.name || '-'} />
                {invoice.customer?.site ? (
                  <Row label="Site" value={invoice.customer.site} />
                ) : null}
                <Row label="Delivered" value={invoice.deliveryDate} />
                <Row label="Payment" value={invoice.paymentStatus} />

                <View
                  style={{
                    height: 1,
                    backgroundColor: '#eee',
                    marginVertical: 10,
                  }}
                />
                <Row label="Material" value={invoice.item?.materialName || '-'} />
                <Row
                  label="Quantity"
                  value={`${invoice.item?.quantity} ${invoice.item?.unit || ''}`}
                />
                <Row
                  label="Unit Price"
                  value={formatINR(invoice.item?.unitPrice)}
                />

                <View
                  style={{
                    height: 1,
                    backgroundColor: '#eee',
                    marginVertical: 10,
                  }}
                />
                <Row label="Subtotal" value={formatINR(invoice.totals?.subtotal)} />
                <Row
                  label={`GST (${invoice.totals?.gstRate || 0}%)`}
                  value={formatINR(invoice.totals?.gstAmount)}
                />
                <Row label="Total" value={formatINR(invoice.totals?.total)} bold />

                <TouchableOpacity
                  onPress={() => setInvoice(null)}
                  className="bg-[#ffe403] rounded-xl items-center justify-center mt-4"
                  style={{height: 46}}>
                  <Text
                    className="text-[14px] text-primary"
                    style={{fontFamily: 'Poppins-SemiBold'}}>
                    Close
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNavBar activeTab="Home" />
    </View>
  );
};

export default VendorInvoicesScreen;
