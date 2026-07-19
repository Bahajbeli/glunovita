import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pour Android/iOS, utilisez votre IP locale au lieu de localhost
// IP de votre ordinateur sur le réseau Wi-Fi : 10.76.107.241
const API_URL = __DEV__ 
  ? 'http://10.76.107.241:5000/api' // IP locale de l'ordinateur
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes de timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        await AsyncStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Navigate to login - handled by navigation
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
