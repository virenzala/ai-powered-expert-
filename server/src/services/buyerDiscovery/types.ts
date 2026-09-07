import { z } from 'zod';

export const DiscoverySearchSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  country: z.string().min(1, 'Target Country is required'),
  industry: z.string().min(1, 'Industry is required'),
  buyerType: z.string().optional().default('Importer'),
  contactRole: z.string().optional().default('Procurement Manager'),
  keywords: z.string().optional(),
  companySize: z.string().optional(),
});

export type DiscoverySearchParams = z.infer<typeof DiscoverySearchSchema>;

export interface DiscoveredLeadRaw {
  externalId?: string;
  provider: 'apollo' | 'google' | 'mock';
  companyName: string;
  contactName: string;
  jobTitle: string;
  email?: string;
  phone?: string;
  website?: string;
  country: string;
  state?: string;
  city?: string;
  industry: string;
  productInterest?: string;
  buyerType?: string;
  companyDescription?: string;
  leadSource?: string;
  sourceUrl?: string;
}

export const NormalizedLeadSchema = z.object({
  externalProvider: z.enum(['apollo', 'google', 'mock']),
  externalProviderId: z.string().optional(),
  companyName: z.string().min(1, 'Company Name is required'),
  contactName: z.string().min(1, 'Contact Name is required'),
  jobTitle: z.string().optional().default('Procurement Manager'),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  city: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  productInterest: z.string().optional(),
  buyerType: z.string().optional().default('Importer'),
  leadSource: z.string().optional().default('API Discovery'),
  sourceUrl: z.string().optional(),
  companyDescription: z.string().optional(),
  leadStatus: z.string().default('New'),
  validationStatus: z.string().default('Not Yet Processed'),
  aiClassification: z.string().default('Not Yet Processed'),
  aiScore: z.number().optional(),
  outreachStatus: z.string().default('Not Contacted'),
});

export type NormalizedLead = z.infer<typeof NormalizedLeadSchema>;

export interface DiscoverySummary {
  totalFound: number;
  newLeads: number;
  existingLeads: number;
  errors: number;
}

export interface DiscoveryResponse {
  success: boolean;
  mode: 'apollo' | 'google' | 'mock' | string;
  summary: DiscoverySummary;
  leads: any[];
}

export interface IBuyerDiscoveryProvider {
  name: string;
  modeKey: 'apollo' | 'google' | 'mock';
  isConfigured(): boolean;
  searchBuyers(params: DiscoverySearchParams): Promise<DiscoveredLeadRaw[]>;
}
