import { Schema, model, Document, Types } from 'mongoose';

export type CampaignStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';

export interface ICampaignStats {
  totalRecipients: number;
  validRecipients: number;
  invalidRecipients: number;
  suppressedRecipients: number;
  sentCount: number;
  failedCount: number;
  responseCount: number;
  followUpCount: number;
}

export interface ICampaign extends Document {
  name: string;
  product: string;
  targetCountries: string[];
  targetIndustries: string[];
  templateId: Types.ObjectId;
  dailySendingLimit: number;
  incoterms?: string;
  targetRoleCategory?: string;
  defaultHsCode?: string;
  deliveryPort?: string;
  startDate?: Date;
  endDate?: Date;
  status: CampaignStatus;
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  stats: ICampaignStats;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    product: { type: String, required: true },
    targetCountries: [{ type: String }],
    targetIndustries: [{ type: String }],
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
    dailySendingLimit: { type: Number, default: 50 },
    incoterms: { type: String, default: 'CIF' },
    targetRoleCategory: { type: String, default: 'All' },
    defaultHsCode: { type: String },
    deliveryPort: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Running', 'Paused', 'Completed', 'Cancelled'],
      default: 'Draft',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    stats: {
      totalRecipients: { type: Number, default: 0 },
      validRecipients: { type: Number, default: 0 },
      invalidRecipients: { type: Number, default: 0 },
      suppressedRecipients: { type: Number, default: 0 },
      sentCount: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
      responseCount: { type: Number, default: 0 },
      followUpCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Campaign = model<ICampaign>('Campaign', campaignSchema);
