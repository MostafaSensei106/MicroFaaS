import { IApiClient } from '@/src/core/network/api_client';
import { User, AuthTokens } from '../../domain/entities/user';
import { LoginParams, RegisterParams, ForgotPasswordParams } from '../../domain/repositories/auth_repository';

export interface AuthApiResponse {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    created_at?: string;
    fcm_token?: string;
  };
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  token?: string;
  message?: string;
}

export interface IAuthRemoteDataSource {
  login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }>;
  register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }>;
  logout(): Promise<void>;
  forgotPassword(params: ForgotPasswordParams): Promise<{ message: string }>;
  registerFcmToken(token: string): Promise<void>;
}

export class AuthRemoteDataSource implements IAuthRemoteDataSource {
  constructor(private apiClient: IApiClient) {}

  public async login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await this.apiClient.post<AuthApiResponse>('/auth/login', params);
    
    // Parse backend response DTO into Domain Entities
    const user: User = {
      id: res.user?.id || 'usr_' + Math.random().toString(36).substr(2, 9),
      email: res.user?.email || params.email,
      name: res.user?.name || params.email.split('@')[0],
      role: (res.user?.role as 'admin' | 'developer' | 'viewer') || 'developer',
      createdAt: res.user?.created_at || new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: res.tokens?.access_token || res.token || 'mock_jwt_' + Date.now(),
      refreshToken: res.tokens?.refresh_token,
      expiresIn: res.tokens?.expires_in || 86400,
    };

    this.apiClient.setAuthToken(tokens.accessToken);
    return { user, tokens };
  }

  public async register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await this.apiClient.post<AuthApiResponse>('/auth/register', params);

    const user: User = {
      id: res.user?.id || 'usr_' + Math.random().toString(36).substr(2, 9),
      email: res.user?.email || params.email,
      name: res.user?.name || params.name,
      role: (res.user?.role as 'admin' | 'developer' | 'viewer') || params.role || 'developer',
      createdAt: res.user?.created_at || new Date().toISOString(),
    };

    const tokens: AuthTokens = {
      accessToken: res.tokens?.access_token || res.token || 'mock_jwt_' + Date.now(),
      refreshToken: res.tokens?.refresh_token,
      expiresIn: res.tokens?.expires_in || 86400,
    };

    this.apiClient.setAuthToken(tokens.accessToken);
    return { user, tokens };
  }

  public async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout');
    } catch {
      // Ignore logout network failure, clear token locally
    } finally {
      this.apiClient.setAuthToken(null);
    }
  }

  public async forgotPassword(params: ForgotPasswordParams): Promise<{ message: string }> {
    const res = await this.apiClient.post<{ message?: string }>('/auth/forgot-password', params);
    return { message: res.message || 'Password reset link sent to your email.' };
  }

  public async registerFcmToken(token: string): Promise<void> {
    await this.apiClient.post('/auth/fcm-token', { fcm_token: token });
  }
}
