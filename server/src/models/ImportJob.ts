import { Schema, model, Document, Types } from 'mongoose';

export interface IImportJob extends Document {
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  skippedCount: number;
  status: 'Completed' | 'Failed' | 'Processing';
  jobErrors: { row: number; company?: string; email?: string; status?: 'Invalid' | 'Duplicate'; reason: string }[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const importJobSchema = new Schema<IImportJob>(
  {
    fileName: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    importedCount: { type: Number, default: 0 },
    duplicateCount: { type: Number, default: 0 },
    invalidCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Completed', 'Failed', 'Processing'], default: 'Processing' },
    jobErrors: [
      {
        row: Number,
        company: String,
        email: String,
        status: { type: String, enum: ['Invalid', 'Duplicate'], default: 'Invalid' },
        reason: String,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const ImportJob = model<IImportJob>('ImportJob', importJobSchema);
