import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { buyerDiscoveryService } from '../services/buyerDiscovery/buyerDiscovery.service';
import { emailDiscoveryService } from '../services/email-discovery/emailDiscovery.service';
import { logger } from '../utils/logger';

export const searchBuyers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { product, country, countries, industry, buyerType, contactRole, targetRole, companySize, keywords } = req.body;

    // Handle single 'country' or array 'countries' for flexibility
    const targetCountry = country || (Array.isArray(countries) && countries.length > 0 ? countries[0] : undefined);

    if (!product || !targetCountry || !industry) {
      res.status(400).json({
        success: false,
        message: 'Missing required parameters: product, country, and industry are required.',
      });
      return;
    }

    const userId = req.user ? req.user._id.toString() : undefined;

    const result = await buyerDiscoveryService.searchAndPersistBuyers(
      {
        product: product.trim(),
        country: targetCountry.trim(),
        industry: industry.trim(),
        buyerType: (buyerType || 'Importer').trim(),
        contactRole: (contactRole || targetRole || 'Procurement Manager').trim(),
        keywords: keywords ? keywords.trim() : undefined,
        companySize: companySize ? companySize.trim() : undefined,
      },
      userId
    );

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('searchBuyers Controller Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Buyer discovery failed.',
      reason: error.message || 'An unexpected error occurred during buyer discovery.',
    });
  }
};

export const enrichDomainEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { domain } = req.body;
    if (!domain) {
      res.status(400).json({ success: false, message: 'Domain is required for email lookup.' });
      return;
    }

    const emails = await emailDiscoveryService.findByDomain(domain);
    res.json({
      success: true,
      data: emails,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
