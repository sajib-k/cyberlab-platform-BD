import { Module } from '@nestjs/common';
import { LabProviderFactory } from './providers/lab-provider.factory';

@Module({
  providers: [LabProviderFactory],
  exports: [LabProviderFactory],
})
export class LabOrchestratorModule {}
