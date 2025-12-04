import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan URL Ngrok Anda yang aktif
export const API_URL = 'https://cutest-laura-overfrugally.ngrok-free.dev/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// === INTERCEPTOR OTOMATIS ===
// Setiap kali api.get/post dipanggil, fungsi ini jalan duluan untuk menyisipkan token
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

// Helper header JSON (Opsional, tapi bagus untuk konsistensi)
export const getJsonHeader = async () => {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

// Helper header FormData (Untuk Upload Gambar)
export const getAuthHeader = async () => {
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Authorization sudah diurus otomatis oleh interceptor di atas
    },
  };
};

export default api;