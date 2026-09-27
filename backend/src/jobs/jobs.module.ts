import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JobsService } from './jobs.service.js';
import { JobsProcessor } from './jobs.processor.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-tasks',
    }),
  ],
  providers: [JobsService, JobsProcessor],
  exports: [JobsService],
})
export class JobsModule {}
