import { Schema, model, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  exportProducts: string[];
  targetMarkets: string[];
  website?: string;
  industry?: string;
  dailyEmailLimit: number;
  defaultFollowUpIntervalDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, default: 'Apex Industrial Exports' },
    exportProducts: [{ type: String, default: ['Industrial Valves', 'Pumps', 'CNC Machine Components', 'Electrical Equipment'] }],
    targetMarkets: [{ type: String, default: ['Germany', 'USA', 'UAE', 'Singapore', 'Japan', 'Brazil'] }],
    website: { type: String, default: 'https://apexindustrialexports.com' },
    industry: { type: String, default: 'Industrial Machinery & Equipment' },
    dailyEmailLimit: { type: Number, default: 100 },
    defaultFollowUpIntervalDays: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export const Organization = model<IOrganization>('Organization', organizationSchema);
