import {
  FunctionEntity,
  CreateFunctionParams,
  InvokeFunctionParams,
  InvokeResponse,
  TestRunParams,
} from '../../domain/entities/function_entity';
import { IFunctionRepository } from '../../domain/repositories/function_repository';
import { IFunctionRemoteDataSource } from '../datasources/function_remote_datasource';

export class FunctionRepositoryImpl implements IFunctionRepository {
  private cachedFunctions: FunctionEntity[] = [];

  constructor(private remoteDataSource: IFunctionRemoteDataSource) {}

  public async listFunctions(): Promise<FunctionEntity[]> {
    const list = await this.remoteDataSource.listFunctions();
    this.cachedFunctions = list;
    return list;
  }

  public async getFunctionByName(name: string): Promise<FunctionEntity | null> {
    if (this.cachedFunctions.length === 0) {
      await this.listFunctions();
    }
    const found = this.cachedFunctions.find((f) => f.name.toLowerCase() === name.toLowerCase());
    return found || null;
  }

  public async createFunction(params: CreateFunctionParams): Promise<FunctionEntity> {
    const created = await this.remoteDataSource.createFunction(params);
    this.cachedFunctions.unshift(created);
    return created;
  }

  public async invokeFunction(params: InvokeFunctionParams): Promise<InvokeResponse> {
    return this.remoteDataSource.invokeFunction(params);
  }

  public async testRun(params: TestRunParams): Promise<InvokeResponse> {
    return this.remoteDataSource.testRun(params);
  }
}
