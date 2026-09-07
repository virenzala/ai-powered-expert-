import { Schema, model, Document, Types } from 'mongoose';

export type EmailLogStatus = 'Queued' | 'Sending' | 'Sent' | 'Failed' | 'Retry' | 'Cancelled';

export interface IEmailLog extends Document {
  leadId: Types.ObjectId;
  campaignId?: Types.ObjectId;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt?: Date;
  status: EmailLogStatus;
  error?: string;
  retryCount: number;
  messageId?: string;
  threadId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
    sender: { type: String, required: true },
    recipient: { type: String, required: true, lowercase: true, index: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sentAt: { type: Date },
    status: {
      type: String,
      enum: ['Queued', 'Sending', 'Sent', 'Failed', 'Retry', 'Cancelled'],
      default: 'Queued',
      index: true,
    },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    messageId: { type: String },
    threadId: { type: String },
  },
  { timestamps: true }
);

export const EmailLog = model<IEmailLog>('EmailLog', emailLogSchema);
