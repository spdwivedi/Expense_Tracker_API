import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Types
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

// Middleware
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Malformed token profile' });
    return;
  }

  try {
    const secret: string = process.env.JWT_SECRET || 'fallback_secret_key';
    const decoded = jwt.verify(token, secret) as unknown as { id: string };
    
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};