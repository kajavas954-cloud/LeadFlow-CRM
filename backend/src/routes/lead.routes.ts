import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { CreateLeadSchema, UpdateLeadSchema, AssignLeadSchema, CreateNoteSchema, PublicLeadSchema } from '../models/validation.schemas.js';
import { Role } from '@prisma/client';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();
const leadController = new LeadController();

// Public lead capture route (no authentication required)
router.post('/public', authLimiter, validateBody(PublicLeadSchema), leadController.capturePublicLead);

// Protected routes (require valid JWT)
router.get('/', authenticateJWT, leadController.getLeads);
router.post('/', authenticateJWT, validateBody(CreateLeadSchema), leadController.createLead);

router.get('/:id', authenticateJWT, leadController.getLeadById);
router.put('/:id', authenticateJWT, validateBody(UpdateLeadSchema), leadController.updateLead);

// Only ADMIN can delete leads
router.delete('/:id', authenticateJWT, authorizeRoles(Role.ADMIN), leadController.deleteLead);

// Only ADMIN can assign/reassign leads
router.patch('/:id/assign', authenticateJWT, authorizeRoles(Role.ADMIN), validateBody(AssignLeadSchema), leadController.assignLead);

// Lead Notes routes
router.post('/:id/notes', authenticateJWT, validateBody(CreateNoteSchema), leadController.addNote);
router.get('/:id/notes', authenticateJWT, leadController.getNotes);
router.delete('/notes/:noteId', authenticateJWT, leadController.deleteNote);

// Lead Activity routes
router.get('/:id/activity', authenticateJWT, leadController.getActivityLogs);

export default router;
