import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Lead } from '../models/Lead';
import { Company } from '../models/Company';
import { LeadValidation } from '../models/LeadValidation';
import { LeadClassification } from '../models/LeadClassification';
import { EmailLog } from '../models/EmailLog';
import { FollowUp } from '../models/FollowUp';
import { ActivityLog } from '../models/ActivityLog';
import { Suppression } from '../models/Suppression';
import { duplicateCheckService } from '../services/duplicateCheck.service';
import { emailValidationService } from '../services/validation/validation.service';
import { aiService } from '../services/ai/ai.service';
import { inMemoryStore } from '../services/inMemoryStore';

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const {
      search,
      country,
      industry,
      buyerType,
      leadStatus,
      validationStatus,
      leadSource,
      aiScoreMin,
      aiScoreMax,
      outreachStatus,
      assignedUser,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { companyName: searchRegex },
        { contactName: searchRegex },
        { email: searchRegex },
        { productInterest: searchRegex },
      ];
    }

    if (country) query.country = country;
    if (industry) query.industry = industry;
    if (buyerType) query.buyerType = buyerType;
    if (leadStatus) query.leadStatus = leadStatus;
    if (validationStatus) query.validationStatus = validationStatus;
    if (leadSource) query.leadSource = leadSource;
    if (outreachStatus) query.outreachStatus = outreachStatus;
    if (assignedUser) query.assignedUser = assignedUser;

    if (aiScoreMin || aiScoreMax) {
      query.aiScore = {};
      if (aiScoreMin) query.aiScore.$gte = Number(aiScoreMin);
      if (aiScoreMax) query.aiScore.$lte = Number(aiScoreMax);
    }

    const sortOptions: any = {};
    if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'oldest') {
      sortOptions.createdAt = 1;
    } else if (sortBy === 'aiScore') {
      sortOptions.aiScore = -1;
    } else if (sortBy === 'companyName') {
      sortOptions.companyName = 1;
    } else if (sortBy === 'country') {
      sortOptions.country = 1;
    } else {
      sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    }

    let leads: any[] = [];
    let totalLeads = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        leads = await Lead.find(query)
          .populate('assignedUser', 'name email role')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit);
        totalLeads = await Lead.countDocuments(query);
      } catch (e) {
        leads = inMemoryStore.getLeads();
        totalLeads = leads.length;
      }
    } else {
      leads = inMemoryStore.getLeads();
      totalLeads = leads.length;
    }

    res.json({
      success: true,
      data: leads,
      pagination: {
        total: totalLeads,
        page,
        limit,
        pages: Math.ceil(totalLeads / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leadData = req.body;

    if (mongoose.connection.readyState !== 1) {
      const lead = inMemoryStore.createLead({
        ...leadData,
        assignedUser: leadData.assignedUser || req.user?._id || req.user?.id,
      });
      res.status(201).json({ success: true, data: lead });
      return;
    }

    // Check duplicates
    let dupRes: any = { isDuplicate: false, reason: '' };
    try {
      dupRes = await duplicateCheckService.checkLead(leadData);
    } catch (e) {}

    if (dupRes.isDuplicate && req.body.bypassDuplicate !== true) {
      res.status(409).json({
        success: false,
        message: dupRes.reason,
        code: 'DUPLICATE_LEAD',
        duplicateInfo: dupRes,
      });
      return;
    }

    // Auto company resolution
    let company: any = null;
    try {
      company = await Company.findOne({ companyName: leadData.companyName });
      if (!company) {
        company = await Company.create({
          companyName: leadData.companyName,
          website: leadData.website,
          country: leadData.country,
          industry: leadData.industry,
          productInterest: leadData.productInterest,
          description: leadData.companyDescription,
        });
      }
    } catch (e) {}

    // Auto validate email
    const valRes = await emailValidationService.validateEmail(leadData.email);

    // Auto AI classify
    const aiRes = await aiService.classifyLead({
      ...leadData,
      validationStatus: valRes.validationStatus,
    });

    let lead: any = null;
    try {
      lead = await Lead.create({
        ...leadData,
        companyId: company ? company._id : undefined,
        assignedUser: leadData.assignedUser || req.user?._id,
        validationStatus: valRes.validationStatus,
        validationReason: valRes.reason,
        validationDate: new Date(),
        buyerType: aiRes.buyerType,
        aiClassification: aiRes.classification,
        aiScore: aiRes.score,
        aiConfidence: aiRes.confidence,
        aiReasoning: aiRes.reason,
        aiRecommendedApproach: aiRes.recommendedApproach,
      });
    } catch (createErr) {
      lead = inMemoryStore.createLead(leadData);
    }

    try {
      await ActivityLog.create({
        user: req.user?._id,
        userName: req.user?.name || 'System',
        userRole: req.user?.role || 'Sales',
        action: 'LEAD_CREATED',
        entityType: 'Lead',
        entityId: lead._id ? lead._id.toString() : lead.id,
        details: `Created new lead ${lead.contactName} at ${lead.companyName} (${lead.country}).`,
      });
    } catch (e) {}

    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    const lead = inMemoryStore.createLead(req.body);
    res.status(201).json({ success: true, data: lead });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let lead: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        lead = await Lead.findById(req.params.id)
          .populate('companyId')
          .populate('assignedUser', 'name email role');
      } catch (e) {
        lead = inMemoryStore.getLeadById(req.params.id);
      }
    } else {
      lead = inMemoryStore.getLeadById(req.params.id);
    }

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found', code: 'NOT_FOUND' });
      return;
    }

    let validations: any[] = [];
    let classifications: any[] = [];
    let emailLogs: any[] = [];
    let followUps: any[] = [];
    let activityTimeline: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        validations = await LeadValidation.find({ leadId: lead._id }).sort({ createdAt: -1 });
        classifications = await LeadClassification.find({ leadId: lead._id }).sort({ createdAt: -1 });
        emailLogs = await EmailLog.find({ leadId: lead._id }).sort({ createdAt: -1 });
        followUps = await FollowUp.find({ leadId: lead._id }).sort({ dueDate: 1 });
        activityTimeline = await ActivityLog.find({ entityId: lead._id.toString() }).sort({ createdAt: -1 });
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        lead,
        validations,
        classifications,
        emailLogs,
        followUps,
        activityTimeline,
      },
    });
  } catch (error: any) {
    const lead = inMemoryStore.getLeadById(req.params.id);
    if (lead) {
      res.json({
        success: true,
        data: {
          lead,
          validations: [],
          classifications: [],
          emailLogs: [],
          followUps: [],
          activityTimeline: [],
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'Lead not found' });
    }
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found', code: 'NOT_FOUND' });
      return;
    }

    await ActivityLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'Sales',
      action: 'LEAD_UPDATED',
      entityType: 'Lead',
      entityId: lead._id.toString(),
      details: `Updated lead details for ${lead.companyName}.`,
    });

    res.json({ success: true, data: lead });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const valRes = await emailValidationService.validateEmail(lead.email);
    lead.validationStatus = valRes.validationStatus;
    lead.validationReason = valRes.reason;
    lead.validationDate = new Date();
    if (valRes.validationStatus === 'Valid') {
      lead.leadStatus = 'Valid';
    } else if (valRes.validationStatus === 'Invalid' || valRes.validationStatus === 'Disposable') {
      lead.leadStatus = 'Invalid';
    }
    await lead.save();

    await LeadValidation.create({
      leadId: lead._id,
      email: lead.email,
      validationStatus: valRes.validationStatus,
      reason: valRes.reason,
      isDisposable: valRes.isDisposable,
    });

    res.json({ success: true, validationStatus: valRes.validationStatus, data: lead });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const classifyLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found' });
      return;
    }

    const aiRes = await aiService.classifyLead(lead);
    lead.buyerType = aiRes.buyerType as any;
    lead.aiClassification = aiRes.classification;
    lead.aiScore = aiRes.score;
    lead.aiConfidence = aiRes.confidence;
    lead.aiReasoning = aiRes.reason;
    lead.aiRecommendedApproach = aiRes.recommendedApproach;
    if (aiRes.score >= 70) lead.leadStatus = 'Qualified';
    await lead.save();

    await LeadClassification.create({
      leadId: lead._id,
      classification: aiRes.classification,
      buyerType: aiRes.buyerType,
      score: aiRes.score,
      confidence: aiRes.confidence,
      reason: aiRes.reason,
      recommendedApproach: aiRes.recommendedApproach,
    });

    res.json({ success: true, classification: aiRes.classification, aiScore: aiRes.score, data: lead });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found', code: 'NOT_FOUND' });
      return;
    }

    await ActivityLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'Sales',
      action: 'LEAD_DELETED',
      entityType: 'Lead',
      entityId: req.params.id,
      details: `Deleted lead ${lead.companyName} (${lead.email}).`,
    });

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateBulkLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ success: false, message: 'leadIds array is required' });
      return;
    }

    const leads = await Lead.find({ _id: { $in: leadIds } });
    let validatedCount = 0;

    for (const lead of leads) {
      const valRes = await emailValidationService.validateEmail(lead.email);

      lead.validationStatus = valRes.validationStatus;
      lead.validationReason = valRes.reason;
      lead.validationDate = new Date();
      if (valRes.validationStatus === 'Valid') {
        lead.leadStatus = 'Valid';
      } else if (valRes.validationStatus === 'Invalid' || valRes.validationStatus === 'Disposable') {
        lead.leadStatus = 'Invalid';
      }
      await lead.save();

      await LeadValidation.create({
        leadId: lead._id,
        email: lead.email,
        validationStatus: valRes.validationStatus,
        reason: valRes.reason,
        isDisposable: valRes.isDisposable,
      });

      validatedCount++;
    }

    await ActivityLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'Sales',
      action: 'BULK_VALIDATION',
      entityType: 'Lead',
      details: `Executed bulk email validation on ${validatedCount} leads.`,
    });

    res.json({ success: true, message: `Successfully validated ${validatedCount} leads.`, validatedCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const classifyBulkLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadIds } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ success: false, message: 'leadIds array is required' });
      return;
    }

    const leads = await Lead.find({ _id: { $in: leadIds } });
    let classifiedCount = 0;

    for (const lead of leads) {
      const aiRes = await aiService.classifyLead(lead);

      lead.buyerType = aiRes.buyerType as any;
      lead.aiClassification = aiRes.classification;
      lead.aiScore = aiRes.score;
      lead.aiConfidence = aiRes.confidence;
      lead.aiReasoning = aiRes.reason;
      lead.aiRecommendedApproach = aiRes.recommendedApproach;
      if (aiRes.score >= 70) lead.leadStatus = 'Qualified';
      await lead.save();

      await LeadClassification.create({
        leadId: lead._id,
        classification: aiRes.classification,
        buyerType: aiRes.buyerType,
        score: aiRes.score,
        confidence: aiRes.confidence,
        reason: aiRes.reason,
        recommendedApproach: aiRes.recommendedApproach,
      });

      classifiedCount++;
    }

    await ActivityLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System',
      userRole: req.user?.role || 'Sales',
      action: 'BULK_CLASSIFICATION',
      entityType: 'Lead',
      details: `Executed AI classification on ${classifiedCount} leads.`,
    });

    res.json({ success: true, message: `Successfully classified ${classifiedCount} leads with AI scoring.`, classifiedCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleBulkAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadIds, action, payload } = req.body;
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ success: false, message: 'leadIds array is required' });
      return;
    }

    if (action === 'delete') {
      await Lead.deleteMany({ _id: { $in: leadIds } });
      res.json({ success: true, message: `Deleted ${leadIds.length} leads.` });
      return;
    }

    if (action === 'assign') {
      await Lead.updateMany({ _id: { $in: leadIds } }, { assignedUser: payload.assignedUser });
      res.json({ success: true, message: `Assigned ${leadIds.length} leads.` });
      return;
    }

    if (action === 'suppress') {
      const leads = await Lead.find({ _id: { $in: leadIds } });
      for (const lead of leads) {
        lead.leadStatus = 'Suppressed';
        await lead.save();
        await Suppression.findOneAndUpdate(
          { email: lead.email },
          { email: lead.email, company: lead.companyName, reason: payload?.reason || 'Opted out', source: 'Bulk Action', addedBy: req.user?._id },
          { upsert: true }
        );
      }
      res.json({ success: true, message: `Suppressed ${leads.length} leads.` });
      return;
    }

    res.status(400).json({ success: false, message: `Action '${action}' not supported` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
