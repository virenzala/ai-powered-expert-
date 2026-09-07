import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { importService } from '../services/import.service';
import { ImportJob } from '../models/ImportJob';
import { inMemoryStore } from '../services/inMemoryStore';
import path from 'path';

export const uploadFileAndPreview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No CSV file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const records = await importService.parseCSV(filePath);

    if (records.length === 0) {
      res.status(400).json({ success: false, message: 'Uploaded CSV file is empty.' });
      return;
    }

    const headers = records[0] ? Object.keys(records[0]).filter(Boolean) : [];
    const previewRows = records.slice(0, 5);

    // Auto-suggest column mappings for both snake_case and camelCase headers
    const suggestedMapping: Record<string, string> = {};
    headers.forEach((h) => {
      if (!h || typeof h !== 'string') return;
      const lh = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lh.includes('company')) suggestedMapping.companyName = h;
      else if (lh.includes('contact') || lh === 'name') suggestedMapping.contactName = h;
      else if (lh.includes('email')) suggestedMapping.email = h;
      else if (lh.includes('phone') || lh.includes('tel') || lh.includes('mobile')) suggestedMapping.phone = h;
      else if (lh.includes('web') || lh.includes('site') || lh.includes('domain')) suggestedMapping.website = h;
      else if (lh.includes('country') || lh.includes('nation')) suggestedMapping.country = h;
      else if (lh.includes('state') || lh.includes('region') || lh.includes('province')) suggestedMapping.state = h;
      else if (lh.includes('city') || lh.includes('town')) suggestedMapping.city = h;
      else if (lh.includes('industry') || lh.includes('sector')) suggestedMapping.industry = h;
      else if (lh.includes('product')) suggestedMapping.productInterest = h;
      else if (lh.includes('buyer')) suggestedMapping.buyerType = h;
      else if (lh.includes('desc')) suggestedMapping.companyDescription = h;
      else if (lh.includes('sourceurl')) suggestedMapping.sourceUrl = h;
      else if (lh.includes('source')) suggestedMapping.leadSource = h;
      else if (lh.includes('title') || lh.includes('job') || lh.includes('role') || lh.includes('designation')) suggestedMapping.jobTitle = h;
    });

    res.json({
      success: true,
      filePath,
      fileName: req.file.originalname,
      totalRows: records.length,
      headers,
      previewRows,
      suggestedMapping,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processImportJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filePath, mapping, duplicateStrategy, fileName } = req.body;

    if (!filePath || !mapping || !mapping.email || !mapping.companyName) {
      res.status(400).json({ success: false, message: 'File path and required column mappings (email, companyName) are required.' });
      return;
    }

    const records = await importService.parseCSV(filePath);
    const userId = req.user?._id ? req.user._id.toString() : (req.user?.id || 'system_user');
    const importJob = await importService.processImport(
      records,
      mapping,
      userId,
      fileName || path.basename(filePath),
      duplicateStrategy || 'skip'
    );

    res.json({
      success: true,
      message: `Import completed. ${importJob.importedCount} leads imported successfully.`,
      job: importJob,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getImportJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let jobs: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        jobs = await ImportJob.find().sort({ createdAt: -1 }).limit(20);
      } catch (e) {
        jobs = inMemoryStore.getImportJobs();
      }
    } else {
      jobs = inMemoryStore.getImportJobs();
    }
    res.json({ success: true, data: jobs });
  } catch (error: any) {
    res.json({ success: true, data: inMemoryStore.getImportJobs() });
  }
};

export const downloadErrorReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let job: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        job = await ImportJob.findById(req.params.id);
      } catch (e) {
        job = inMemoryStore.getImportJobs().find((j) => j._id === req.params.id || j.id === req.params.id);
      }
    } else {
      job = inMemoryStore.getImportJobs().find((j) => j._id === req.params.id || j.id === req.params.id);
    }

    if (!job) {
      res.status(404).json({ success: false, message: 'Import job not found' });
      return;
    }

    let csvContent = 'Row,Company,Email,Status,Reason\n';
    (job.jobErrors || []).forEach((err: any) => {
      csvContent += `"${err.row}","${(err.company || 'N/A').replace(/"/g, '""')}","${(err.email || 'N/A').replace(/"/g, '""')}","${err.status || 'Invalid'}","${err.reason.replace(/"/g, '""')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="import_report_${job._id || job.id}.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
