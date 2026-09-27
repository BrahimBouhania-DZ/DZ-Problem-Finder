import { Controller, Post, Body } from '@nestjs/common';
import { FinancialService, FinancialData } from './financial.service.js';

@Controller('api/financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post('analyze')
  analyzeProject(@Body() data: FinancialData) {
    const profit = this.financialService.calculateProfit(data);
    const roi = this.financialService.calculateROI(data);
    const breakEven = this.financialService.calculateBreakEven(data);

    return {
      success: true,
      results: {
        profit,
        roi,
        breakEven
      }
    };
  }
}
