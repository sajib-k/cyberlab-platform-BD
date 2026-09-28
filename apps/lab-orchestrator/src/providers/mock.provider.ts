import { ILabProvider, CreateLabInput, ProviderInstance, ProviderStatus, ConnectionInfo } from './lab-provider.interface';

export class MockProvider implements ILabProvider {
  private instances = new Map<string, { instance: ProviderInstance; input: CreateLabInput }>();

  async create(input: CreateLabInput): Promise<ProviderInstance> {
    const instance: ProviderInstance = {
      instanceId: input.instanceId,
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { templateId: input.templateId, image: `${input.image}:${input.imageTag}` },
    };
    this.instances.set(input.instanceId, { instance, input });
    return instance;
  }

  async start(instanceId: string): Promise<ProviderInstance> {
    const record = this.instances.get(instanceId);
    if (!record) throw new Error('INSTANCE_NOT_FOUND');

    record.instance.status = 'STARTING';
    record.instance.updatedAt = new Date();

    // Simulate async startup transition to RUNNING
    record.instance.status = 'RUNNING';
    record.instance.updatedAt = new Date();

    return record.instance;
  }

  async stop(instanceId: string): Promise<ProviderInstance> {
    const record = this.instances.get(instanceId);
    if (!record) throw new Error('INSTANCE_NOT_FOUND');

    record.instance.status = 'STOPPING';
    record.instance.updatedAt = new Date();

    record.instance.status = 'STOPPED';
    record.instance.updatedAt = new Date();

    return record.instance;
  }

  async restart(instanceId: string): Promise<ProviderInstance> {
    const record = this.instances.get(instanceId);
    if (!record) throw new Error('INSTANCE_NOT_FOUND');

    record.instance.status = 'RESTARTING';
    record.instance.updatedAt = new Date();

    record.instance.status = 'RUNNING';
    record.instance.updatedAt = new Date();

    return record.instance;
  }

  async destroy(instanceId: string): Promise<void> {
    const record = this.instances.get(instanceId);
    if (!record) throw new Error('INSTANCE_NOT_FOUND');

    record.instance.status = 'DESTROYING';
    record.instance.updatedAt = new Date();

    record.instance.status = 'DESTROYED';
    this.instances.delete(instanceId);
  }

  async getStatus(instanceId: string): Promise<ProviderStatus> {
    const record = this.instances.get(instanceId);
    if (!record) return 'UNKNOWN';
    return record.instance.status;
  }

  async getConnectionInfo(instanceId: string): Promise<ConnectionInfo | null> {
    const record = this.instances.get(instanceId);
    if (!record || record.instance.status !== 'RUNNING') return null;

    return {
      host: '127.0.0.1',
      port: record.input.ports?.[0]?.containerPort || 80,
      protocol: 'http',
      url: `http://127.0.0.1:${record.input.ports?.[0]?.containerPort || 80}`,
    };
  }
}
