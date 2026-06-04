import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// URL API Backend mengarah ke IP lokal komputer Anda
const API_BASE_URL = 'http://192.168.1.7:8080/v1';
const CURRENT_USER_KEY = '@hais_current_user';
const REFRESH_TOKEN_KEY = 'hais_refresh_token';

export class AuthRepositoryImpl implements AuthRepository {
  async login(username: string, otp: string): Promise<User> {
    try {
      // 1. Mengirim HTTP POST Request ke endpoint Rust
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: username,
        password: otp, // Password dari LoginScreen
      });

      // 2. Backend Rust memvalidasi dan mengirimkan access_token, refresh_token, serta data user
      const { access_token, refresh_token, user: userData } = response.data;
      
      const user: User = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        role: userData.role,
        token: access_token, // access_token disimpan untuk sesi aktif saat ini
      };

      // 3. Simpan access_token di AsyncStorage untuk digunakan pada setiap HTTP request selanjutnya
      await AsyncStorage.setItem('@hais_jwt_token', access_token);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      // 4. Simpan refresh_token SECARA AMAN di Enklave Perangkat (Keychain iOS / Keystore Android)
      // Refresh token ini yang akan digunakan untuk auto-login "Ingat Saya"
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);

      return user;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Terjadi kesalahan saat menghubungi server.');
    }
  }

  async logout(): Promise<void> {
    // Menghapus data dari memori biasa dan penyimpanan aman saat logout
    await AsyncStorage.removeItem('@hais_jwt_token');
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Fitur Auto-Login (Ingat Saya)
      // 1. Cek apakah ada refresh_token di penyimpanan aman (SecureStore)
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        // 2. Jika ada, minta access_token baru ke Rust Backend tanpa perlu password lagi
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const newAccessToken = response.data.access_token;
          await AsyncStorage.setItem('@hais_jwt_token', newAccessToken);
          
          // Ambil kembali data profile user dari storage lokal
          const userDataStr = await AsyncStorage.getItem(CURRENT_USER_KEY);
          if (userDataStr) {
            let user = JSON.parse(userDataStr) as User;
            user.token = newAccessToken;
            return user;
          }
        } catch (refreshError) {
          // Jika refresh token gagal/kadaluwarsa, paksa user login manual
          await this.logout();
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Gagal mengambil data user/token dari storage', error);
      return null;
    }
  }
}
