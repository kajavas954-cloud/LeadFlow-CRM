import { Request, Response, NextFunction } from 'express';

export function cookieParser(req: Request, res: Response, next: NextFunction): void {
  const cookieHeader = req.headers.cookie;
  const cookies: Record<string, string> = {};

  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (name && val) {
        cookies[name] = decodeURIComponent(val);
      }
    });
  }

  (req as any).cookies = cookies;
  next();
}
