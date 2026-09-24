export enum LabStatus {
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  STOPPING = 'STOPPING',
  FAILED = 'FAILED',
}

export type LabStatusType = keyof typeof LabStatus;
