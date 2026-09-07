import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Suppression } from '../models/Suppression';
import { Lead } from '../models/Lead';

export const getSuppressions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const suppressions = await Suppression.find().populate('addedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: suppressions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSuppression = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, company, reason } = req.body;
    const suppression = await Suppression.create({
      email: email.toLowerCase(),
      company,
      reason: reason || 'Opted out',
      source: 'Manual Add',
      addedBy: req.user?._id,
    });

    await Lead.updateMany({ email: email.toLowerCase() }, { leadStatus: 'Suppressed' });

    res.status(201).json({ success: true, data: suppression });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSuppression = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Suppression.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Removed from suppression list' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
