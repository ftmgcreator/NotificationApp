import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_URL = 'http://192.168.148.151:8080/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response?.status === 401) {
            await AsyncStorage.removeItem('token');
        }
        return Promise.reject(err);
    }
);

export default api;
