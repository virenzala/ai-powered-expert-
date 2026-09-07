import { Schema, model, Document, Types } from 'mongoose';

export type FollowUpStatus = 'Pending' | 'Due' | 'Completed' | 'Cancelled' | 'Skipped';
export type FollowUpPriority = 'Low' | 'Medium' | 'High';

export interface IFollowUp extends Document {
  leadId: Types.ObjectId;
  assignedUser: Types.ObjectId;
  dueDate: Date;
  title: string;
  notes?: string;
  status: FollowUpStatus;
  priority: FollowUpPriority;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    assignedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dueDate: { type: Date, required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['Pending', 'Due', 'Completed', 'Cancelled', 'Skipped'],
      default: 'Pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const FollowUp = model<IFollowUp>('FollowUp', followUpSchema);
