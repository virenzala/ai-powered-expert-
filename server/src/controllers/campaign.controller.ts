import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Campaign } from '../models/Campaign';
import { CampaignRecipient } from '../models/CampaignRecipient';
import { Lead } from '../models/Lead';
import { EmailTemplate } from '../models/EmailTemplate';
import { Suppression } from '../models/Suppression';
import { ActivityLog } from '../models/ActivityLog';
import { aiService } from '../services/ai/ai.service';
import { campaignSendingService } from '../services/campaignSending.service';

export const getCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find()
      .populate('templateId', 'name subject')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, product, targetCountries, targetIndustries, templateId, dailySendingLimit, leadIds } = req.body;

    const campaign = await Campaign.create({
      name,
      product,
      targetCountries: targetCountries || [],
      targetIndustries: targetIndustries || [],
      templateId,
      dailySendingLimit: dailySendingLimit || 50,
      status: 'Draft',
      createdBy: req.user!._id,
    });

    // Select leads matching criteria or explicit leadIds
    let query: any = {};
    if (leadIds && leadIds.length > 0) {
      query._id = { $in: leadIds };
    } else {
      if (targetCountries && targetCountries.length > 0) query.country = { $in: targetCountries };
      if (targetIndustries && targetIndustries.length > 0) query.industry = { $in: targetIndustries };
      query.validationStatus = { $ne: 'Invalid' };
      query.leadStatus = { $ne: 'Suppressed' };
    }

    const matchingLeads = await Lead.find(query);
    let validCount = 0;
    let invalidCount = 0;
    let suppressedCount = 0;

    for (const lead of matchingLeads) {
      const isSuppressed = await Suppression.findOne({ email: lead.email });
      if (isSuppressed) {
        suppressedCount++;
        await CampaignRecipient.create({
          campaignId: campaign._id,
          leadId: lead._id,
          email: lead.email,
          status: 'Suppressed',
          errorMessage: 'Lead email is on global suppression list',
        });
        continue;
      }

      if (lead.validationStatus === 'Invalid' || lead.validationStatus === 'Disposable') {
        invalidCount++;
        await CampaignRecipient.create({
          campaignId: campaign._id,
          leadId: lead._id,
          email: lead.email,
          status: 'Invalid',
          errorMessage: 'Email failed syntax/MX validation',
        });
        continue;
      }

      validCount++;
      await CampaignRecipient.create({
        campaignId: campaign._id,
        leadId: lead._id,
        email: lead.email,
        status: 'Pending',
      });
    }

    campaign.stats = {
      totalRecipients: matchingLeads.length,
      validRecipients: validCount,
      invalidRecipients: invalidCount,
      suppressedRecipients: suppressedCount,
      sentCount: 0,
      failedCount: 0,
      responseCount: 0,
      followUpCount: 0,
    };
    await campaign.save();

    await ActivityLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'Manager',
      action: 'CAMPAIGN_CREATED',
      entityType: 'Campaign',
      entityId: campaign._id.toString(),
      details: `Created campaign '${campaign.name}' with ${validCount} valid recipients.`,
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('templateId')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const recipients = await CampaignRecipient.find({ campaignId: campaign._id })
      .populate('leadId', 'companyName contactName email country industry buyerType aiScore validationStatus')
      .limit(100);

    res.json({ success: true, data: { campaign, recipients } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateDrafts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const template = await EmailTemplate.findById(campaign.templateId);
    if (!template) {
      res.status(400).json({ success: false, message: 'Linked template missing' });
      return;
    }

    const recipients = await CampaignRecipient.find({ campaignId: campaign._id, status: 'Pending' });
    let count = 0;

    for (const recipient of recipients) {
      const lead = await Lead.findById(recipient.leadId);
      if (!lead) continue;

      const aiDraft = await aiService.personalizeEmail({
        lead,
        template,
        productName: campaign.product,
      });

      recipient.personalizedSubject = aiDraft.subject;
      recipient.personalizedBody = aiDraft.body;
      recipient.status = 'Personalized';
      await recipient.save();

      count++;
    }

    if (campaign.status === 'Draft') {
      campaign.status = 'Pending Approval';
      await campaign.save();
    }

    res.json({ success: true, message: `Generated personalized drafts for ${count} campaign recipients. Status moved to 'Pending Approval'.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    campaign.status = 'Approved';
    campaign.approvedBy = req.user!._id;
    campaign.approvedAt = new Date();
    await campaign.save();

    await ActivityLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'Manager',
      action: 'CAMPAIGN_APPROVED',
      entityType: 'Campaign',
      entityId: campaign._id.toString(),
      details: `Manager approved campaign '${campaign.name}' for execution.`,
    });

    res.json({ success: true, message: 'Campaign approved successfully', data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await campaignSendingService.executeCampaignSend(req.params.id, req.user!.email);
    res.json({ success: true, message: 'Campaign sending execution finished.', result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pauseCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, { status: 'Paused' }, { new: true });
    res.json({ success: true, message: 'Campaign paused', data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
