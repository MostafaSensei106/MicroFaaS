import { User, AuthTokens } from '../entities/user';
import { IAuthRepository, RegisterParams } from '../repositories/auth_repository';
import { ValidationFailure } from '@/src/core/errors/failures';

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  public async execute(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }> {
    if (!params.name || params.name.trim().length < 2) {
      throw new ValidationFailure('Name must be at least 2 characters long.');
    }
    if (!params.email || !params.email.includes('@')) {
      throw new ValidationFailure('Please enter a valid email address.');
    }
    return this.authRepository.register(params);
  }
}
