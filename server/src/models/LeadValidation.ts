import { Schema, model, Document, Types } from 'mongoose';

export interface ILeadValidation extends Document {
  leadId: Types.ObjectId;
  email: string;
  validationStatus: string;
  reason?: string;
  isDisposable: boolean;
  provider: string;
  providerResponse?: any;
  validatedAt: Date;
}

const leadValidationSchema = new Schema<ILeadValidation>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    validationStatus: { type: String, required: true },
    reason: { type: String },
    isDisposable: { type: Boolean, default: false },
    provider: { type: String, default: 'mock' },
    providerResponse: { type: Schema.Types.Mixed },
    validatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const LeadValidation = model<ILeadValidation>('LeadValidation', leadValidationSchema);
