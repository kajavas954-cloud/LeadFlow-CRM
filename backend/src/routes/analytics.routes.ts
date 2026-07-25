import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/', authenticateJWT, analyticsController.getAnalyticsSummary);

export default router;
