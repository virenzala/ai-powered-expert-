import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ActivityLog } from '../models/ActivityLog';

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, entityType, user } = req.query;
    const query: any = {};
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (user) query.user = user;

    const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
