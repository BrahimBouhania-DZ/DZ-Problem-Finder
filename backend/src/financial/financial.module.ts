import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service.js';
import { FinancialController } from './financial.controller.js';

@Module({
  providers: [FinancialService],
  controllers: [FinancialController]
})
export class FinancialModule {}
