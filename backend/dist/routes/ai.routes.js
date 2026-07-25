import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
const router = Router();
const aiController = new AIController();
// Secure AI routes using JWT credentials check
router.use(authenticateJWT);
router.post('/summary', aiController.generateSummary);
router.post('/next-action', aiController.getNextAction);
router.post('/email', aiController.generateEmail);
router.post('/meeting-notes', aiController.parseNotes);
router.post('/natural-search', aiController.naturalSearch);
router.get('/insights', aiController.getInsights);
router.post('/chat', aiController.chat);
export default router;
