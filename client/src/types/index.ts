export type UserRole = 'Admin' | 'Manager' | 'Sales';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type LeadStatus =
  | 'New'
  | 'Imported'
  | 'Validating'
  | 'Valid'
  | 'Invalid'
  | 'Qualified'
  | 'Unqualified'
  | 'Contacted'
  | 'Replied'
  | 'Follow-up'
  | 'Converted'
  | 'Suppressed';

export type ValidationStatus = 'Not Checked' | 'Valid' | 'Invalid' | 'Risky' | 'Unknown' | 'Disposable';
export type BuyerType = 'Importer' | 'Distributor' | 'Wholesaler' | 'Manufacturer' | 'Retailer' | 'Unknown';
export type OutreachStatus = 'Not Contacted' | 'Campaign Queued' | 'Email Sent' | 'Follow Up Scheduled' | 'Replied' | 'Unresponsive' | 'Opted Out';

export type RoleCategory = 'Procurement' | 'Engineering' | 'Quality QA/QC' | 'Executive' | 'General';

export interface Lead {
  _id: string;
  companyName: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  website?: string;
  country: string;
  state?: string;
  city?: string;
  industry: string;
  productInterest?: string;
  buyerType: BuyerType;
  hsCode?: string;
  technicalStandards?: string[];
  certificationsRequired?: string[];
  preferredIncoterms?: string;
  targetPort?: string;
  roleCategory?: RoleCategory;
  annualImportVolume?: string;
  leadSource?: string;
  sourceUrl?: string;
  externalProvider?: string;
  externalProviderId?: string;
  companyDescription?: string;
  notes?: string;
  companyId?: string;
  assignedUser?: { _id: string; name: string; email: string; role: string };
  leadStatus: LeadStatus;
  validationStatus: ValidationStatus;
  validationReason?: string;
  validationDate?: string;
  aiClassification?: string;
  aiScore?: number;
  aiConfidence?: number;
  aiReasoning?: string;
  aiRecommendedApproach?: string;
  outreachStatus: OutreachStatus;
  lastContacted?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  companyName: string;
  website?: string;
  country: string;
  industry: string;
  productInterest?: string;
  description?: string;
  source?: string;
  employeeCount?: string;
  hsCodes?: string[];
  primaryStandards?: string[];
  preferredIncoterms?: string;
  annualImportVolume?: string;
  status: 'Active' | 'Inactive' | 'Blacklisted';
  contactCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  product?: string;
  targetCountry?: string;
  buyerType?: string;
  targetRoleCategory?: RoleCategory | 'All';
  incotermDefault?: string;
  hsCodeContext?: string;
  language: string;
  status: 'Active' | 'Draft' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';

export interface Campaign {
  _id: string;
  name: string;
  product: string;
  targetCountries: string[];
  targetIndustries: string[];
  templateId: EmailTemplate | string;
  dailySendingLimit: number;
  incoterms?: string;
  targetRoleCategory?: string;
  defaultHsCode?: string;
  deliveryPort?: string;
  status: CampaignStatus;
  createdBy: { _id: string; name: string; email: string };
  approvedBy?: { _id: string; name: string; email: string };
  approvedAt?: string;
  stats: {
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    suppressedRecipients: number;
    sentCount: number;
    failedCount: number;
    responseCount: number;
    followUpCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LandedCostInput {
  basePricePerUnitUSD: number;
  quantity: number;
  unitWeightKg: number;
  unitVolumeCbm?: number;
  incoterm: 'EXW' | 'FOB' | 'CFR' | 'CIF' | 'DDP';
  destinationPort: string;
  freightMode?: 'Ocean FCL' | 'Ocean LCL' | 'Air Express';
  insurancePercentage?: number;
}

export interface LandedCostResult {
  quantity: number;
  exwSubtotalUSD: number;
  fobPortHandlingUSD: number;
  fobTotalUSD: number;
  fobUnitPriceUSD: number;
  oceanFreightUSD: number;
  insuranceUSD: number;
  cifTotalUSD: number;
  cifUnitPriceUSD: number;
  estimatedCustomsDutyUSD: number;
  estimatedDdpTotalUSD: number;
  estimatedTransitDays: number;
  containerDetails: {
    recommendedContainer: '20ft FCL' | '40ft FCL' | 'LCL Ocean Freight' | 'Air Cargo';
    containerCount: number;
    totalWeightKg: number;
    totalVolumeCbm: number;
  };
}

export interface HsCodeEntry {
  code: string;
  category: string;
  description: string;
  typicalDutyRatePct: number;
  primaryStandards: string[];
  requiredCertificates: string[];
}

export interface ParsedRfqResult {
  productName: string;
  category: string;
  hsCode: string;
  materialGrade: string;
  quantity: number;
  unitOfMeasure: string;
  pressureOrPowerRating: string;
  requiredStandards: string[];
  requiredCertificates: string[];
  destinationPort: string;
  preferredIncoterm: string;
  deliveryDeadlineDays: number;
  extractedNotes: string;
  draftQuoteResponse: {
    subject: string;
    body: string;
    estimatedTotalPriceUSD: number;
    estimatedLeadTimeWeeks: number;
  };
}

export interface CampaignRecipient {
  _id: string;
  campaignId: string;
  leadId: Lead;
  email: string;
  personalizedSubject?: string;
  personalizedBody?: string;
  status: 'Pending' | 'Personalized' | 'Sent' | 'Failed' | 'Suppressed' | 'Invalid';
  sentAt?: string;
  errorMessage?: string;
}

export interface FollowUp {
  _id: string;
  leadId: Lead;
  assignedUser: { _id: string; name: string; email: string };
  dueDate: string;
  title: string;
  notes?: string;
  status: 'Pending' | 'Due' | 'Completed' | 'Cancelled' | 'Skipped';
  priority: 'Low' | 'Medium' | 'High';
  completedAt?: string;
  createdAt: string;
}

export interface Suppression {
  _id: string;
  email: string;
  company?: string;
  reason: string;
  source: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  user: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardData {
  kpis: {
    totalLeads: number;
    validContacts: number;
    invalidContacts: number;
    qualifiedBuyers: number;
    emailsSent: number;
    responses: number;
    followupsPending: number;
    activeCampaigns: number;
  };
  funnel: { stage: string; count: number }[];
  campaignSummaries: Campaign[];
  followUpsDueToday: FollowUp[];
  recentActivity: ActivityLog[];
}
