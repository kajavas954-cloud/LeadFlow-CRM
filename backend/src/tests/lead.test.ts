import request from 'supertest';
import app from '../app.js';
import { mockPrisma } from './setup.js';
import { Role, LeadStatus, Priority, LeadSource } from '@prisma/client';
import jwt from 'jsonwebtoken';

describe('Leads API Tests', () => {
  const adminId = 'a0000000-0000-0000-0000-000000000000';
  const salesId = 'b0000000-0000-0000-0000-000000000000';
  const leadId = 'c0000000-0000-0000-0000-000000000000';

  const adminToken = jwt.sign(
    { userId: adminId, email: 'admin@leadflow.com', role: Role.ADMIN },
    'test-secret'
  );

  const salesToken = jwt.sign(
    { userId: salesId, email: 'sales@leadflow.com', role: Role.SALES_MEMBER },
    'test-secret'
  );

  const mockLead = {
    id: leadId,
    name: 'Wayne Enterprises',
    email: 'bruce@wayne.co',
    phone: '+1-555-1234',
    company: 'Wayne Enterprises Corp',
    website: 'https://wayne.co',
    source: LeadSource.COLD_EMAIL,
    priority: Priority.HIGH,
    status: LeadStatus.NEW,
    score: 55,
    assignedToId: salesId,
    createdById: adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('POST /api/leads', () => {
    it('should create a lead and record creation and assignment logs', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(null);
      mockPrisma.lead.create.mockResolvedValue(mockLead);
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'log-uuid-1' });

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          name: 'Wayne Enterprises',
          email: 'bruce@wayne.co',
          phone: '+1-555-1234',
          company: 'Wayne Enterprises Corp',
          website: 'https://wayne.co',
          source: LeadSource.COLD_EMAIL,
          priority: Priority.HIGH,
          assignedToId: salesId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Wayne Enterprises');
      expect(mockPrisma.lead.create).toHaveBeenCalled();
      expect(mockPrisma.activityLog.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/leads/:id', () => {
    it('should update lead and log status change', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(mockLead);
      mockPrisma.lead.update.mockResolvedValue({
        ...mockLead,
        status: LeadStatus.CONTACTED,
      });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'log-uuid-2' });

      const res = await request(app)
        .put(`/api/leads/${mockLead.id}`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          status: LeadStatus.CONTACTED,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(LeadStatus.CONTACTED);
      expect(mockPrisma.activityLog.create).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/leads/:id/assign', () => {
    it('should allow ADMIN to assign lead', async () => {
      mockPrisma.lead.findUnique.mockResolvedValue(mockLead);
      mockPrisma.user.findUnique.mockResolvedValue({ id: salesId, name: 'John Doe', role: Role.SALES_MEMBER });
      mockPrisma.lead.update.mockResolvedValue({
        ...mockLead,
        assignedToId: salesId,
      });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'log-uuid-3' });

      const res = await request(app)
        .patch(`/api/leads/${mockLead.id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          assignedToId: salesId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.activityLog.create).toHaveBeenCalled();
    });

    it('should forbid Sales Members from assigning leads', async () => {
      const res = await request(app)
        .patch(`/api/leads/${mockLead.id}/assign`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          assignedToId: salesId,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Lead Notes API', () => {
    it('should add a note to a lead and record in activity log', async () => {
      mockPrisma.leadNote.create.mockResolvedValue({
        id: 'note-uuid-999',
        leadId: mockLead.id,
        authorId: salesId,
        note: 'Interested in enterprise trial.',
        createdAt: new Date(),
      });
      mockPrisma.activityLog.create.mockResolvedValue({ id: 'log-uuid-4' });

      const res = await request(app)
        .post(`/api/leads/${mockLead.id}/notes`)
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          note: 'Interested in enterprise trial.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.note).toBe('Interested in enterprise trial.');
    });

    it('should fetch notes for a lead', async () => {
      mockPrisma.leadNote.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get(`/api/leads/${mockLead.id}/notes`)
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
