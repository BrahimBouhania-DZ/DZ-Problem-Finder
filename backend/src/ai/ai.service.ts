import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class AiService {
  private redisClient: Redis;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async askQuestion(prompt: string): Promise<string> {
    // 1. Generate a consistent cache key based on the prompt
    const cacheKey = `ai_cache:${Buffer.from(prompt).toString('base64')}`;

    // 2. Check if the answer exists in Redis Cache
    const cachedAnswer = await this.redisClient.get(cacheKey);
    if (cachedAnswer) {
      this.logger.log('Cache Hit: Returning saved AI response.');
      return cachedAnswer;
    }

    this.logger.log('Cache Miss: Calling external AI API...');
    
    // 3. (Mock) Call external AI Provider here
    // In reality, this would be an HTTP request to OpenAI/Anthropic/etc.
    const externalAiResponse = `Here is the AI generated response for: "${prompt}"`;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Save the new answer in Cache for future requests (e.g. valid for 24 hours)
    await this.redisClient.set(cacheKey, externalAiResponse, 'EX', 60 * 60 * 24);

    return externalAiResponse;
  }
}
