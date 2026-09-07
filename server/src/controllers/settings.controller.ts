import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Organization } from '../models/Organization';
import { Integration } from '../models/Integration';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({
        name: 'Apex Industrial Exports',
        exportProducts: ['Industrial Valves', 'Pumps', 'CNC Machine Components', 'Electrical Equipment'],
        targetMarkets: ['Germany', 'USA', 'UAE', 'Singapore', 'Japan', 'Brazil'],
      });
    }

    const integrations = await Integration.find();

    res.json({
      success: true,
      data: {
        organization: org,
        integrations,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrganizationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const org = await Organization.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ success: true, message: 'Organization settings updated', data: org });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIntegrationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { service, provider, apiKey, model, settings } = req.body;
    const integration = await Integration.findOneAndUpdate(
      { service },
      {
        service,
        provider: provider || 'mock',
        status: apiKey ? 'Connected' : 'Connected',
        settings: {
          apiKey: apiKey ? '***configured***' : undefined,
          model,
          ...settings,
        },
        lastSyncAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: `${service} integration updated`, data: integration });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
