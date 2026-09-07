import { logger } from '../../utils/logger';

export interface EmailEnrichmentResult {
  email?: string;
  score?: number;
  status: 'Valid' | 'Invalid' | 'Risky' | 'Unknown';
  source: string;
}

export class EmailDiscoveryService {
  async findByDomain(domain: string): Promise<EmailEnrichmentResult[]> {
    const apiKey = process.env.HUNTER_API_KEY;
    const cleanDomain = domain.replace(/https?:\/\//, '').replace(/\/.*$/, '');

    if (apiKey && apiKey !== 'mock') {
      try {
        logger.info(`Calling Hunter.io API for domain search: ${cleanDomain}...`);
        const res = await fetch(`https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&api_key=${apiKey}`);
        if (!res.ok) throw new Error(`Hunter API HTTP ${res.status}`);
        const data = await res.json();
        const emails = data.data?.emails || [];
        return emails.map((e: any) => ({
          email: e.value,
          score: e.confidence,
          status: e.confidence > 70 ? 'Valid' : 'Risky',
          source: 'Hunter.io API',
        }));
      } catch (err: any) {
        logger.warn('Hunter API call failed, falling back to enrichment:', err.message);
      }
    }

    // Mock Fallback
    return [
      {
        email: `procurement@${cleanDomain}`,
        score: 95,
        status: 'Valid',
        source: 'Domain Enrichment (Mock)',
      },
      {
        email: `info@${cleanDomain}`,
        score: 80,
        status: 'Risky',
        source: 'Domain Enrichment (Mock)',
      },
    ];
  }
}

export const emailDiscoveryService = new EmailDiscoveryService();
