import { Schema, model, Document, Types } from 'mongoose';

export interface ILeadClassification extends Document {
  leadId: Types.ObjectId;
  classification: string;
  buyerType: string;
  score: number;
  confidence: number;
  reason: string;
  recommendedApproach: string;
  rawAiOutput?: any;
  createdAt: Date;
}

const leadClassificationSchema = new Schema<ILeadClassification>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    classification: { type: String, required: true },
    buyerType: { type: String, required: true },
    score: { type: Number, required: true },
    confidence: { type: Number, required: true },
    reason: { type: String, required: true },
    recommendedApproach: { type: String, required: true },
    rawAiOutput: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const LeadClassification = model<ILeadClassification>('LeadClassification', leadClassificationSchema);
