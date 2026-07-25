import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { Role } from '@prisma/client';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const user = await authService.register(name, email, password, role);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await authService.login(email, password);

      // Set HTTP-Only Cookie for Refresh Token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          user,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed',
      });
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }

      const { accessToken, user } = await authService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          user,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Invalid refresh token',
      });
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      if (userId) {
        await authService.logout(userId);
      }

      res.clearCookie('refreshToken');
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await authService.getUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve users',
      });
    }
  }
}
