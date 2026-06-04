import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { User } from '../../domain/entities/User';

// Menggunakan in-memory storage untuk saat ini menghindari error Native Module di Expo Go
let currentUser: User | null = null;

export class AuthRepositoryImpl implements AuthRepository {
  async login(username: string, otp: string): Promise<User> {
    // Simulasi pemanggilan API ke backend.
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        if (otp === '1234') {
          const user: User = {
            id: 'u-1',
            name: 'Komandan ARFF',
            username: username,
            role: 'commander',
            token: 'dummy_jwt_token_123',
          };
          currentUser = user;
          resolve(user);
        } else {
          reject(new Error('OTP tidak valid. Silakan coba lagi.'));
        }
      }, 1500); // Simulasi delay jaringan 1.5 detik
    });
  }

  async logout(): Promise<void> {
    currentUser = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return currentUser;
  }
}
