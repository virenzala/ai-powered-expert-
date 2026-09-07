import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Lead } from '../models/Lead';
import { Campaign } from '../models/Campaign';
import { EmailLog } from '../models/EmailLog';

export const getLeadReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const byCountry = await Lead.aggregate([{ $group: { _id: '$country', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const byIndustry = await Lead.aggregate([{ $group: { _id: '$industry', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const byBuyerType = await Lead.aggregate([{ $group: { _id: '$buyerType', count: { $sum: 1 } } }]);
    const byStatus = await Lead.aggregate([{ $group: { _id: '$leadStatus', count: { $sum: 1 } } }]);
    const byClassification = await Lead.aggregate([{ $group: { _id: '$aiClassification', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data: {
        byCountry: byCountry.map((item) => ({ name: item._id || 'Unknown', count: item.count })),
        byIndustry: byIndustry.map((item) => ({ name: item._id || 'Unknown', count: item.count })),
        byBuyerType: byBuyerType.map((item) => ({ name: item._id || 'Unknown', count: item.count })),
        byStatus: byStatus.map((item) => ({ name: item._id || 'Unknown', count: item.count })),
        byClassification: byClassification.map((item) => ({ name: item._id || 'Unclassified', count: item.count })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getValidationReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const distribution = await Lead.aggregate([{ $group: { _id: '$validationStatus', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data: distribution.map((item) => ({ name: item._id || 'Not Checked', count: item.count })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCampaignReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find().select('name status stats createdAt');
    const logsStatus = await EmailLog.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data: {
        campaigns,
        emailLogsSummary: logsStatus.map((item) => ({ status: item._id, count: item.count })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
