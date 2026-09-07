import { Schema, model, Document, Types } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  body: string;
  product?: string;
  targetCountry?: string;
  buyerType?: string;
  targetRoleCategory?: 'Procurement' | 'Engineering' | 'Quality QA/QC' | 'Executive' | 'All';
  incotermDefault?: string;
  hsCodeContext?: string;
  language: string;
  status: 'Active' | 'Draft' | 'Archived';
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const emailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    product: { type: String },
    targetCountry: { type: String },
    buyerType: { type: String },
    targetRoleCategory: {
      type: String,
      enum: ['Procurement', 'Engineering', 'Quality QA/QC', 'Executive', 'All'],
      default: 'All',
    },
    incotermDefault: { type: String, default: 'CIF' },
    hsCodeContext: { type: String },
    language: { type: String, default: 'English' },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const EmailTemplate = model<IEmailTemplate>('EmailTemplate', emailTemplateSchema);
