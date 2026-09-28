import { Module } from '@nestjs/common';
import { MachineLifecycleService } from './machine-lifecycle.service';
import { MachineController } from './machine.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MachineController],
  providers: [MachineLifecycleService],
  exports: [MachineLifecycleService],
})
export class MachineModule {}
