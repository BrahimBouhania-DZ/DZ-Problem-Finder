import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('ai-tasks')
export class JobsProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`Processing job ${job.id} of type ${job.name}...`);
    console.log('Job data:', job.data);
    
    // Simulate a long-running task like an AI call or PDF generation
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    console.log(`Job ${job.id} completed!`);
    return { status: 'success', result: 'Simulated result for ' + job.name };
  }
}
