import { IBuyerDiscoveryProvider, DiscoverySearchParams, DiscoveredLeadRaw } from './types';
import { logger } from '../../utils/logger';

export class MockBuyerDiscoveryProvider implements IBuyerDiscoveryProvider {
  name = 'Development Mock Discovery Engine';
  modeKey = 'mock' as const;

  isConfigured(): boolean {
    return true; // Always available as fallback in development mode
  }

  async searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]> {
    logger.info(`[MOCK MODE] Generating synthetic industrial export buyer records for product "${params.product}" in "${params.country}"...`);

    const country = params.country || 'Germany';
    const industry = params.industry || 'Industrial Equipment';
    const buyerType = params.buyerType || 'Importer';
    const contactRole = params.contactRole || 'Procurement Manager';

    // Mock dataset covering common export markets
    const mockSeedTemplates = [
      {
        companyName: `${country === 'Germany' ? 'Rheinland' : country} Industrial Machinery GmbH`,
        contactName: 'Dr. Markus Weber',
        jobTitle: contactRole,
        email: `m.weber@${country.toLowerCase().replace(/\s+/g, '')}-machinery-mock.de`,
        phone: '+49 211 8901 44',
        website: `https://${country.toLowerCase().replace(/\s+/g, '')}-machinery-mock.de`,
        city: 'Dusseldorf',
        companyDescription: `Leading importer and distributor of ${params.product.toLowerCase()} and industrial components across central Europe.`,
        sourceUrl: `https://${country.toLowerCase().replace(/\s+/g, '')}-machinery-mock.de/procurement`,
      },
      {
        companyName: `Bavaria Power & Fluid Tech ${country === 'Germany' ? 'GmbH' : 'Corp'}`,
        contactName: 'Hans-Peter Muller',
        jobTitle: contactRole === 'Procurement Manager' ? 'VP Global Sourcing' : contactRole,
        email: `h.muller@bavaria-fluid-mock.de`,
        phone: '+49 89 4012 300',
        website: 'https://bavaria-fluid-mock.de',
        city: 'Munich',
        companyDescription: `OEM importer specializing in ${params.product.toLowerCase()} and heavy equipment spares.`,
        sourceUrl: 'https://bavaria-fluid-mock.de/suppliers',
      },
      {
        companyName: `Hanseatic Global Engineering ${country === 'Germany' ? 'AG' : 'Ltd'}`,
        contactName: 'Klaus Schneider',
        jobTitle: contactRole,
        email: `k.schneider@hanseatic-eng-mock.de`,
        phone: '+49 40 3302 110',
        website: 'https://hanseatic-eng-mock.de',
        city: 'Hamburg',
        companyDescription: `High-volume international trading firm sourcing ${params.product.toLowerCase()} for major EPC projects.`,
        sourceUrl: 'https://hanseatic-eng-mock.de/partners',
      },
      {
        companyName: `EuroTrans Equipment Distributors SRL`,
        contactName: 'Dr. Elena Rossi',
        jobTitle: contactRole,
        email: `e.rossi@eurotrans-equipment-mock.eu`,
        phone: '+39 02 8840 99',
        website: 'https://eurotrans-equipment-mock.eu',
        city: 'Milan',
        companyDescription: `Pan-European distributor of heavy duty ${params.product.toLowerCase()} and industrial systems.`,
        sourceUrl: 'https://eurotrans-equipment-mock.eu/supply-chain',
      },
      {
        companyName: `Lyon Chemical & Processing Equipment SAS`,
        contactName: 'Claire Dubois',
        jobTitle: contactRole,
        email: `c.dubois@lyon-processing-mock.fr`,
        phone: '+33 4 7200 1199',
        website: 'https://lyon-processing-mock.fr',
        city: 'Lyon',
        companyDescription: `Industrial plant equipment importer supplying regional manufacturing facilities with ${params.product.toLowerCase()}.`,
        sourceUrl: 'https://lyon-processing-mock.fr/purchasing',
      },
      {
        companyName: `Nordic Heavy Power & Machinery AB`,
        contactName: 'Lars Lindqvist',
        jobTitle: contactRole,
        email: `l.lindqvist@nordicequipment-mock.se`,
        phone: '+46 8 5501 22',
        website: 'https://nordicequipment-mock.se',
        city: 'Stockholm',
        companyDescription: `Scandinavian industrial importer sourcing high-spec ${params.product.toLowerCase()} for harsh climate applications.`,
        sourceUrl: 'https://nordicequipment-mock.se/vendors',
      },
      {
        companyName: `Emirates Gulf Pipeline Equipment LLC`,
        contactName: 'Tariq Al-Mansoor',
        jobTitle: contactRole,
        email: `tariq@emiratesgulf-mock.ae`,
        phone: '+971 4 399 8811',
        website: 'https://emiratesgulf-mock.ae',
        city: 'Dubai',
        companyDescription: `Middle East supply contractor importing containerized ${params.product.toLowerCase()} and industrial valves.`,
        sourceUrl: 'https://emiratesgulf-mock.ae/procurement',
      },
      {
        companyName: `Tokyo Precision Machinery & Trade Co.`,
        contactName: 'Kenji Sato',
        jobTitle: contactRole,
        email: `k.sato@tokyomachinery-mock.jp`,
        phone: '+81 3 5551 900',
        website: 'https://tokyomachinery-mock.jp',
        city: 'Tokyo',
        companyDescription: `Asian B2B trading house importing precision ${params.product.toLowerCase()} and automation controls.`,
        sourceUrl: 'https://tokyomachinery-mock.jp/global-sourcing',
      },
      {
        companyName: `Americas Industrial Sourcing Corp`,
        contactName: 'David Miller',
        jobTitle: contactRole,
        email: `d.miller@americas-sourcing-mock.com`,
        phone: '+1 312 409 5500',
        website: 'https://americas-sourcing-mock.com',
        city: 'Chicago',
        companyDescription: `North American machinery stockist importing high-volume ${params.product.toLowerCase()} for regional distribution.`,
        sourceUrl: 'https://americas-sourcing-mock.com/buyers',
      },
      {
        companyName: `Apex Industrial Machinery Trading GmbH`,
        contactName: 'Stefan Ziegler',
        jobTitle: contactRole,
        email: `s.ziegler@apex-industrial-mock.de`,
        phone: '+49 69 7780 12',
        website: 'https://apex-industrial-mock.de',
        city: 'Frankfurt',
        companyDescription: `Specialized German importer for ${params.product.toLowerCase()} with extensive warehousing and service network.`,
        sourceUrl: 'https://apex-industrial-mock.de/trade',
      },
    ];

    return mockSeedTemplates.map((item, idx) => ({
      externalId: `mock_lead_${country.toLowerCase().replace(/\s+/g, '_')}_${idx + 1}`,
      provider: 'mock' as const,
      companyName: item.companyName,
      contactName: item.contactName,
      jobTitle: item.jobTitle,
      email: item.email,
      phone: item.phone,
      website: item.website,
      country: country,
      city: item.city,
      industry: industry,
      productInterest: params.product,
      buyerType: buyerType,
      companyDescription: item.companyDescription,
      leadSource: 'Development Mock B2B Registry',
      sourceUrl: item.sourceUrl,
    }));
  }
}

export const mockBuyerDiscoveryProvider = new MockBuyerDiscoveryProvider();
