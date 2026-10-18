import { Platform } from 'react-native';

// For physical Android/iOS phones on same Wi-Fi: 192.168.1.12:5000
// For Android emulator: 10.0.2.2:5000
const DEV_API_URL = 'http://192.168.1.12:5000/api';
const PROD_API_URL = 'https://api.krisimarg.com/api';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

