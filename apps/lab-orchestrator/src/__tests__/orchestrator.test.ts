import { OrchestratorService } from '../services/orchestrator.service';
import { LifecycleStateMachine } from '../security/lifecycle-state-machine';
import { ResourcePolicyValidator } from '../security/resource-policy';

describe('Lab Orchestrator Foundation & MockProvider', () => {
  let orchestrator: OrchestratorService;

  beforeEach(() => {
    orchestrator = new OrchestratorService();
  });

  const validLabInput = {
    instanceId: 'inst-test-123',
    templateId: 'tmpl-abc',
    image: 'cyberlab/web-vuln',
    imageTag: 'v1.0',
    cpuLimit: 2,
    memoryLimit: 1024,
    storageLimit: 10,
    timeoutMinutes: 60,
  };

  test('Should create and manage lifecycle correctly', async () => {
    const created = await orchestrator.createInstance(validLabInput);
    expect(created.status).toBe('CREATED');

    const started = await orchestrator.startInstance(validLabInput.instanceId);
    expect(started.status).toBe('RUNNING');

    const conn = await orchestrator.getConnectionInfo(validLabInput.instanceId);
    expect(conn).not.toBeNull();
    expect(conn?.host).toBe('127.0.0.1');

    const stopped = await orchestrator.stopInstance(validLabInput.instanceId);
    expect(stopped.status).toBe('STOPPED');

    await orchestrator.destroyInstance(validLabInput.instanceId);
    const status = await orchestrator.getStatus(validLabInput.instanceId);
    expect(status).toBe('UNKNOWN');
  });

  test('Should enforce lifecycle state machine transition rules', () => {
    expect(LifecycleStateMachine.canTransition('DESTROYED', 'RUNNING')).toBe(false);
    expect(LifecycleStateMachine.canTransition('CREATED', 'STARTING')).toBe(true);
    
    expect(() => {
      LifecycleStateMachine.validateTransition('DESTROYED', 'RUNNING');
    }).toThrow('INVALID_LIFECYCLE_TRANSITION');
  });

  test('Should enforce resource policies and reject unsafe configurations', () => {
    const unsafeCpuInput = { ...validLabInput, cpuLimit: 16 }; // Invalid > 8
    expect(() => {
      ResourcePolicyValidator.validate(unsafeCpuInput);
    }).toThrow('INVALID_RESOURCE_LIMIT');

    const unsafeImageInput = { ...validLabInput, image: '/etc/passwd' };
    expect(() => {
      ResourcePolicyValidator.validate(unsafeImageInput);
    }).toThrow('UNSAFE_IMAGE_CONFIGURATION');
  });

  test('Should handle idempotent operations safely', async () => {
    await orchestrator.createInstance(validLabInput);
    await orchestrator.startInstance(validLabInput.instanceId);

    // Calling start again on RUNNING instance should be idempotent
    const startedAgain = await orchestrator.startInstance(validLabInput.instanceId);
    expect(startedAgain.status).toBe('RUNNING');
  });
});
