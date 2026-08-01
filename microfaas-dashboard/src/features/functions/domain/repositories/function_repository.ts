import {
  FunctionEntity,
  CreateFunctionParams,
  InvokeFunctionParams,
  InvokeResponse,
  TestRunParams,
} from '../entities/function_entity';

export interface IFunctionRepository {
  listFunctions(): Promise<FunctionEntity[]>;
  getFunctionByName(name: string): Promise<FunctionEntity | null>;
  createFunction(params: CreateFunctionParams): Promise<FunctionEntity>;
  invokeFunction(params: InvokeFunctionParams): Promise<InvokeResponse>;
  testRun(params: TestRunParams): Promise<InvokeResponse>;
}
