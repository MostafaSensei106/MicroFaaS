export type FunctionStatus = 'ready' | 'pending' | 'building' | 'deploying' | 'running' | 'completed' | 'failed';

export interface FunctionEntity {
  id: string;
  name: string;
  runtime: string;
  imageTag: string;
  envVars: Record<string, string>;
  timeoutSeconds: number;
  memoryLimitMB: number;
  status: FunctionStatus;
  createdAt: string;
  updatedAt?: string;
  executionsCount?: number;
}

export type ExecutionStatus = 'success' | 'failed' | 'timed_out';

export interface ExecutionEntity {
  id: string;
  functionId: string;
  status: ExecutionStatus;
  statusCode: number;
  durationMs: number;
  logs: string;
  executedAt: string;
}

export interface CreateFunctionParams {
  name: string;
  runtime: string;
  imageTag: string;
  envVars?: Record<string, string>;
  timeoutSeconds?: number;
  memoryLimitMB?: number;
}

export interface InvokeFunctionParams {
  name: string;
  payload?: Record<string, unknown>;
}

export interface TestRunParams {
  imageTag?: string;
  envVars?: Record<string, string>;
  timeoutSeconds?: number;
  memoryLimitMB?: number;
}

export interface InvokeResponse {
  execution_id: string;
  status_code: number;
  duration_ms: number;
  logs: string;
}
