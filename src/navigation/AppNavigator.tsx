import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import RegistrationStep1Screen from '../screens/RegistrationStep1Screen';
import RegistrationStep2Screen from '../screens/RegistrationStep2Screen';
import RegistrationStep3Screen from '../screens/RegistrationStep3Screen';
import OnboardingStatusScreen from '../screens/OnboardingStatusScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddNewMaterialScreen from '../screens/AddNewMaterialScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import OrderListScreen from '../screens/OrderListScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AssignedQuotationsScreen from '../screens/AssignedQuotationsScreen';
import QuotationDetailScreen from '../screens/QuotationDetailScreen';
import QcUploadScreen from '../screens/QcUploadScreen';
import PackDispatchScreen from '../screens/PackDispatchScreen';
import DispatchConfirmationScreen from '../screens/DispatchConfirmationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import VendorInvoicesScreen from '../screens/VendorInvoicesScreen';
import SupportScreen from '../screens/SupportScreen';
import {SidebarProvider} from '../components/SidebarProvider';
import type {VendorFulfilmentBooking} from '../services/orders';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OtpVerification: {identifier?: string};
  RegistrationStep1: {mobile?: string} | undefined;
  RegistrationStep2: undefined;
  RegistrationStep3: undefined;
  OnboardingStatus: undefined;
  Dashboard:
    | {
        successMessage?: string;
        nextScreen?: keyof RootStackParamList;
        nextParams?: any;
      }
    | undefined;
  AddNewMaterial: undefined;
  Inventory: undefined;
  Profile: undefined;
  BankDetails: undefined;
  OrderList: undefined;
  OrderDetail: {
    orderId: string;
    status: string;
    category: string;
    quantity: string;
    deliveryDate: string;
  };
  QcUpload: {orderId: string};
  PackDispatch: {orderId: string};
  DispatchConfirmation: {orderId: string; booking?: VendorFulfilmentBooking};
  AssignedQuotations: undefined;
  QuotationDetail: {id: string};
  Notifications: undefined;
  Payments: undefined;
  VendorInvoices: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <SidebarProvider>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="RegistrationStep1" component={RegistrationStep1Screen} />
        <Stack.Screen name="RegistrationStep2" component={RegistrationStep2Screen} />
        <Stack.Screen name="RegistrationStep3" component={RegistrationStep3Screen} />
        <Stack.Screen name="OnboardingStatus" component={OnboardingStatusScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddNewMaterial" component={AddNewMaterialScreen} />
        <Stack.Screen name="Inventory" component={InventoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
        <Stack.Screen name="OrderList" component={OrderListScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen
          name="AssignedQuotations"
          component={AssignedQuotationsScreen}
        />
        <Stack.Screen
          name="QuotationDetail"
          component={QuotationDetailScreen}
        />
        <Stack.Screen name="QcUpload" component={QcUploadScreen} />
        <Stack.Screen name="PackDispatch" component={PackDispatchScreen} />
        <Stack.Screen
          name="DispatchConfirmation"
          component={DispatchConfirmationScreen}
        />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
        <Stack.Screen name="VendorInvoices" component={VendorInvoicesScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
      </Stack.Navigator>
      </SidebarProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;
