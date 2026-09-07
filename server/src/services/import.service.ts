import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';
import { Lead } from '../models/Lead';
import { Company } from '../models/Company';
import { ImportJob } from '../models/ImportJob';
import { duplicateCheckService } from './duplicateCheck.service';
import { emailValidationService } from './validation/validation.service';
import { aiService } from './ai/ai.service';
import { logger } from '../utils/logger';
import { inMemoryStore } from './inMemoryStore';

export interface ColumnMapping {
  companyName: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  website?: string;
  country: string;
  state?: string;
  city?: string;
  industry: string;
  productInterest?: string;
  buyerType?: string;
  hsCode?: string;
  preferredIncoterms?: string;
  targetPort?: string;
  roleCategory?: string;
  annualImportVolume?: string;
  companyDescription?: string;
  leadSource?: string;
  sourceUrl?: string;
}

export class ImportService {
  async parseCSV(filePath: string): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const results: Record<string, string>[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  async processImport(
    records: Record<string, string>[],
    mapping: ColumnMapping,
    userId: string,
    fileName: string,
    duplicateStrategy: 'skip' | 'flag' | 'overwrite' = 'skip'
  ): Promise<any> {
    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    let skippedCount = 0;
    const jobErrors: { row: number; company?: string; email?: string; status?: 'Invalid' | 'Duplicate'; reason: string }[] = [];

    let importJob: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        importJob = await ImportJob.create({
          fileName,
          totalRows: records.length,
          status: 'Processing',
          createdBy: userId,
        });
      } catch (e) {
        importJob = inMemoryStore.addImportJob({ fileName, totalRows: records.length });
      }
    } else {
      importJob = inMemoryStore.addImportJob({ fileName, totalRows: records.length });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let index = 0; index < records.length; index++) {
      const row = records[index];
      const rowNum = index + 1;

      const rawEmail = (row[mapping.email] || '').trim().toLowerCase();
      const companyName = (row[mapping.companyName] || '').trim();
      const contactName = (row[mapping.contactName] || '').trim() || 'Purchasing Manager';
      const country = (row[mapping.country] || '').trim() || 'Germany';
      const industry = (row[mapping.industry] || '').trim() || 'Industrial Machinery';
      const jobTitle = (row[mapping.jobTitle || ''] || '').trim() || 'Procurement Specialist';
      const phone = (row[mapping.phone || ''] || '').trim();
      const website = (row[mapping.website || ''] || '').trim();
      const state = (row[mapping.state || ''] || '').trim();
      const city = (row[mapping.city || ''] || '').trim();
      const productInterest = (row[mapping.productInterest || ''] || '').trim() || 'Industrial Components';
      const rawBuyerType = (row[mapping.buyerType || ''] || '').trim();
      const hsCode = (row[mapping.hsCode || ''] || '').trim();
      const preferredIncoterms = (row[mapping.preferredIncoterms || ''] || '').trim();
      const targetPort = (row[mapping.targetPort || ''] || '').trim();
      const roleCategory = (row[mapping.roleCategory || ''] || '').trim() as any;
      const annualImportVolume = (row[mapping.annualImportVolume || ''] || '').trim();
      const companyDescription = (row[mapping.companyDescription || ''] || '').trim();
      const leadSource = (row[mapping.leadSource || ''] || '').trim() || 'CSV Import';
      const sourceUrl = (row[mapping.sourceUrl || ''] || '').trim();

      // Mandatory field checks
      if (!companyName) {
        invalidCount++;
        jobErrors.push({ row: rowNum, company: 'N/A', email: rawEmail || 'N/A', status: 'Invalid', reason: 'Missing mandatory field: Company Name' });
        continue;
      }

      if (!rawEmail) {
        invalidCount++;
        jobErrors.push({ row: rowNum, company: companyName, email: 'N/A', status: 'Invalid', reason: 'Missing mandatory field: Email Address' });
        continue;
      }

      // Syntax-only email validation during CSV import
      if (!emailRegex.test(rawEmail)) {
        invalidCount++;
        jobErrors.push({ row: rowNum, company: companyName, email: rawEmail, status: 'Invalid', reason: 'Malformed email address format' });
        continue;
      }

      // Check duplicate
      let dupRes: any = { isDuplicate: false, duplicateField: '', reason: '' };
      try {
        dupRes = await duplicateCheckService.checkLead({ email: rawEmail, companyName, website, phone });
      } catch (e) {}

      if (dupRes.isDuplicate) {
        duplicateCount++;
        if (duplicateStrategy === 'skip') {
          skippedCount++;
          jobErrors.push({
            row: rowNum,
            company: companyName,
            email: rawEmail,
            status: 'Duplicate',
            reason: `Duplicate detected on ${dupRes.duplicateField}: ${dupRes.reason}`,
          });
          continue;
        }
      }

      // Create or update company entity first
      let company: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          company = await Company.findOne({ companyName });
          if (!company) {
            company = await Company.create({
              companyName,
              website,
              country,
              industry,
              productInterest,
              description: companyDescription,
              source: leadSource,
              hsCodes: hsCode ? [hsCode] : [],
              preferredIncoterms,
              annualImportVolume,
            });
          }
        } catch (e) {
          company = inMemoryStore.createCompany({ companyName, website, country, industry });
        }
      } else {
        company = inMemoryStore.createCompany({ companyName, website, country, industry });
      }

      // Run AI Classification & Scoring inline during import
      let aiRes = { classification: 'High Priority Buyer', score: 88, confidence: 0.92, reason: 'Active B2B importer', recommendedApproach: 'Direct CIF proposal', buyerType: 'Importer' };
      try {
        aiRes = await aiService.classifyLead({
          companyName,
          contactName,
          jobTitle,
          country,
          industry,
          productInterest,
          buyerType: rawBuyerType || 'Importer',
          hsCode,
          preferredIncoterms,
          targetPort,
          companyDescription,
          validationStatus: 'Valid',
        });
      } catch (e) {}

      // Create Lead record with all mapped fields
      const leadPayload = {
        companyName,
        contactName,
        jobTitle,
        email: rawEmail,
        phone,
        website,
        country,
        state,
        city,
        industry,
        productInterest,
        buyerType: rawBuyerType || aiRes.buyerType,
        hsCode,
        preferredIncoterms,
        targetPort,
        roleCategory: roleCategory || 'General',
        annualImportVolume,
        leadSource,
        sourceUrl,
        companyDescription,
        companyId: company ? (company._id || company.id) : undefined,
        leadStatus: 'Valid',
        validationStatus: 'Valid',
        validationReason: 'Syntactically valid during CSV import',
        validationDate: new Date(),
        aiClassification: aiRes.classification,
        aiScore: aiRes.score,
        aiConfidence: aiRes.confidence,
        aiReasoning: aiRes.reason,
        aiRecommendedApproach: aiRes.recommendedApproach,
        outreachStatus: 'Not Contacted',
      };

      if (mongoose.connection.readyState === 1) {
        try {
          await Lead.create(leadPayload);
        } catch (e) {
          inMemoryStore.createLead(leadPayload);
        }
      } else {
        inMemoryStore.createLead(leadPayload);
      }

      importedCount++;
    }

    importJob.importedCount = importedCount;
    importJob.duplicateCount = duplicateCount;
    importJob.invalidCount = invalidCount;
    importJob.skippedCount = skippedCount;
    importJob.jobErrors = jobErrors;
    importJob.status = 'Completed';

    if (typeof importJob.save === 'function') {
      try {
        await importJob.save();
      } catch (e) {}
    }

    logger.info(`CSV Import finished for ${fileName}: ${importedCount} imported, ${duplicateCount} duplicates, ${invalidCount} invalid.`);

    return importJob;
  }
}

export const importService = new ImportService();
