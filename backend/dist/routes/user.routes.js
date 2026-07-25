import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
const router = Router();
const authController = new AuthController();
// GET /api/users
router.get('/', authenticateJWT, authController.getUsers);
export default router;
