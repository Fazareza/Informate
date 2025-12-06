import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const API_URL = 'https://cutest-laura-overfrugally.ngrok-free.dev/api'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getJsonHeader = async () => {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export const getAuthHeader = async () => {
  return {
    headers: {
      Accept: 'application/json', // Opsional, boleh ada boleh tidak
    },
  };
};

export default api;