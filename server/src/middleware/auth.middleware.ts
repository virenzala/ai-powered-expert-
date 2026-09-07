import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User, IUser, UserRole } from '../models/User';
import { inMemoryStore } from '../services/inMemoryStore';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.', code: 'UNAUTHORIZED' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: UserRole };

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(decoded.id).select('-passwordHash');
      } catch (dbErr) {
        user = inMemoryStore.findUserById(decoded.id);
      }
    }
    if (!user) {
      user = inMemoryStore.findUserById(decoded.id);
    }

    if (!user || user.active === false) {
      res.status(401).json({ success: false, message: 'Invalid token or user account inactive.', code: 'UNAUTHORIZED' });
      return;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Token verification failed: ' + error.message, code: 'UNAUTHORIZED' });
  }
};
