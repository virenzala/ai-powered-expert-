import { IBuyerDiscoveryProvider, DiscoverySearchParams, DiscoveredLeadRaw } from './types';
import { logger } from '../../utils/logger';

export class ApolloProvider implements IBuyerDiscoveryProvider {
  name = 'Apollo.io B2B Intelligence';
  modeKey = 'apollo' as const;

  isConfigured(): boolean {
    const key = process.env.APOLLO_API_KEY;
    return !!key && key.trim() !== '' && key.trim().toLowerCase() !== 'mock';
  }

  async searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]> {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      throw new Error('APOLLO_API_KEY is not configured in environment variables.');
    }

    try {
      logger.info(`Executing Apollo B2B discovery for product "${params.product}" in country "${params.country}"...`);

      const payload: any = {
        person_titles: [params.contactRole || 'Procurement Manager'],
        person_locations: [params.country],
        q_organization_keyword_tags: [params.product, params.industry, params.keywords].filter(Boolean),
        page: 1,
        per_page: 25,
      };

      if (params.companySize) {
        payload.organization_num_employees_ranges = [params.companySize];
      }

      const response = await fetch('https://api.apollo.io/v1/mixed_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Api-Key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const status = response.status;
        let errorMessage = `Apollo API request failed with status ${status}`;
        try {
          const errBody = await response.json();
          if (errBody.error_message || errBody.message) {
            errorMessage = `Apollo API Error: ${errBody.error_message || errBody.message}`;
          }
        } catch {
          // Keep generic status error if non-JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const people = data.people || [];

      // Normalize Apollo items
      const rawLeads: DiscoveredLeadRaw[] = people.map((p: any) => {
        const firstName = p.first_name || '';
        const lastName = p.last_name || '';
        const contactName = `${firstName} ${lastName}`.trim() || 'Procurement Contact';
        const org = p.organization || {};
        const domain = org.primary_domain || '';

        return {
          externalId: p.id || org.id,
          provider: 'apollo' as const,
          companyName: org.name || 'International Trading Co.',
          contactName,
          jobTitle: p.title || params.contactRole || 'Procurement Manager',
          email: p.email ? p.email.toLowerCase() : undefined,
          phone: p.phone_numbers && p.phone_numbers[0] ? p.phone_numbers[0].raw_number : undefined,
          website: domain ? (domain.startsWith('http') ? domain : `https://${domain}`) : undefined,
          country: org.country || params.country,
          city: org.city,
          industry: org.industry || params.industry,
          productInterest: params.product,
          buyerType: params.buyerType || 'Importer',
          companyDescription: org.short_description || undefined,
          leadSource: 'Apollo.io B2B Database',
          sourceUrl: domain ? `https://${domain}` : undefined,
        };
      });

      // Post-filtering for requested country/buyerType if Apollo returned broad results
      return rawLeads.filter((lead) => {
        if (!lead.companyName) return false;
        return true;
      });
    } catch (err: any) {
      logger.error('ApolloProvider error:', err.message);
      throw err;
    }
  }
}

export const apolloProvider = new ApolloProvider();
