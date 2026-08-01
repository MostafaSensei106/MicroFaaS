import { User, AuthTokens } from '../entities/user';
import { IAuthRepository, LoginParams } from '../repositories/auth_repository';
import { ValidationFailure } from '@/src/core/errors/failures';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  public async execute(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }> {
    if (!params.email || !params.email.includes('@')) {
      throw new ValidationFailure('Please enter a valid email address.');
    }
    return this.authRepository.login(params);
  }
}
