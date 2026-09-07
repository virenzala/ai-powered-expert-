import { IBuyerDiscoveryProvider, DiscoverySearchParams, DiscoveredLeadRaw } from './buyerDiscovery.service';
import { logger } from '../../utils/logger';

export class GooglePlacesProvider implements IBuyerDiscoveryProvider {
  name = 'Google Places B2B Search';

  isConfigured(): boolean {
    return !!process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'mock';
  }

  async searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured.');
    }

    try {
      const countryStr = params.countries.join(' or ');
      const query = `${params.product} ${params.buyerType || 'importer'} in ${countryStr}`;
      logger.info(`Executing Google Places search query: "${query}"...`);

      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google Places API HTTP error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];

      return results.map((place: any, index: number) => ({
        externalId: place.place_id,
        provider: 'google' as const,
        companyName: place.name,
        contactName: `${params.targetRole || 'Procurement Manager'}`,
        jobTitle: params.targetRole || 'Head of Supply Chain',
        phone: place.formatted_phone_number || undefined,
        website: place.website || undefined,
        country: params.countries[0] || 'Germany',
        city: place.formatted_address ? place.formatted_address.split(',')[0] : undefined,
        industry: params.industry,
        productInterest: params.product,
        buyerType: params.buyerType || 'Importer',
        companyDescription: `Discovered via Google Places B2B search (${place.formatted_address || ''})`,
        leadSource: 'Google Places B2B Discovery',
        sourceUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      }));
    } catch (err: any) {
      logger.error('GooglePlacesProvider search failed:', err.message);
      throw err;
    }
  }
}

export const googlePlacesProvider = new GooglePlacesProvider();
