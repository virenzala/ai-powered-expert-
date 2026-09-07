import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Company } from '../models/Company';
import { Lead } from '../models/Lead';

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

    const companies = await Company.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit);
    const total = await Company.countDocuments(query);

    // Attach contact count per company
    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const contactCount = await Lead.countDocuments({ companyId: company._id });
        return {
          ...company.toObject(),
          contactCount,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedCompanies,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }
    const contacts = await Lead.find({ companyId: company._id });
    res.json({ success: true, data: { company, contacts } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Company deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
