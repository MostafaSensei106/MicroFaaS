import { UserProfile, IUserRepository } from '../repositories/user_repository';

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(): Promise<UserProfile[]> {
    return this.userRepository.getUsers();
  }
}

export class UpdateUserRoleUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(userId: string, role: 'admin' | 'developer' | 'viewer'): Promise<UserProfile> {
    return this.userRepository.updateUserRole(userId, role);
  }
}

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<void> {
    return this.userRepository.deleteUser(userId);
  }
}
