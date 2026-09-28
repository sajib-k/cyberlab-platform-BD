import { ILabProvider, CreateLabInput, ProviderInstance, ProviderStatus, ConnectionInfo } from '../providers/lab-provider.interface';
import { MockProvider } from '../providers/mock.provider';
import { LifecycleStateMachine } from '../security/lifecycle-state-machine';
import { ResourcePolicyValidator } from '../security/resource-policy';

export class OrchestratorService {
  private provider: ILabProvider;

  constructor(provider?: ILabProvider) {
    this.provider = provider || new MockProvider();
  }

  async createInstance(input: CreateLabInput): Promise<ProviderInstance> {
    ResourcePolicyValidator.validate(input);
    return await this.provider.create(input);
  }

  async startInstance(instanceId: string): Promise<ProviderInstance> {
    const currentStatus = await this.provider.getStatus(instanceId);
    if (currentStatus === 'RUNNING') {
      // Idempotency: already running, return current state safely
      const conn = await this.provider.getConnectionInfo(instanceId);
      return { instanceId, status: 'RUNNING', createdAt: new Date(), updatedAt: new Date() };
    }
    LifecycleStateMachine.validateTransition(currentStatus, 'STARTING');
    return await this.provider.start(instanceId);
  }

  async stopInstance(instanceId: string): Promise<ProviderInstance> {
    const currentStatus = await this.provider.getStatus(instanceId);
    if (currentStatus === 'STOPPED' || currentStatus === 'DESTROYED') {
      // Idempotency
      return { instanceId, status: currentStatus, createdAt: new Date(), updatedAt: new Date() };
    }
    LifecycleStateMachine.validateTransition(currentStatus, 'STOPPING');
    return await this.provider.stop(instanceId);
  }

  async restartInstance(instanceId: string): Promise<ProviderInstance> {
    const currentStatus = await this.provider.getStatus(instanceId);
    LifecycleStateMachine.validateTransition(currentStatus, 'RESTARTING');
    return await this.provider.restart(instanceId);
  }

  async destroyInstance(instanceId: string): Promise<void> {
    const currentStatus = await this.provider.getStatus(instanceId);
    if (currentStatus === 'DESTROYED') return;
    LifecycleStateMachine.validateTransition(currentStatus, 'DESTROYING');
    await this.provider.destroy(instanceId);
  }

  async getStatus(instanceId: string): Promise<ProviderStatus> {
    return await this.provider.getStatus(instanceId);
  }

  async getConnectionInfo(instanceId: string): Promise<ConnectionInfo | null> {
    return await this.provider.getConnectionInfo(instanceId);
  }
}
