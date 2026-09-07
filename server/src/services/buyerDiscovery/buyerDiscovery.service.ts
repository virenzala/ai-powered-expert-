import {
  DiscoverySearchParams,
  DiscoverySearchSchema,
  DiscoveredLeadRaw,
  NormalizedLeadSchema,
  DiscoveryResponse,
  IBuyerDiscoveryProvider,
} from './types';
import { apolloProvider } from './apollo.provider';
import { googlePlacesProvider } from './googlePlaces.provider';
import { mockBuyerDiscoveryProvider } from './mock.provider';
import { Lead } from '../../models/Lead';
import { Company } from '../../models/Company';
import { duplicateCheckService } from '../duplicateCheck.service';
import { logger } from '../../utils/logger';

export class BuyerDiscoveryService {
  /**
   * Resolves active discovery provider based on environment credentials
   */
  public getActiveProvider(): { provider: IBuyerDiscoveryProvider; mode: string } {
    if (apolloProvider.isConfigured()) {
      return { provider: apolloProvider, mode: apolloProvider.modeKey };
    }
    if (googlePlacesProvider.isConfigured()) {
      return { provider: googlePlacesProvider, mode: googlePlacesProvider.modeKey };
    }
    return { provider: mockBuyerDiscoveryProvider, mode: mockBuyerDiscoveryProvider.modeKey };
  }

  /**
   * Discovers buyers, normalizes provider data, runs 4-vector duplicate checks, and persists new leads
   */
  public async searchAndPersistBuyers(paramsInput: DiscoverySearchParams, userId?: string): Promise<DiscoveryResponse> {
    // 1. Validate search criteria input
    const params = DiscoverySearchSchema.parse(paramsInput);
    const { provider, mode } = this.getActiveProvider();

    logger.info(`Starting BuyerDiscoveryService search [Provider: ${provider.name}, Mode: ${mode}]...`);

    // 2. Fetch raw lead records from provider
    let rawLeads: DiscoveredLeadRaw[] = [];
    try {
      rawLeads = await provider.searchBuyers(params);
    } catch (err: any) {
      logger.error(`Error fetching buyers from provider ${provider.name}: ${err.message}`);
      throw new Error(`Buyer discovery failed. Reason: ${err.message}`);
    }

    let newLeadsCount = 0;
    let existingLeadsCount = 0;
    let errorsCount = 0;
    const leadsOutput: any[] = [];

    // 3. Process each lead record
    for (const raw of rawLeads) {
      try {
        // Normalization step
        const normalizedInput = {
          externalProvider: raw.provider,
          externalProviderId: raw.externalId,
          companyName: (raw.companyName || '').trim(),
          contactName: (raw.contactName || '').trim(),
          jobTitle: (raw.jobTitle || params.contactRole || 'Procurement Manager').trim(),
          email: raw.email ? raw.email.trim().toLowerCase() : undefined,
          phone: raw.phone ? raw.phone.trim() : undefined,
          website: raw.website ? raw.website.trim().toLowerCase() : undefined,
          country: (raw.country || params.country).trim(),
          city: raw.city ? raw.city.trim() : undefined,
          industry: (raw.industry || params.industry).trim(),
          productInterest: (raw.productInterest || params.product).trim(),
          buyerType: (raw.buyerType || params.buyerType || 'Importer').trim(),
          leadSource: (raw.leadSource || 'API Discovery').trim(),
          sourceUrl: raw.sourceUrl ? raw.sourceUrl.trim() : undefined,
          companyDescription: raw.companyDescription ? raw.companyDescription.trim() : undefined,
          leadStatus: 'New',
          validationStatus: 'Not Yet Processed',
          aiClassification: 'Not Yet Processed',
          outreachStatus: 'Not Contacted',
        };

        // Zod validation
        const normalized = NormalizedLeadSchema.parse(normalizedInput);

        // 4. Duplicate Detection (4-Vector matching rules)
        const dupCheck = await duplicateCheckService.checkLead({
          externalProvider: normalized.externalProvider,
          externalProviderId: normalized.externalProviderId,
          email: normalized.email,
          website: normalized.website,
          companyName: normalized.companyName,
          contactName: normalized.contactName,
        });

        if (dupCheck.isDuplicate) {
          existingLeadsCount++;
          // Fetch existing record
          let existingLeadDoc = null;
          if (dupCheck.matchedLeadId) {
            existingLeadDoc = await Lead.findById(dupCheck.matchedLeadId);
          }

          leadsOutput.push({
            ...(existingLeadDoc ? existingLeadDoc.toObject() : normalized),
            existing: true,
            discoveryStatus: 'EXISTING',
            duplicateReason: dupCheck.reason,
          });
          continue;
        }

        // 5. Create/Link Company Document
        let companyId;
        if (normalized.companyName) {
          let company = await Company.findOne({
            companyName: { $regex: new RegExp(`^${normalized.companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          });

          if (!company) {
            company = await Company.create({
              companyName: normalized.companyName,
              website: normalized.website,
              country: normalized.country,
              industry: normalized.industry,
              productInterest: normalized.productInterest,
              description: normalized.companyDescription,
              source: normalized.leadSource,
            });
          }
          companyId = company._id;
        }

        // 6. Create New Lead Document
        const newLead = await Lead.create({
          companyName: normalized.companyName,
          contactName: normalized.contactName,
          jobTitle: normalized.jobTitle,
          email: normalized.email || `contact@${normalized.website?.replace(/^https?:\/\//, '') || 'company.com'}`,
          phone: normalized.phone,
          website: normalized.website,
          country: normalized.country,
          city: normalized.city,
          industry: normalized.industry,
          productInterest: normalized.productInterest,
          buyerType: normalized.buyerType as any,
          leadSource: normalized.leadSource,
          sourceUrl: normalized.sourceUrl,
          externalProvider: normalized.externalProvider,
          externalProviderId: normalized.externalProviderId,
          companyDescription: normalized.companyDescription,
          companyId,
          assignedUser: userId,
          leadStatus: 'New',
          validationStatus: 'Not Yet Processed',
          aiClassification: 'Not Yet Processed',
          outreachStatus: 'Not Contacted',
        });

        newLeadsCount++;
        leadsOutput.push({
          ...newLead.toObject(),
          existing: false,
          discoveryStatus: 'NEW',
        });
      } catch (itemErr: any) {
        logger.error(`Failed processing raw lead (${raw.companyName}): ${itemErr.message}`);
        errorsCount++;
      }
    }

    return {
      success: true,
      mode,
      summary: {
        totalFound: rawLeads.length,
        newLeads: newLeadsCount,
        existingLeads: existingLeadsCount,
        errors: errorsCount,
      },
      leads: leadsOutput,
    };
  }
}

export const buyerDiscoveryService = new BuyerDiscoveryService();
