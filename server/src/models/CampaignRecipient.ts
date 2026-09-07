import { Schema, model, Document, Types } from 'mongoose';

export type RecipientStatus = 'Pending' | 'Personalized' | 'Sent' | 'Failed' | 'Suppressed' | 'Invalid';

export interface ICampaignRecipient extends Document {
  campaignId: Types.ObjectId;
  leadId: Types.ObjectId;
  email: string;
  personalizedSubject?: string;
  personalizedBody?: string;
  status: RecipientStatus;
  sentAt?: Date;
  emailLogId?: Types.ObjectId;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignRecipientSchema = new Schema<ICampaignRecipient>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    personalizedSubject: { type: String },
    personalizedBody: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Personalized', 'Sent', 'Failed', 'Suppressed', 'Invalid'],
      default: 'Pending',
      index: true,
    },
    sentAt: { type: Date },
    emailLogId: { type: Schema.Types.ObjectId, ref: 'EmailLog' },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per campaign recipient
campaignRecipientSchema.index({ campaignId: 1, leadId: 1 }, { unique: true });

export const CampaignRecipient = model<ICampaignRecipient>('CampaignRecipient', campaignRecipientSchema);
