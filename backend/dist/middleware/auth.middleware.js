import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
export function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: 'Access token is missing',
        });
        return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({
            success: false,
            message: 'Token format must be Bearer <token>',
        });
        return;
    }
    const token = parts[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired access token',
        });
    }
}
