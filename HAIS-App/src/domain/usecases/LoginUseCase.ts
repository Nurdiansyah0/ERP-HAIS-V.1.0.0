import { AuthRepository } from '../repositories/AuthRepository';
import { User } from '../entities/User';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(username: string, otp: string): Promise<User> {
    if (username.trim().length === 0) {
      throw new Error('Username tidak boleh kosong.');
    }
    if (otp.length < 4) {
      throw new Error('OTP minimal 4 karakter.');
    }
    return this.authRepository.login(username, otp);
  }
}
