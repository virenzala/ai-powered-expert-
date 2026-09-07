import { IBuyerDiscoveryProvider, DiscoverySearchParams, DiscoveredLeadRaw } from './buyerDiscovery.service';
import { logger } from '../../utils/logger';

export class ApolloProvider implements IBuyerDiscoveryProvider {
  name = 'Apollo.io';

  isConfigured(): boolean {
    return !!process.env.APOLLO_API_KEY && process.env.APOLLO_API_KEY !== 'mock';
  }

  async searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]> {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      throw new Error('APOLLO_API_KEY is not configured.');
    }

    try {
      logger.info(`Executing Apollo.io B2B discovery search for product: ${params.product}...`);
      const response = await fetch('https://api.apollo.io/v1/mixed_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          person_titles: params.targetRole ? [params.targetRole] : ['Procurement Manager', 'Purchasing Director', 'Import Manager'],
          person_locations: params.countries,
          q_organization_keyword_tags: [params.product, params.industry, params.keywords].filter(Boolean),
          page: 1,
          per_page: 25,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Apollo API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const people = data.people || [];

      return people.map((p: any) => ({
        externalId: p.id,
        provider: 'apollo' as const,
        companyName: p.organization?.name || 'Unknown Company',
        contactName: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Purchasing Contact',
        jobTitle: p.title || params.targetRole || 'Procurement Specialist',
        email: p.email || undefined,
        emailStatus: p.email_status === 'verified' ? 'Valid' : 'Unknown',
        phone: p.phone_numbers && p.phone_numbers[0] ? p.phone_numbers[0].raw_number : undefined,
        website: p.organization?.primary_domain ? `https://${p.organization.primary_domain}` : undefined,
        country: p.organization?.country || params.countries[0] || 'Germany',
        city: p.organization?.city,
        industry: p.organization?.industry || params.industry,
        productInterest: params.product,
        buyerType: params.buyerType || 'Importer',
        companyDescription: p.organization?.short_description || undefined,
        leadSource: 'Apollo.io B2B Database',
        sourceUrl: p.organization?.primary_domain ? `https://${p.organization.primary_domain}` : undefined,
      }));
    } catch (err: any) {
      logger.error('ApolloProvider search failed:', err.message);
      throw err;
    }
  }
}

export const apolloProvider = new ApolloProvider();
