import { User, AuthTokens } from '../entities/user';

export interface LoginParams {
  email: string;
  password?: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'developer' | 'viewer';
}

export interface ForgotPasswordParams {
  email: string;
}

export interface IAuthRepository {
  login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }>;
  register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  forgotPassword(params: ForgotPasswordParams): Promise<{ message: string }>;
  registerFcmToken(token: string): Promise<void>;
}
