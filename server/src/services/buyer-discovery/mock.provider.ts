import { IBuyerDiscoveryProvider, DiscoverySearchParams, DiscoveredLeadRaw } from './buyerDiscovery.service';
import { logger } from '../../utils/logger';

export class MockBuyerDiscoveryProvider implements IBuyerDiscoveryProvider {
  name = 'Mock Discovery Provider (Development / Demo Mode)';

  isConfigured(): boolean {
    return true; // Always available as fallback
  }

  async searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]> {
    logger.info(`[MOCK MODE] Simulating live B2B buyer discovery search for '${params.product}' in ${params.countries.join(', ')}...`);

    const mockPool: Partial<DiscoveredLeadRaw>[] = [
      {
        companyName: 'Rheinland Industrial Machinery GmbH',
        contactName: 'Dr. Markus Weber',
        jobTitle: params.targetRole || 'Head of Global Procurement',
        email: 'm.weber@rheinland-ind.de',
        emailStatus: 'Valid',
        phone: '+49 211 8901 44',
        website: 'https://rheinland-ind.de',
        country: 'Germany',
        city: 'Dusseldorf',
        industry: params.industry || 'Industrial Machinery',
        companyDescription: 'Leading German distributor of heavy industrial equipment, DIN spec pipeline valves, and actuators.',
        leadSource: 'B2B Trade Registry (Germany)',
        sourceUrl: 'https://rheinland-ind.de/procurement',
      },
      {
        companyName: 'Bavaria Power & Fluid Tech GmbH',
        contactName: 'Hans-Peter Muller',
        jobTitle: params.targetRole || 'VP Supply Chain',
        email: 'h.muller@bavaria-fluid.de',
        emailStatus: 'Valid',
        phone: '+49 89 4012 300',
        website: 'https://bavaria-fluid.de',
        country: 'Germany',
        city: 'Munich',
        industry: params.industry || 'Industrial Machinery',
        companyDescription: 'Bavarian OEM importer specializing in high-pressure slurry pumps and fluid control systems.',
        leadSource: 'European B2B Machinery Directory',
        sourceUrl: 'https://bavaria-fluid.de/suppliers',
      },
      {
        companyName: 'Lyon Processing & Valves SAS',
        contactName: 'Claire Dubois',
        jobTitle: params.targetRole || 'Directrice des Achats',
        email: 'c.dubois@lyonvalves.fr',
        emailStatus: 'Valid',
        phone: '+33 4 7200 1199',
        website: 'https://lyonvalves.fr',
        country: 'France',
        city: 'Lyon',
        industry: params.industry || 'Chemical & Industrial Processing',
        companyDescription: 'French chemical processing supplier importing containerized industrial valves and pump spares.',
        leadSource: 'France Import Registry',
        sourceUrl: 'https://lyonvalves.fr/contact-procurement',
      },
      {
        companyName: 'Paris Hydraulic Engineering SARL',
        contactName: 'Antoine Laurent',
        jobTitle: params.targetRole || 'Responsable Approvisionnement',
        email: 'a.laurent@paris-hydraulics.fr',
        emailStatus: 'Valid',
        phone: '+33 1 4509 2233',
        website: 'https://paris-hydraulics.fr',
        country: 'France',
        city: 'Paris',
        industry: params.industry || 'Engineering & Controls',
        companyDescription: 'Parisian distributor of hydraulic fittings, precision gears, and high-voltage transformers.',
        leadSource: 'EuroTrade Network',
        sourceUrl: 'https://paris-hydraulics.fr/partners',
      },
      {
        companyName: 'Emirates Gulf Pipeline Equipment LLC',
        contactName: 'Tariq Al-Mansoor',
        jobTitle: params.targetRole || 'Chief Procurement Officer',
        email: 'tariq@emiratesgulfpipe.ae',
        emailStatus: 'Valid',
        phone: '+971 4 399 8811',
        website: 'https://emiratesgulfpipe.ae',
        country: 'UAE',
        city: 'Dubai',
        industry: params.industry || 'Oilfield & Industrial Supplies',
        companyDescription: 'Major Dubai-based oilfield contractor and importer of API 6D gate valves and slurry pumps.',
        leadSource: 'ADIPEC Expo Lead Database',
        sourceUrl: 'https://emiratesgulfpipe.ae/vendors',
      },
      {
        companyName: 'Abu Dhabi Industrial Supply Corp',
        contactName: 'Faisal Rashid',
        jobTitle: params.targetRole || 'Materials Manager',
        email: 'faisal.r@abudhabi-ind.ae',
        emailStatus: 'Valid',
        phone: '+971 2 611 4400',
        website: 'https://abudhabi-ind.ae',
        country: 'UAE',
        city: 'Abu Dhabi',
        industry: params.industry || 'Industrial Supplies',
        companyDescription: 'State-backed supplier sourcing heavy machinery spares and high-temperature valve assemblies.',
        leadSource: 'UAE Chamber of Commerce',
        sourceUrl: 'https://abudhabi-ind.ae/procurement',
      },
    ];

    // Filter results matching target countries if specified
    let filtered = mockPool;
    if (params.countries && params.countries.length > 0) {
      filtered = mockPool.filter((item) => params.countries.includes(item.country!));
      if (filtered.length === 0) filtered = mockPool;
    }

    return filtered.map((item, index) => ({
      externalId: `mock_ext_${Date.now()}_${index}`,
      provider: 'mock' as const,
      companyName: item.companyName!,
      contactName: item.contactName!,
      jobTitle: item.jobTitle!,
      email: item.email!,
      emailStatus: item.emailStatus as any,
      phone: item.phone,
      website: item.website,
      country: item.country!,
      city: item.city,
      industry: params.industry || item.industry!,
      productInterest: params.product,
      buyerType: params.buyerType || 'Importer',
      companyDescription: item.companyDescription,
      leadSource: `${item.leadSource} (Mock Engine)`,
      sourceUrl: item.sourceUrl,
    }));
  }
}

export const mockBuyerDiscoveryProvider = new MockBuyerDiscoveryProvider();
