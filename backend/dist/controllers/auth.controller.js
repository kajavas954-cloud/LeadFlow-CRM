import { AuthService } from '../services/auth.service.js';
const authService = new AuthService();
export class AuthController {
    async register(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            const user = await authService.register(name, email, password, role);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: user,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed',
            });
        }
    }
    async login(req, res, next) {
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
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Authentication failed',
            });
        }
    }
    async refresh(req, res, next) {
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
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message || 'Invalid refresh token',
            });
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (userId) {
                await authService.logout(userId);
            }
            res.clearCookie('refreshToken');
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Logout failed',
            });
        }
    }
    async getUsers(req, res, next) {
        try {
            const users = await authService.getUsers();
            res.status(200).json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve users',
            });
        }
    }
}
