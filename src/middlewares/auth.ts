import { Request, Response, NextFunction } from 'ultimate-express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import dotenv from 'dotenv';
dotenv.config

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };

    // Get user from database
    const user = await db('users')
      .where({ id: decoded.userId })
      .select('id', 'username', 'email')
      .first();

    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      message: 'Invalid token',
      error: error.message
    });
    return;
  }
};