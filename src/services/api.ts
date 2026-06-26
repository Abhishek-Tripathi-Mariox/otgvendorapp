import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dev: LAN IP of the machine running the backend on the same Wi-Fi as the device.
// Prod: production backend host. __DEV__ is true in Metro/dev builds and false in
// release builds (assembleRelease/bundleRelease).
//
// Emulator dev alternatives (only if NOT running on a physical device):
//   Android emulator: http://10.0.2.2:5011/api
//   iOS simulator:    http://localhost:5011/api
export const API_BASE_URL = 'https://otgtrading.in/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('vendorToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('vendorToken');
    }
    return Promise.reject(error);
  },
);

export default api;
