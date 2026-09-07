import { Schema, model, Document } from 'mongoose';

export interface IIntegration extends Document {
  service: 'gmail' | 'ai' | 'validation';
  provider: string; // e.g. google, gemini, openai, hunter, mock
  status: 'Connected' | 'Disconnected' | 'Error';
  credentials?: any; // Encrypted or OAuth tokens
  settings?: any; // API keys, daily limits, active model
  lastSyncAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IIntegration>(
  {
    service: { type: String, enum: ['gmail', 'ai', 'validation'], required: true, unique: true, index: true },
    provider: { type: String, required: true },
    status: { type: String, enum: ['Connected', 'Disconnected', 'Error'], default: 'Disconnected' },
    credentials: { type: Schema.Types.Mixed },
    settings: { type: Schema.Types.Mixed },
    lastSyncAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Integration = model<IIntegration>('Integration', integrationSchema);
