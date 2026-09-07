import { Schema, model, Document, Types } from 'mongoose';

export type SuppressionReason = 'Opted out' | 'Invalid' | 'Do not contact' | 'Previously contacted' | 'Compliance restriction';

export interface ISuppression extends Document {
  email: string;
  company?: string;
  reason: SuppressionReason;
  source: string;
  addedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const suppressionSchema = new Schema<ISuppression>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    company: { type: String },
    reason: {
      type: String,
      enum: ['Opted out', 'Invalid', 'Do not contact', 'Previously contacted', 'Compliance restriction'],
      default: 'Opted out',
    },
    source: { type: String, default: 'Manual' },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Suppression = model<ISuppression>('Suppression', suppressionSchema);
