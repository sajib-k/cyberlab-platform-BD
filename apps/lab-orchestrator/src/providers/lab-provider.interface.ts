export type ProviderStatus =
  | 'CREATING'
  | 'CREATED'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPING'
  | 'STOPPED'
  | 'RESTARTING'
  | 'DESTROYING'
  | 'DESTROYED'
  | 'ERROR'
  | 'UNKNOWN';

export interface PortConfig {
  containerPort: number;
  protocol: 'TCP' | 'UDP';
}

export interface CreateLabInput {
  instanceId: string;
  templateId: string;
  image: string;
  imageTag: string;
  cpuLimit: number; // e.g. 1-8 cores
  memoryLimit: number; // in MB
  storageLimit: number; // in GB
  timeoutMinutes: number;
  ports?: PortConfig[];
  networkPolicy?: {
    internetAccess: boolean;
    isolatedNetwork: boolean;
  };
}

export interface ProviderInstance {
  instanceId: string;
  status: ProviderStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ConnectionInfo {
  host: string;
  port: number;
  protocol: string;
  url?: string;
}

export interface ILabProvider {
  create(input: CreateLabInput): Promise<ProviderInstance>;
  start(instanceId: string): Promise<ProviderInstance>;
  stop(instanceId: string): Promise<ProviderInstance>;
  restart(instanceId: string): Promise<ProviderInstance>;
  destroy(instanceId: string): Promise<void>;
  getStatus(instanceId: string): Promise<ProviderStatus>;
  getConnectionInfo(instanceId: string): Promise<ConnectionInfo | null>;
}
