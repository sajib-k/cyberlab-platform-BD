import { LabStatus } from '@cyberlab/types';

export interface ILabProvider {
  createLab(labId: string, userId: string): Promise<boolean>;
  startLab(labId: string): Promise<boolean>;
  stopLab(labId: string): Promise<boolean>;
  destroyLab(labId: string): Promise<boolean>;
  getLabStatus(labId: string): Promise<LabStatus>;
  getConnectionInfo(labId: string): Promise<{ ip: string; port?: number }>;
}
