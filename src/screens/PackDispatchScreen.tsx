import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import SimpleDateTimePicker from '../components/SimpleDateTimePicker';
import {
  fetchAssignableDrivers,
  packVendorOrder,
  dispatchVendorOrder,
  AssignableDriver,
} from '../services/orders';
import {
  OrdersMenuIcon,
  OrdersBellIcon,
  BackArrowIcon,
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  TruckIcon,
  AcceptCheckIcon,
  ChevronDownSmallIcon,
} from '../assets/orders/icons';

// Convert the "DD/MM/YYYY" text input into an ISO date string for the backend.
// Falls back to undefined when the input doesn't parse so we don't send garbage.
const toIsoDate = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, dd, mm, yyyy] = match;
    const iso = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
    ).toISOString();
    return iso;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const otgLogo = require('../assets/dashboard/source_OTG_Grey.png');

const PackDispatchScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const {openSidebar} = useSidebar();
  const orderId = route?.params?.orderId ?? '';
  const [packed, setPacked] = useState(false);
  const [dispatchDate, setDispatchDate] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  const [drivers, setDrivers] = useState<AssignableDriver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverPickerOpen, setDriverPickerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<AssignableDriver | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setDriversLoading(true);
        const list = await fetchAssignableDrivers();
        if (active) {
          setDrivers(list);
        }
      } catch {
        // Non-fatal: vendor can still dispatch with auto-assign (blank driver).
        if (active) {
          setDrivers([]);
        }
      } finally {
        if (active) {
          setDriversLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const ready =
    packed &&
    dispatchDate.trim().length > 0 &&
    dispatchTime.trim().length > 0 &&
    !submitting &&
    !!orderId;

  const handleConfirm = async () => {
    if (!orderId) {
      Alert.alert('Missing order', 'Order id is missing for this dispatch.');
      return;
    }
    try {
      setSubmitting(true);
      // Mark the order packed first, then dispatch it (assigns the driver).
      await packVendorOrder(orderId, {note: 'Packed from vendor app'});
      const booking = await dispatchVendorOrder(orderId, {
        dispatchDate: toIsoDate(dispatchDate),
        dispatchTime: dispatchTime.trim() || undefined,
        vehicleNumber: vehicleNumber.trim() || undefined,
        driverId: selectedDriver?.id,
      });
      navigation?.navigate('DispatchConfirmation', {orderId, booking});
    } catch (err: any) {
      Alert.alert(
        'Could not dispatch',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setSubmitting(false);
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
            <OrdersMenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center" style={{gap: 8}}>
            <View className="w-8 h-8 rounded-[10px]" style={{overflow: 'hidden'}}>
              <Image source={otgLogo} className="w-8 h-8" resizeMode="contain" />
            </View>
            <Text
              className="text-[16px] leading-[24px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Pack & Dispatch
            </Text>
          </View>
        </View>
        <NotificationBell Icon={OrdersBellIcon} />
      </View>

      {/* Sub Header */}
      <View
        className="bg-white px-2 pr-4"
        style={{
          paddingVertical: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}>
        <View className="flex-row items-center" style={{gap: 8}}>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-lg"
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}>
            <BackArrowIcon size={24} color="#404040" />
          </TouchableOpacity>
          <View style={{gap: 2, flex: 1}}>
            <Text
              className="text-[22px] leading-[30px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Pack & Dispatch
            </Text>
            <Text className="font-poppins-regular text-[14px] leading-[20px] text-[#4a5565]">
              Order: {orderId}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 120, gap: 16}}>
        {/* Confirm Packing */}
        <TouchableOpacity
          className="rounded-xl px-4 flex-row items-center"
          style={{
            backgroundColor: packed ? '#dcfce7' : '#f0fdf4',
            borderLeftWidth: 4,
            borderLeftColor: '#22c55e',
            height: 56,
            gap: 12,
          }}
          activeOpacity={0.7}
          onPress={() => setPacked(!packed)}>
          <View
            className="rounded items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderWidth: 2,
              borderColor: packed ? '#22c55e' : '#9ca3af',
              backgroundColor: packed ? '#22c55e' : '#fff',
            }}>
            {packed && <AcceptCheckIcon size={14} color="#fff" />}
          </View>
          <Text
            className="text-[16px] leading-[24px] text-primary flex-1"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Confirm Packing Completed ✓
          </Text>
        </TouchableOpacity>

        {/* Dispatch Date */}
        <View style={{gap: 8}}>
          <Text
            className="text-[14px] leading-[20px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Dispatch Date <Text style={{color: '#ef4444'}}>*</Text>
          </Text>
          <View
            className="flex-row items-center rounded-xl bg-white px-3"
            style={{
              height: 50,
              borderWidth: 1,
              borderColor: '#d1d5db',
              gap: 8,
            }}>
            <TextInput
              className="flex-1 text-[16px] text-primary"
              style={{height: 50, fontFamily: 'Poppins-Regular'}}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="rgba(64,64,64,0.4)"
              value={dispatchDate}
              onChangeText={setDispatchDate}
            />
            <TouchableOpacity
              onPress={() => setPickerMode('date')}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <CalendarIcon size={20} color="#6a7282" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dispatch Time */}
        <View style={{gap: 8}}>
          <Text
            className="text-[14px] leading-[20px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Dispatch Time <Text style={{color: '#ef4444'}}>*</Text>
          </Text>
          <View
            className="flex-row items-center rounded-xl bg-white px-3"
            style={{
              height: 50,
              borderWidth: 1,
              borderColor: '#d1d5db',
              gap: 8,
            }}>
            <TextInput
              className="flex-1 text-[16px] text-primary"
              style={{height: 50, fontFamily: 'Poppins-Regular'}}
              placeholder="HH:MM AM/PM"
              placeholderTextColor="rgba(64,64,64,0.4)"
              value={dispatchTime}
              onChangeText={setDispatchTime}
            />
            <TouchableOpacity
              onPress={() => setPickerMode('time')}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <ClockIcon size={20} color="#6a7282" />
            </TouchableOpacity>
          </View>
        </View>

        {pickerMode && (
          <SimpleDateTimePicker
            visible={pickerMode !== null}
            mode={pickerMode}
            onClose={() => setPickerMode(null)}
            onConfirm={value =>
              pickerMode === 'date'
                ? setDispatchDate(value)
                : setDispatchTime(value)
            }
          />
        )}

        <View style={{height: 1, backgroundColor: '#e5e7eb', marginVertical: 4}} />

        {/* Vehicle Assignment */}
        <View className="flex-row items-center" style={{gap: 8}}>
          <TruckIcon size={22} color="#e48714" />
          <Text
            className="text-[18px] leading-[27px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Vehicle Assignment
          </Text>
        </View>

        {/* Driver Picker */}
        <View
          className="rounded-xl p-4"
          style={{
            backgroundColor: '#eff6ff',
            borderLeftWidth: 4,
            borderLeftColor: '#2563eb',
            gap: 12,
          }}>
          <View className="flex-row items-center" style={{gap: 8}}>
            <PersonIcon size={18} color="#2563eb" />
            <Text
              className="text-[14px] leading-[20px]"
              style={{fontFamily: 'Poppins-SemiBold', color: '#1d4ed8'}}>
              Assign Driver
            </Text>
          </View>
          <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#4a5565]">
            Select a driver, or leave as Auto-assign to let the system pick one.
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between rounded-xl bg-white px-3"
            style={{height: 48, borderWidth: 1, borderColor: '#d1d5db'}}
            activeOpacity={0.7}
            disabled={driversLoading}
            onPress={() => setDriverPickerOpen(!driverPickerOpen)}>
            {driversLoading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Text
                className="font-poppins-regular text-[14px] leading-[20px]"
                style={{color: selectedDriver ? '#404040' : '#6a7282'}}>
                {selectedDriver
                  ? selectedDriver.name
                  : 'Auto-assign (recommended)'}
              </Text>
            )}
            <ChevronDownSmallIcon size={18} color="#6a7282" />
          </TouchableOpacity>
          {driverPickerOpen && (
            <View
              className="rounded-xl bg-white"
              style={{borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden'}}>
              <TouchableOpacity
                className="px-3 py-3"
                style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}
                activeOpacity={0.6}
                onPress={() => {
                  setSelectedDriver(null);
                  setDriverPickerOpen(false);
                }}>
                <Text className="font-poppins-regular text-[14px] leading-[20px] text-primary">
                  Auto-assign (recommended)
                </Text>
              </TouchableOpacity>
              {drivers.map(driver => (
                <TouchableOpacity
                  key={driver.id}
                  className="px-3 py-3"
                  style={{borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}
                  activeOpacity={0.6}
                  onPress={() => {
                    setSelectedDriver(driver);
                    if (driver.vehicleNumber) {
                      setVehicleNumber(driver.vehicleNumber);
                    }
                    setDriverPickerOpen(false);
                  }}>
                  <Text
                    className="text-[14px] leading-[20px] text-primary"
                    style={{fontFamily: 'Poppins-Medium'}}>
                    {driver.name}
                  </Text>
                  {driver.vehicleNumber ? (
                    <Text className="font-poppins-regular text-[12px] leading-[16px] text-[#6a7282]">
                      {driver.vehicleNumber}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
              {drivers.length === 0 && (
                <View className="px-3 py-3">
                  <Text className="font-poppins-regular text-[13px] leading-[18px] text-[#6a7282]">
                    No drivers available — order will be auto-assigned.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Vehicle Number */}
        <View style={{gap: 8}}>
          <Text
            className="text-[14px] leading-[20px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            Vehicle Number{' '}
            <Text className="font-poppins-regular text-[#6a7282]">
              (Optional)
            </Text>
          </Text>
          <View
            className="flex-row items-center rounded-xl bg-white px-3"
            style={{height: 50, borderWidth: 1, borderColor: '#d1d5db', gap: 8}}>
            <TruckIcon size={20} color="#6a7282" />
            <TextInput
              className="flex-1 text-[16px] text-primary"
              style={{height: 50, fontFamily: 'Poppins-Regular'}}
              placeholder="MH-01-AB-1234"
              placeholderTextColor="rgba(64,64,64,0.4)"
              autoCapitalize="characters"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />
          </View>
        </View>

        {ready && (
          <View
            className="rounded-xl px-4 py-3"
            style={{
              backgroundColor: '#f0fdf4',
              borderWidth: 1,
              borderColor: '#86efac',
            }}>
            <Text
              className="text-[13px] leading-[18px]"
              style={{fontFamily: 'Poppins-Medium', color: '#166534'}}>
              ✓ Vehicle and driver have been assigned. Order is ready for dispatch.
            </Text>
          </View>
        )}

        {/* Confirm button */}
        <TouchableOpacity
          className="rounded-xl items-center justify-center mt-2"
          style={{
            height: 56,
            backgroundColor: ready ? '#ffe403' : '#fef3c7',
          }}
          disabled={!ready}
          activeOpacity={0.8}
          onPress={handleConfirm}>
          {submitting ? (
            <ActivityIndicator size="small" color="#404040" />
          ) : (
            <Text
              className="text-[16px] leading-[24px]"
              style={{
                fontFamily: 'Poppins-SemiBold',
                color: ready ? '#404040' : '#a16207',
              }}>
              Confirm Dispatch Assignment
            </Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <BottomNavBar activeTab="Orders" />
    </View>
  );
};

export default PackDispatchScreen;
