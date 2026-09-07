import { IBuyerDiscoveryProvider, DiscoverySearchParams, DiscoveredLeadRaw } from './types';
import { logger } from '../../utils/logger';

export class GooglePlacesProvider implements IBuyerDiscoveryProvider {
  name = 'Google Places Business Discovery';
  modeKey = 'google' as const;

  isConfigured(): boolean {
    const key = process.env.GOOGLE_MAPS_API_KEY;
    return !!key && key.trim() !== '' && key.trim().toLowerCase() !== 'mock';
  }

  async searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not configured in environment variables.');
    }

    try {
      const query = `${params.product} ${params.buyerType || 'importer'} in ${params.country}`;
      logger.info(`Executing Google Places discovery query: "${query}"...`);

      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google Places API HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API Status: ${data.status} - ${data.error_message || ''}`);
      }

      const results = data.results || [];

      return results.map((place: any) => ({
        externalId: place.place_id,
        provider: 'google' as const,
        companyName: place.name,
        contactName: params.contactRole || 'Procurement Contact',
        jobTitle: params.contactRole || 'Purchasing Manager',
        phone: place.formatted_phone_number || undefined,
        website: place.website || undefined,
        country: params.country,
        city: place.formatted_address ? place.formatted_address.split(',')[0] : undefined,
        industry: params.industry,
        productInterest: params.product,
        buyerType: params.buyerType || 'Importer',
        companyDescription: `Discovered via Google Places (${place.formatted_address || ''})`,
        leadSource: 'Google Places Business Discovery',
        sourceUrl: place.place_id ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}` : undefined,
      }));
    } catch (err: any) {
      logger.error('GooglePlacesProvider search error:', err.message);
      throw err;
    }
  }
}

export const googlePlacesProvider = new GooglePlacesProvider();
