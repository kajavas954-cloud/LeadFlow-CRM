import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { RegisterSchema, LoginSchema } from '../models/validation.schemas.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
const router = Router();
const authController = new AuthController();
router.post('/register', authLimiter, validateBody(RegisterSchema), authController.register);
router.post('/login', authLimiter, validateBody(LoginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticateJWT, authController.logout);
// Added helper endpoint to get list of users (sales members/admins) for lead assignment
router.get('/users', authenticateJWT, authController.getUsers);
export default router;
