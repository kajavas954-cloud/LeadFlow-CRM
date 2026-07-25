import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { mockPrisma } from './setup.js';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth & Role Authorization API Tests', () => {
  const mockUser = {
    id: 'user-uuid-1111',
    name: 'Sales Rep 1',
    email: 'rep1@leadflow.com',
    password: 'hashedpassword123',
    role: Role.SALES_MEMBER,
    refreshToken: 'valid-refresh-token',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        password: 'newhashedpassword',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sales Rep 1',
          email: 'rep1@leadflow.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe('rep1@leadflow.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should fail registration if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Sales Rep 1',
          email: 'rep1@leadflow.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in successfully and return JWT access token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true) as any);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rep1@leadflow.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe('rep1@leadflow.com');
      
      // Verify cookie is set
      const cookies = res.headers['set-cookie'] || [];
      expect(cookies.some((c: string) => c.includes('refreshToken'))).toBe(true);
    });

    it('should fail login with invalid password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false) as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rep1@leadflow.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Route Authorization Checks', () => {
    it('should block requests without a valid token (401)', async () => {
      const res = await request(app).get('/api/leads');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should allow sales member to view leads', async () => {
      const token = jwt.sign(
        { userId: 'user-uuid-1111', email: 'rep1@leadflow.com', role: Role.SALES_MEMBER },
        'test-secret'
      );

      mockPrisma.lead.findMany.mockResolvedValue([]);
      mockPrisma.lead.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/leads')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should block non-admins from accessing assignment route (403)', async () => {
      const token = jwt.sign(
        { userId: 'user-uuid-1111', email: 'rep1@leadflow.com', role: Role.SALES_MEMBER },
        'test-secret'
      );

      const res = await request(app)
        .patch('/api/leads/lead-id-123/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedToId: 'another-user-id' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
