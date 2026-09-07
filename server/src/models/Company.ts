import { Schema, model, Document } from 'mongoose';

export interface ICompany extends Document {
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true, trim: true, index: true },
    website: { type: String, trim: true, lowercase: true, index: true },
    country: { type: String, required: true, index: true },
    industry: { type: String, required: true, index: true },
    productInterest: { type: String },
    description: { type: String },
    source: { type: String, default: 'Direct Import' },
    employeeCount: { type: String },
    hsCodes: [{ type: String }],
    primaryStandards: [{ type: String }],
    preferredIncoterms: { type: String },
    annualImportVolume: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'Blacklisted'], default: 'Active' },
    notes: { type: String },
  },
  { timestamps: true }
);

// Compound index to quickly find duplicate companies by name + website
companySchema.index({ companyName: 1, website: 1 });

export const Company = model<ICompany>('Company', companySchema);
