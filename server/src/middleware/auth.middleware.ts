import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
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

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.active) {
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
