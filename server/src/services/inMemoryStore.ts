import bcrypt from 'bcryptjs';
import { seedUsers, seedCompanies, seedLeads, seedTemplates } from '../seed/seedData';

export interface InMemoryUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Manager' | 'Sales';
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface InMemoryCompany {
  id: string;
  _id: string;
  companyName: string;
  website?: string;
  country: string;
  industry: string;
  productInterest?: string;
  description?: string;
  employeeCount?: string;
  hsCodes?: string[];
  primaryStandards?: string[];
  preferredIncoterms?: string;
  annualImportVolume?: string;
  source?: string;
  createdAt: Date;
}

export interface InMemoryLead {
  id: string;
  _id: string;
  companyName: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  website?: string;
  country: string;
  city?: string;
  industry: string;
  productInterest?: string;
  buyerType?: string;
  hsCode?: string;
  technicalStandards?: string[];
  certificationsRequired?: string[];
  preferredIncoterms?: string;
  targetPort?: string;
  roleCategory?: string;
  annualImportVolume?: string;
  companyDescription?: string;
  validationStatus: string;
  validationReason?: string;
  aiClassification?: string;
  aiScore?: number;
  aiConfidence?: number;
  aiReasoning?: string;
  aiRecommendedApproach?: string;
  leadStatus: string;
  outreachStatus: string;
  assignedUser?: string;
  companyId?: string;
  createdAt: Date;
}

export interface InMemoryTemplate {
  id: string;
  _id: string;
  name: string;
  subject: string;
  body: string;
  product?: string;
  targetCountry?: string;
  buyerType?: string;
  targetRoleCategory?: string;
  incotermDefault?: string;
  hsCodeContext?: string;
  language: string;
  status: string;
  createdAt: Date;
}

export interface InMemoryCampaign {
  id: string;
  _id: string;
  name: string;
  product: string;
  targetCountries: string[];
  targetIndustries: string[];
  templateId?: string;
  dailySendingLimit: number;
  status: string;
  stats: {
    totalRecipients: number;
    validRecipients: number;
    invalidRecipients: number;
    suppressedRecipients: number;
    sentCount: number;
    failedCount: number;
    responseCount: number;
    followUpCount: number;
  };
  createdAt: Date;
}

export interface InMemoryActivityLog {
  id: string;
  _id: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: Date;
}

class InMemoryStore {
  public users: InMemoryUser[] = [];
  public companies: InMemoryCompany[] = [];
  public leads: InMemoryLead[] = [];
  public templates: InMemoryTemplate[] = [];
  public campaigns: InMemoryCampaign[] = [];
  public activityLogs: InMemoryActivityLog[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;

    // Seed default users
    for (let i = 0; i < seedUsers.length; i++) {
      const u = seedUsers[i];
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(u.password, salt);
      const id = `user_mem_${i + 1}`;
      this.users.push({
        id,
        _id: id,
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash,
        role: u.role as any,
        active: true,
        createdAt: new Date(),
      });
    }

    // Seed companies
    for (let i = 0; i < seedCompanies.length; i++) {
      const c = seedCompanies[i];
      const id = `comp_mem_${i + 1}`;
      this.companies.push({
        ...c,
        id,
        _id: id,
        createdAt: new Date(),
      });
    }

    // Seed leads
    for (let i = 0; i < seedLeads.length; i++) {
      const l = seedLeads[i];
      const id = `lead_mem_${i + 1}`;
      const comp = this.companies.find((c) => c.companyName === l.companyName);
      this.leads.push({
        ...l,
        id,
        _id: id,
        companyId: comp ? comp.id : undefined,
        assignedUser: this.users[2]?.id,
        createdAt: new Date(),
      });
    }

    // Seed templates
    for (let i = 0; i < seedTemplates.length; i++) {
      const t = seedTemplates[i];
      const id = `tmpl_mem_${i + 1}`;
      this.templates.push({
        ...t,
        id,
        _id: id,
        createdAt: new Date(),
      });
    }

    // Seed sample campaign
    const campId = 'camp_mem_1';
    this.campaigns.push({
      id: campId,
      _id: campId,
      name: 'Europe & USA Industrial Buyers Q3 Campaign',
      product: 'Industrial Valves & Actuators',
      targetCountries: ['Germany', 'USA', 'Brazil'],
      targetIndustries: ['Industrial Machinery', 'Engineering & Controls', 'Industrial Supplies'],
      templateId: this.templates[0]?.id,
      dailySendingLimit: 50,
      status: 'Approved',
      stats: {
        totalRecipients: 3,
        validRecipients: 3,
        invalidRecipients: 0,
        suppressedRecipients: 0,
        sentCount: 2,
        failedCount: 0,
        responseCount: 1,
        followUpCount: 1,
      },
      createdAt: new Date(),
    });

    // Seed activity logs
    this.activityLogs.push({
      id: 'log_mem_1',
      _id: 'log_mem_1',
      userName: 'Sarah Jenkins',
      userRole: 'Admin',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      details: 'ExportFlow system initialized with standard industrial export configuration.',
      timestamp: new Date(),
    });

    this.isInitialized = true;
  }

  // Users
  public findUserByEmail(email: string): InMemoryUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): InMemoryUser | undefined {
    return this.users.find((u) => u.id === id || u._id === id);
  }

  public createUser(userData: { name: string; email: string; passwordHash: string; role?: string }): InMemoryUser {
    const id = `user_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newUser: InMemoryUser = {
      id,
      _id: id,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: (userData.role as any) || 'Sales',
      active: true,
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  public addUser(user: any): void {
    const id = user._id ? user._id.toString() : user.id;
    if (!this.findUserById(id) && !this.findUserByEmail(user.email)) {
      this.users.push({
        id,
        _id: id,
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role || 'Sales',
        active: user.active !== undefined ? user.active : true,
        createdAt: user.createdAt || new Date(),
      });
    }
  }

  // Leads
  public getLeads(): InMemoryLead[] {
    return this.leads;
  }

  public getLeadById(id: string): InMemoryLead | undefined {
    return this.leads.find((l) => l.id === id || l._id === id);
  }

  public createLead(data: Partial<InMemoryLead>): InMemoryLead {
    const id = `lead_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newLead: InMemoryLead = {
      id,
      _id: id,
      companyName: data.companyName || 'Unknown OEM',
      contactName: data.contactName || 'Valued Partner',
      jobTitle: data.jobTitle || 'Procurement Specialist',
      email: data.email || `lead_${Date.now()}@example.com`,
      phone: data.phone || '',
      website: data.website || '',
      country: data.country || 'Global',
      city: data.city || '',
      industry: data.industry || 'Industrial Machinery',
      productInterest: data.productInterest || 'Industrial Components',
      buyerType: data.buyerType || 'Importer',
      hsCode: data.hsCode || '8481.80.10',
      technicalStandards: data.technicalStandards || ['ASME B16.34', 'DIN EN 10204 3.1'],
      certificationsRequired: data.certificationsRequired || ['CE Mark', 'ISO 9001:2015'],
      preferredIncoterms: data.preferredIncoterms || 'CIF',
      targetPort: data.targetPort || 'Main Port',
      roleCategory: data.roleCategory || 'Procurement',
      annualImportVolume: data.annualImportVolume || '$1M+',
      companyDescription: data.companyDescription || '',
      validationStatus: data.validationStatus || 'Valid',
      validationReason: data.validationReason || 'Direct import verification',
      aiClassification: data.aiClassification || 'High Priority Buyer',
      aiScore: data.aiScore || 88,
      aiConfidence: data.aiConfidence || 0.92,
      aiReasoning: data.aiReasoning || 'Active B2B importer matching enterprise specs.',
      aiRecommendedApproach: data.aiRecommendedApproach || 'Direct CIF container pricing proposal.',
      leadStatus: data.leadStatus || 'Valid',
      outreachStatus: data.outreachStatus || 'Not Contacted',
      createdAt: new Date(),
    };
    this.leads.unshift(newLead);
    return newLead;
  }

  public updateLead(id: string, updates: Partial<InMemoryLead>): InMemoryLead | undefined {
    const lead = this.getLeadById(id);
    if (!lead) return undefined;
    Object.assign(lead, updates);
    return lead;
  }

  public deleteLead(id: string): boolean {
    const index = this.leads.findIndex((l) => l.id === id || l._id === id);
    if (index !== -1) {
      this.leads.splice(index, 1);
      return true;
    }
    return false;
  }

  // Companies
  public getCompanies(): InMemoryCompany[] {
    return this.companies;
  }

  public getCompanyById(id: string): InMemoryCompany | undefined {
    return this.companies.find((c) => c.id === id || c._id === id);
  }

  public createCompany(data: Partial<InMemoryCompany>): InMemoryCompany {
    const id = `comp_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCompany: InMemoryCompany = {
      id,
      _id: id,
      companyName: data.companyName || 'New Company',
      website: data.website || '',
      country: data.country || 'Global',
      industry: data.industry || 'Industrial Machinery',
      productInterest: data.productInterest || '',
      description: data.description || '',
      employeeCount: data.employeeCount || '100-250',
      hsCodes: data.hsCodes || ['8481.80.10'],
      primaryStandards: data.primaryStandards || ['DIN EN 10204 3.1'],
      preferredIncoterms: data.preferredIncoterms || 'CIF',
      annualImportVolume: data.annualImportVolume || '$1M+',
      source: data.source || 'Manual Entry',
      createdAt: new Date(),
    };
    this.companies.unshift(newCompany);
    return newCompany;
  }

  public updateCompany(id: string, updates: Partial<InMemoryCompany>): InMemoryCompany | undefined {
    const comp = this.getCompanyById(id);
    if (!comp) return undefined;
    Object.assign(comp, updates);
    return comp;
  }

  // Templates
  public getTemplates(): InMemoryTemplate[] {
    return this.templates;
  }

  public createTemplate(data: Partial<InMemoryTemplate>): InMemoryTemplate {
    const id = `tmpl_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newTmpl: InMemoryTemplate = {
      id,
      _id: id,
      name: data.name || 'New Template',
      subject: data.subject || 'OEM Supply Proposal',
      body: data.body || 'Hello {{contact_name}}, ...',
      product: data.product || 'Industrial Components',
      targetCountry: data.targetCountry || 'Global',
      buyerType: data.buyerType || 'Importer',
      targetRoleCategory: data.targetRoleCategory || 'Procurement',
      incotermDefault: data.incotermDefault || 'CIF',
      hsCodeContext: data.hsCodeContext || '8481.80.10',
      language: data.language || 'English',
      status: data.status || 'Active',
      createdAt: new Date(),
    };
    this.templates.unshift(newTmpl);
    return newTmpl;
  }

  // Campaigns
  public getCampaigns(): InMemoryCampaign[] {
    return this.campaigns;
  }

  public createCampaign(data: Partial<InMemoryCampaign>): InMemoryCampaign {
    const id = `camp_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCamp: InMemoryCampaign = {
      id,
      _id: id,
      name: data.name || 'New Outreach Campaign',
      product: data.product || 'Industrial Valves',
      targetCountries: data.targetCountries || ['Germany', 'USA'],
      targetIndustries: data.targetIndustries || ['Industrial Machinery'],
      templateId: data.templateId || this.templates[0]?.id,
      dailySendingLimit: data.dailySendingLimit || 50,
      status: data.status || 'Draft',
      stats: {
        totalRecipients: 0,
        validRecipients: 0,
        invalidRecipients: 0,
        suppressedRecipients: 0,
        sentCount: 0,
        failedCount: 0,
        responseCount: 0,
        followUpCount: 0,
      },
      createdAt: new Date(),
    };
    this.campaigns.unshift(newCamp);
    return newCamp;
  }

  // Activity Logs
  public addActivityLog(logData: { userName: string; userRole: string; action: string; entityType: string; entityId?: string; details: string }): InMemoryActivityLog {
    const id = `log_mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newLog: InMemoryActivityLog = {
      id,
      _id: id,
      userName: logData.userName,
      userRole: logData.userRole,
      action: logData.action,
      entityType: logData.entityType,
      entityId: logData.entityId,
      details: logData.details,
      timestamp: new Date(),
    };
    this.activityLogs.unshift(newLog);
    return newLog;
  }
}

export const inMemoryStore = new InMemoryStore();
