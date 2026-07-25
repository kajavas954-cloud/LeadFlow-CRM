import dotenv from 'dotenv';
dotenv.config();
export const JWT_SECRET = process.env.JWT_SECRET || 'leadflow-crm-access-token-secret-key-12345';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'leadflow-crm-refresh-token-secret-key-54321';
export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days
