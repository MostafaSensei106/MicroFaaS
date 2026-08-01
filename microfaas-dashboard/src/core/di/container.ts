import { FetchApiClient, IApiClient } from '../network/api_client';
import { AuthRemoteDataSource, IAuthRemoteDataSource } from '@/src/features/auth/data/datasources/auth_remote_datasource';
import { AuthRepositoryImpl } from '@/src/features/auth/data/repositories/auth_repository_impl';
import { IAuthRepository } from '@/src/features/auth/domain/repositories/auth_repository';
import {
  LoginUseCase,
} from '@/src/features/auth/domain/usecases/login_usecase';
import {
  RegisterUseCase,
} from '@/src/features/auth/domain/usecases/register_usecase';
import {
  LogoutUseCase,
  ForgotPasswordUseCase,
  GetCurrentUserUseCase,
} from '@/src/features/auth/domain/usecases/auth_usecases';

import { FunctionRemoteDataSource, IFunctionRemoteDataSource } from '@/src/features/functions/data/datasources/function_remote_datasource';
import { FunctionRepositoryImpl } from '@/src/features/functions/data/repositories/function_repository_impl';
import { IFunctionRepository } from '@/src/features/functions/domain/repositories/function_repository';
import {
  ListFunctionsUseCase,
  GetFunctionByNameUseCase,
  CreateFunctionUseCase,
  InvokeFunctionUseCase,
  TestRunUseCase,
} from '@/src/features/functions/domain/usecases/function_usecases';

import { UserRepositoryImpl } from '@/src/features/users/data/repositories/user_repository_impl';
import { IUserRepository } from '@/src/features/users/domain/repositories/user_repository';
import {
  GetUsersUseCase,
  UpdateUserRoleUseCase,
  DeleteUserUseCase,
} from '@/src/features/users/domain/usecases/user_usecases';

/**
 * Clean Architecture Dependency Injection Container (Dagger / Service Locator Pattern)
 */
class DIContainer {
  private static instance: DIContainer;

  // Network & Core Services
  public readonly apiClient: IApiClient;

  // Auth Feature
  public readonly authRemoteDataSource: IAuthRemoteDataSource;
  public readonly authRepository: IAuthRepository;
  public readonly loginUseCase: LoginUseCase;
  public readonly registerUseCase: RegisterUseCase;
  public readonly logoutUseCase: LogoutUseCase;
  public readonly forgotPasswordUseCase: ForgotPasswordUseCase;
  public readonly getCurrentUserUseCase: GetCurrentUserUseCase;

  // Functions Feature
  public readonly functionRemoteDataSource: IFunctionRemoteDataSource;
  public readonly functionRepository: IFunctionRepository;
  public readonly listFunctionsUseCase: ListFunctionsUseCase;
  public readonly getFunctionByNameUseCase: GetFunctionByNameUseCase;
  public readonly createFunctionUseCase: CreateFunctionUseCase;
  public readonly invokeFunctionUseCase: InvokeFunctionUseCase;
  public readonly testRunUseCase: TestRunUseCase;

  // User Management Feature
  public readonly userRepository: IUserRepository;
  public readonly getUsersUseCase: GetUsersUseCase;
  public readonly updateUserRoleUseCase: UpdateUserRoleUseCase;
  public readonly deleteUserUseCase: DeleteUserUseCase;

  private constructor() {
    // 1. Initialize Network Client
    this.apiClient = new FetchApiClient('/api/v1');

    // 2. Initialize Auth Dependencies
    this.authRemoteDataSource = new AuthRemoteDataSource(this.apiClient);
    this.authRepository = new AuthRepositoryImpl(this.authRemoteDataSource);
    this.loginUseCase = new LoginUseCase(this.authRepository);
    this.registerUseCase = new RegisterUseCase(this.authRepository);
    this.logoutUseCase = new LogoutUseCase(this.authRepository);
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(this.authRepository);
    this.getCurrentUserUseCase = new GetCurrentUserUseCase(this.authRepository);

    // 3. Initialize Functions Dependencies
    this.functionRemoteDataSource = new FunctionRemoteDataSource(this.apiClient);
    this.functionRepository = new FunctionRepositoryImpl(this.functionRemoteDataSource);
    this.listFunctionsUseCase = new ListFunctionsUseCase(this.functionRepository);
    this.getFunctionByNameUseCase = new GetFunctionByNameUseCase(this.functionRepository);
    this.createFunctionUseCase = new CreateFunctionUseCase(this.functionRepository);
    this.invokeFunctionUseCase = new InvokeFunctionUseCase(this.functionRepository);
    this.testRunUseCase = new TestRunUseCase(this.functionRepository);

    // 4. Initialize User Management Dependencies
    this.userRepository = new UserRepositoryImpl(this.apiClient);
    this.getUsersUseCase = new GetUsersUseCase(this.userRepository);
    this.updateUserRoleUseCase = new UpdateUserRoleUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }
}

export const container = DIContainer.getInstance();
