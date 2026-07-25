import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getAnalyticsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await analyticsService.getAnalyticsSummary();
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch analytics summary',
      });
    }
  }
}
