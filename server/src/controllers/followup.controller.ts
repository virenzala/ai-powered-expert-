import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FollowUp } from '../models/FollowUp';
import { Lead } from '../models/Lead';

export const getFollowUps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, assignedUser, priority } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (assignedUser) query.assignedUser = assignedUser;
    if (priority) query.priority = priority;

    const followUps = await FollowUp.find(query)
      .populate('leadId', 'companyName contactName email country industry buyerType aiScore')
      .populate('assignedUser', 'name email')
      .sort({ dueDate: 1 });

    res.json({ success: true, data: followUps });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFollowUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId, dueDate, title, notes, priority } = req.body;
    const followUp = await FollowUp.create({
      leadId,
      assignedUser: req.user!._id,
      dueDate,
      title,
      notes,
      priority: priority || 'Medium',
      status: 'Pending',
    });

    await Lead.findByIdAndUpdate(leadId, {
      nextFollowUp: dueDate,
      leadStatus: 'Follow-up',
      outreachStatus: 'Follow Up Scheduled',
    });

    res.status(201).json({ success: true, data: followUp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFollowUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: followUp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeFollowUp = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed', completedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, message: 'Follow-up marked as completed', data: followUp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
