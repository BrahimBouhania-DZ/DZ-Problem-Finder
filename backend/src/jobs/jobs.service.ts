import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue('ai-tasks') private readonly aiQueue: Queue,
  ) {}

  async dispatchAITask(projectId: string, taskType: string) {
    const job = await this.aiQueue.add(taskType, {
      projectId,
      timestamp: new Date().toISOString(),
    });
    return { jobId: job.id, status: 'Queued' };
  }
}
