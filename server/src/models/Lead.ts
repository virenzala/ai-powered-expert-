import { Schema, model, Document, Types } from 'mongoose';

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

export type ValidationStatus = 'Not Checked' | 'Not Yet Processed' | 'Valid' | 'Invalid' | 'Risky' | 'Unknown' | 'Disposable';
export type BuyerType = 'Importer' | 'Distributor' | 'Wholesaler' | 'Manufacturer' | 'Retailer' | 'Unknown';
export type OutreachStatus = 'Not Contacted' | 'Campaign Queued' | 'Email Sent' | 'Follow Up Scheduled' | 'Replied' | 'Unresponsive' | 'Opted Out';
export type RoleCategory = 'Procurement' | 'Engineering' | 'Quality QA/QC' | 'Executive' | 'General';

export interface ILead extends Document {
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
  externalProvider?: 'apollo' | 'google' | 'mock' | 'manual' | string;
  externalProviderId?: string;
  companyDescription?: string;
  notes?: string;
  companyId?: Types.ObjectId;
  assignedUser?: Types.ObjectId;
  leadStatus: LeadStatus;
  validationStatus: ValidationStatus;
  validationReason?: string;
  validationDate?: Date;
  aiClassification?: string; // High Priority Buyer, Medium Priority Buyer, etc.
  aiScore?: number; // 0 - 100
  aiConfidence?: number;
  aiReasoning?: string;
  aiRecommendedApproach?: string;
  outreachStatus: OutreachStatus;
  lastContacted?: Date;
  lastContactedAt?: Date;
  nextFollowUp?: Date;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    companyName: { type: String, required: true, trim: true, index: true },
    contactName: { type: String, required: true, trim: true },
    jobTitle: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true, lowercase: true, index: true },
    country: { type: String, required: true, index: true },
    state: { type: String },
    city: { type: String },
    industry: { type: String, required: true, index: true },
    productInterest: { type: String, index: true },
    buyerType: {
      type: String,
      enum: ['Importer', 'Distributor', 'Wholesaler', 'Manufacturer', 'Retailer', 'Contractor', 'Unknown'],
      default: 'Unknown',
      index: true,
    },
    hsCode: { type: String, trim: true, index: true },
    technicalStandards: [{ type: String }],
    certificationsRequired: [{ type: String }],
    preferredIncoterms: { type: String, trim: true },
    targetPort: { type: String, trim: true },
    roleCategory: {
      type: String,
      enum: ['Procurement', 'Engineering', 'Quality QA/QC', 'Executive', 'General'],
      default: 'General',
      index: true,
    },
    annualImportVolume: { type: String },
    leadSource: { type: String, default: 'API Discovery' },
    sourceUrl: { type: String },
    externalProvider: { type: String, default: 'mock', index: true },
    externalProviderId: { type: String, index: true },
    companyDescription: { type: String },
    notes: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    assignedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    leadStatus: {
      type: String,
      enum: [
        'New',
        'Imported',
        'Validating',
        'Valid',
        'Invalid',
        'Qualified',
        'Unqualified',
        'Contacted',
        'Replied',
        'Follow-up',
        'Converted',
        'Suppressed',
      ],
      default: 'New',
      index: true,
    },
    validationStatus: {
      type: String,
      enum: ['Not Checked', 'Not Yet Processed', 'Valid', 'Invalid', 'Risky', 'Unknown', 'Disposable'],
      default: 'Not Yet Processed',
      index: true,
    },
    validationReason: { type: String },
    validationDate: { type: Date },
    aiClassification: { type: String, index: true },
    aiScore: { type: Number, min: 0, max: 100, index: true },
    aiConfidence: { type: Number },
    aiReasoning: { type: String },
    aiRecommendedApproach: { type: String },
    outreachStatus: {
      type: String,
      enum: ['Not Contacted', 'Campaign Queued', 'Email Sent', 'Follow Up Scheduled', 'Replied', 'Unresponsive', 'Opted Out'],
      default: 'Not Contacted',
      index: true,
    },
    lastContacted: { type: Date },
    lastContactedAt: { type: Date },
    nextFollowUp: { type: Date },
    nextFollowUpAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes
leadSchema.index({ externalProvider: 1, externalProviderId: 1 });
leadSchema.index({ country: 1, industry: 1, leadStatus: 1 });
leadSchema.index({ aiScore: -1 });

export const Lead = model<ILead>('Lead', leadSchema);
