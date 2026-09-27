import { Injectable } from '@nestjs/common';

export interface FinancialData {
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  initialInvestment: number;
}

@Injectable()
export class FinancialService {
  /**
   * Calculate total profit (Net Income)
   */
  calculateProfit(data: FinancialData): number {
    return data.revenue - (data.fixedCosts + data.variableCosts);
  }

  /**
   * Calculate Return on Investment (ROI)
   * Formula: (Net Profit / Investment) * 100
   */
  calculateROI(data: FinancialData): number {
    const profit = this.calculateProfit(data);
    if (data.initialInvestment === 0) return 0;
    return (profit / data.initialInvestment) * 100;
  }

  /**
   * Calculate Break-Even Point (in revenue)
   * Formula: Fixed Costs / (1 - (Variable Costs / Revenue))
   */
  calculateBreakEven(data: FinancialData): number {
    if (data.revenue === 0 || data.revenue === data.variableCosts) return 0;
    const contributionMarginRatio = 1 - (data.variableCosts / data.revenue);
    return data.fixedCosts / contributionMarginRatio;
  }
}
