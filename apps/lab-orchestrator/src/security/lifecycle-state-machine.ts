import { ProviderStatus } from '../providers/lab-provider.interface';

const ALLOWED_TRANSITIONS: Record<ProviderStatus, ProviderStatus[]> = {
  CREATING: ['CREATED', 'ERROR'],
  CREATED: ['STARTING', 'DESTROYING', 'ERROR'],
  STARTING: ['RUNNING', 'ERROR', 'STOPPED'],
  RUNNING: ['STOPPING', 'RESTARTING', 'DESTROYING', 'ERROR'],
  STOPPING: ['STOPPED', 'ERROR'],
  STOPPED: ['STARTING', 'DESTROYING', 'ERROR'],
  RESTARTING: ['RUNNING', 'ERROR'],
  DESTROYING: ['DESTROYED', 'ERROR'],
  DESTROYED: [],
  ERROR: ['DESTROYING'],
  UNKNOWN: ['CREATING'],
};

export class LifecycleStateMachine {
  static canTransition(current: ProviderStatus, target: ProviderStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  static validateTransition(current: ProviderStatus, target: ProviderStatus): void {
    if (!this.canTransition(current, target)) {
      throw new Error(`INVALID_LIFECYCLE_TRANSITION: Cannot transition from ${current} to ${target}`);
    }
  }
}
