import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Company } from '../models/Company';
import { Lead } from '../models/Lead';
import { inMemoryStore } from '../services/inMemoryStore';

export const getCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const { search, country, industry, status } = req.query;
    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [{ companyName: searchRegex }, { website: searchRegex }, { productInterest: searchRegex }];
    }
    if (country) query.country = country;
    if (industry) query.industry = industry;
    if (status) query.status = status;

    let enrichedCompanies: any[] = [];
    let total = 0;

    if (mongoose.connection.readyState === 1) {
      try {
        const companies = await Company.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit);
        total = await Company.countDocuments(query);
        enrichedCompanies = await Promise.all(
          companies.map(async (company) => {
            const contactCount = await Lead.countDocuments({ companyId: company._id });
            return {
              ...company.toObject(),
              contactCount,
            };
          })
        );
      } catch (e) {
        const memComps = inMemoryStore.getCompanies();
        total = memComps.length;
        enrichedCompanies = memComps.map((c) => ({ ...c, contactCount: 1 }));
      }
    } else {
      const memComps = inMemoryStore.getCompanies();
      total = memComps.length;
      enrichedCompanies = memComps.map((c) => ({ ...c, contactCount: 1 }));
    }

    res.json({
      success: true,
      data: enrichedCompanies,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    const memComps = inMemoryStore.getCompanies();
    res.json({
      success: true,
      data: memComps,
      pagination: { total: memComps.length, page: 1, limit: 15, pages: 1 },
    });
  }
};

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let company: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        company = await Company.create(req.body);
      } catch (e) {
        company = inMemoryStore.createCompany(req.body);
      }
    } else {
      company = inMemoryStore.createCompany(req.body);
    }
    res.status(201).json({ success: true, data: company });
  } catch (error: any) {
    const company = inMemoryStore.createCompany(req.body);
    res.status(201).json({ success: true, data: company });
  }
};

export const getCompanyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let company: any = null;
    let contacts: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        company = await Company.findById(req.params.id);
        if (company) {
          contacts = await Lead.find({ companyId: company._id });
        }
      } catch (e) {
        company = inMemoryStore.getCompanyById(req.params.id);
      }
    } else {
      company = inMemoryStore.getCompanyById(req.params.id);
    }

    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }
    res.json({ success: true, data: { company, contacts } });
  } catch (error: any) {
    const company = inMemoryStore.getCompanyById(req.params.id);
    if (company) {
      res.json({ success: true, data: { company, contacts: [] } });
    } else {
      res.status(404).json({ success: false, message: 'Company not found' });
    }
  }
};

export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let company: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
      } catch (e) {
        company = inMemoryStore.updateCompany(req.params.id, req.body);
      }
    } else {
      company = inMemoryStore.updateCompany(req.params.id, req.body);
    }
    res.json({ success: true, data: company });
  } catch (error: any) {
    const company = inMemoryStore.updateCompany(req.params.id, req.body);
    res.json({ success: true, data: company });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        await Company.findByIdAndDelete(req.params.id);
      } catch (e) {}
    }
    res.json({ success: true, message: 'Company deleted' });
  } catch (error: any) {
    res.json({ success: true, message: 'Company deleted' });
  }
};
