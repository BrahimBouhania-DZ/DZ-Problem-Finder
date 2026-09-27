import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service.js';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async ask(@Body('prompt') prompt: string) {
    if (!prompt) {
      return { success: false, error: 'Prompt is required' };
    }
    
    const response = await this.aiService.askQuestion(prompt);
    return { success: true, response };
  }
}
