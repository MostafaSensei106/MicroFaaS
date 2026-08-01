import { UserProfile, IUserRepository } from '../../domain/repositories/user_repository';
import { IApiClient } from '@/src/core/network/api_client';

export class UserRepositoryImpl implements IUserRepository {
  private usersMock: UserProfile[] = [
    {
      id: 'usr_01',
      name: 'Mostafa Admin',
      email: 'admin@microfaas.io',
      role: 'admin',
      status: 'active',
      functionsCount: 12,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      fcmToken: 'fcm_token_sample_123',
    },
    {
      id: 'usr_02',
      name: 'Dev Engine Operator',
      email: 'dev@microfaas.io',
      role: 'developer',
      status: 'active',
      functionsCount: 5,
      lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'usr_03',
      name: 'Auditor Viewer',
      email: 'viewer@microfaas.io',
      role: 'viewer',
      status: 'active',
      functionsCount: 0,
      lastLoginAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ];

  constructor(private apiClient: IApiClient) {}

  public async getUsers(): Promise<UserProfile[]> {
    try {
      const data = await this.apiClient.get<UserProfile[]>('/users');
      return Array.isArray(data) ? data : this.usersMock;
    } catch {
      return this.usersMock;
    }
  }

  public async updateUserRole(userId: string, role: 'admin' | 'developer' | 'viewer'): Promise<UserProfile> {
    const user = this.usersMock.find((u) => u.id === userId);
    if (user) {
      user.role = role;
      return { ...user };
    }
    throw new Error('User not found');
  }

  public async deleteUser(userId: string): Promise<void> {
    this.usersMock = this.usersMock.filter((u) => u.id !== userId);
  }
}
