import { Lead, ILead } from '../models/Lead';

export interface DuplicateCheckInput {
  externalProvider?: string;
  externalProviderId?: string;
  email?: string;
  website?: string;
  companyName?: string;
  contactName?: string;
  phone?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateField?: 'ExternalProvider' | 'Email' | 'CompanyDomain' | 'CompanyContact' | 'Phone';
  matchedLeadId?: string;
  matchedCompanyName?: string;
  reason?: string;
}

export class DuplicateCheckService {
  /**
   * Helper to extract clean domain from website URL
   * e.g. "https://www.example.de/page" -> "example.de"
   */
  private extractDomain(url?: string): string | null {
    if (!url || !url.trim()) return null;
    try {
      let clean = url.trim().toLowerCase();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      const parsed = new URL(clean);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      // Fallback regex extraction
      const match = url.trim().toLowerCase().match(/(?:https?:\/\/)?(?:www\.)?([^/\s]+)/);
      return match ? match[1] : null;
    }
  }

  /**
   * Performs 4-Vector duplicate detection check:
   * 1. externalProvider + externalProviderId
   * 2. normalized email
   * 3. company domain
   * 4. company name + contact name
   */
  async checkLead(input: DuplicateCheckInput): Promise<DuplicateCheckResult> {
    const provider = input.externalProvider;
    const providerId = input.externalProviderId;
    const email = (input.email || '').trim().toLowerCase();
    const website = input.website;
    const companyName = (input.companyName || '').trim();
    const contactName = (input.contactName || '').trim();

    // 1. Check Rule 1: externalProvider + externalProviderId
    if (provider && providerId) {
      const existingExt = await Lead.findOne({ externalProvider: provider, externalProviderId: providerId });
      if (existingExt) {
        return {
          isDuplicate: true,
          duplicateField: 'ExternalProvider',
          matchedLeadId: existingExt._id.toString(),
          matchedCompanyName: existingExt.companyName,
          reason: `Lead with ${provider} ID '${providerId}' already exists.`,
        };
      }
    }

    // 2. Check Rule 2: normalized email match
    if (email && email.includes('@')) {
      const existingEmail = await Lead.findOne({ email });
      if (existingEmail) {
        return {
          isDuplicate: true,
          duplicateField: 'Email',
          matchedLeadId: existingEmail._id.toString(),
          matchedCompanyName: existingEmail.companyName,
          reason: `Lead with email '${email}' already exists in database.`,
        };
      }
    }

    // 3. Check Rule 3: company domain match
    const domain = this.extractDomain(website);
    if (domain) {
      const existingDomain = await Lead.findOne({
        website: { $regex: new RegExp(domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      });
      if (existingDomain) {
        return {
          isDuplicate: true,
          duplicateField: 'CompanyDomain',
          matchedLeadId: existingDomain._id.toString(),
          matchedCompanyName: existingDomain.companyName,
          reason: `Lead with company domain '${domain}' already exists.`,
        };
      }
    }

    // 4. Check Rule 4: company name + contact name match
    if (companyName && contactName) {
      const compRegex = new RegExp(`^${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      const contactRegex = new RegExp(`^${contactName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

      const existingPair = await Lead.findOne({
        companyName: { $regex: compRegex },
        contactName: { $regex: contactRegex },
      });

      if (existingPair) {
        return {
          isDuplicate: true,
          duplicateField: 'CompanyContact',
          matchedLeadId: existingPair._id.toString(),
          matchedCompanyName: existingPair.companyName,
          reason: `Lead for '${contactName}' at '${companyName}' already exists.`,
        };
      }
    }

    return { isDuplicate: false };
  }
}

export const duplicateCheckService = new DuplicateCheckService();
