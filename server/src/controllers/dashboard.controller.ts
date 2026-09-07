import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Lead } from '../models/Lead';
import { EmailLog } from '../models/EmailLog';
import { Campaign } from '../models/Campaign';
import { FollowUp } from '../models/FollowUp';
import { ActivityLog } from '../models/ActivityLog';
import { inMemoryStore } from '../services/inMemoryStore';

export const getDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const totalLeads = await Lead.countDocuments();
        const validContacts = await Lead.countDocuments({ validationStatus: 'Valid' });
        const invalidContacts = await Lead.countDocuments({ validationStatus: { $in: ['Invalid', 'Disposable'] } });
        const qualifiedBuyers = await Lead.countDocuments({
          $or: [{ aiScore: { $gte: 70 } }, { leadStatus: 'Qualified' }],
        });

        const emailsSent = await EmailLog.countDocuments({ status: 'Sent' });
        const responses = await Lead.countDocuments({ leadStatus: 'Replied' });
        const followupsPending = await FollowUp.countDocuments({ status: 'Pending' });
        const activeCampaigns = await Campaign.countDocuments({ status: { $in: ['Running', 'Approved'] } });

        // Funnel counts
        const cleanedCount = await Lead.countDocuments({ validationStatus: { $ne: 'Not Checked' } });
        const validatedCount = await Lead.countDocuments({ validationStatus: 'Valid' });
        const qualifiedCount = qualifiedBuyers;
        const contactedCount = await Lead.countDocuments({ outreachStatus: { $in: ['Email Sent', 'Follow Up Scheduled', 'Replied'] } });
        const repliedCount = responses;

        // Follow-ups due today or overdue
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const followUpsDueToday = await FollowUp.find({
          status: 'Pending',
          dueDate: { $lte: endOfDay },
        })
          .populate('leadId', 'companyName contactName email country')
          .populate('assignedUser', 'name')
          .sort({ dueDate: 1 })
          .limit(10);

        // Active campaign summaries
        const campaignSummaries = await Campaign.find({ status: { $in: ['Running', 'Approved', 'Completed'] } })
          .sort({ updatedAt: -1 })
          .limit(5);

        // Recent activity log
        const recentActivity = await ActivityLog.find().sort({ createdAt: -1 }).limit(10);

        res.json({
          success: true,
          kpis: {
            totalLeads,
            validContacts,
            invalidContacts,
            qualifiedBuyers,
            emailsSent,
            responses,
            followupsPending,
            activeCampaigns,
          },
          funnel: [
            { stage: 'Imported', count: totalLeads },
            { stage: 'Cleaned', count: cleanedCount },
            { stage: 'Validated', count: validatedCount },
            { stage: 'Qualified', count: qualifiedCount },
            { stage: 'Contacted', count: contactedCount },
            { stage: 'Replied', count: repliedCount },
          ],
          campaignSummaries,
          followUpsDueToday,
          recentActivity,
        });
        return;
      } catch (dbErr) {
        // Fallback below
      }
    }

    // In-memory fallback
    const memLeads = inMemoryStore.getLeads();
    const memCampaigns = inMemoryStore.getCampaigns();
    const memLogs = inMemoryStore.activityLogs;

    const totalLeads = memLeads.length;
    const validContacts = memLeads.filter((l) => l.validationStatus === 'Valid').length;
    const invalidContacts = memLeads.filter((l) => l.validationStatus === 'Invalid').length;
    const qualifiedBuyers = memLeads.filter((l) => (l.aiScore && l.aiScore >= 70) || l.leadStatus === 'Qualified').length;

    res.json({
      success: true,
      kpis: {
        totalLeads,
        validContacts,
        invalidContacts,
        qualifiedBuyers,
        emailsSent: 2,
        responses: 1,
        followupsPending: 1,
        activeCampaigns: memCampaigns.length,
      },
      funnel: [
        { stage: 'Imported', count: totalLeads },
        { stage: 'Cleaned', count: totalLeads },
        { stage: 'Validated', count: validContacts },
        { stage: 'Qualified', count: qualifiedBuyers },
        { stage: 'Contacted', count: 2 },
        { stage: 'Replied', count: 1 },
      ],
      campaignSummaries: memCampaigns,
      followUpsDueToday: [
        {
          _id: 'fu_mem_1',
          leadId: memLeads[0],
          title: 'Send container FOB Hamburg price quotation to Dr. Klaus Becker',
          dueDate: new Date(),
          status: 'Pending',
          priority: 'High',
        },
      ],
      recentActivity: memLogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
