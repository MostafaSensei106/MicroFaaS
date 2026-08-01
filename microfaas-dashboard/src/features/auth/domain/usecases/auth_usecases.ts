import { User } from '../entities/user';
import { IAuthRepository, ForgotPasswordParams } from '../repositories/auth_repository';

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  public async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}

export class ForgotPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  public async execute(params: ForgotPasswordParams): Promise<{ message: string }> {
    return this.authRepository.forgotPassword(params);
  }
}

export class GetCurrentUserUseCase {
  constructor(private authRepository: IAuthRepository) {}

  public async execute(): Promise<User | null> {
    return this.authRepository.getCurrentUser();
  }
}
