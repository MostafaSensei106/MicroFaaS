import { User, AuthTokens } from '../../domain/entities/user';
import { IAuthRepository, LoginParams, RegisterParams, ForgotPasswordParams } from '../../domain/repositories/auth_repository';
import { IAuthRemoteDataSource } from '../datasources/auth_remote_datasource';

export class AuthRepositoryImpl implements IAuthRepository {
  private currentUserCache: User | null = null;

  constructor(private remoteDataSource: IAuthRemoteDataSource) {}

  public async login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await this.remoteDataSource.login(params);
    this.currentUserCache = result.user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('faas_user', JSON.stringify(result.user));
    }
    return result;
  }

  public async register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await this.remoteDataSource.register(params);
    this.currentUserCache = result.user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('faas_user', JSON.stringify(result.user));
    }
    return result;
  }

  public async logout(): Promise<void> {
    await this.remoteDataSource.logout();
    this.currentUserCache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('faas_user');
      localStorage.removeItem('faas_access_token');
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    if (this.currentUserCache) {
      return this.currentUserCache;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('faas_user');
      if (stored) {
        try {
          this.currentUserCache = JSON.parse(stored);
          return this.currentUserCache;
        } catch {
          localStorage.removeItem('faas_user');
        }
      }
    }
    return null;
  }

  public async forgotPassword(params: ForgotPasswordParams): Promise<{ message: string }> {
    return this.remoteDataSource.forgotPassword(params);
  }

  public async registerFcmToken(token: string): Promise<void> {
    return this.remoteDataSource.registerFcmToken(token);
  }
}
