export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  functionsCount: number;
  lastLoginAt: string;
  createdAt: string;
  fcmToken?: string;
}

export interface IUserRepository {
  getUsers(): Promise<UserProfile[]>;
  updateUserRole(userId: string, role: 'admin' | 'developer' | 'viewer'): Promise<UserProfile>;
  deleteUser(userId: string): Promise<void>;
}
