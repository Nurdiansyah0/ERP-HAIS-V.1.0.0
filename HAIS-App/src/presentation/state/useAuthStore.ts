import { create } from 'zustand';
import { User } from '../../domain/entities/User';
import { LoginUseCase } from '../../domain/usecases/LoginUseCase';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// Dependensi Injeksi (DI) Manual
const authRepository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(authRepository);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (username: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginUseCase.execute(username, otp);
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Terjadi kesalahan', isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authRepository.logout();
    set({ user: null, isLoading: false });
  },

  checkSession: async () => {
    set({ isLoading: true });
    const user = await authRepository.getCurrentUser();
    set({ user, isLoading: false });
  },
}));
