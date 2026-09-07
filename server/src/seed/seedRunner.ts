import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Company } from '../models/Company';
import { Lead } from '../models/Lead';
import { EmailTemplate } from '../models/EmailTemplate';
import { Campaign } from '../models/Campaign';
import { CampaignRecipient } from '../models/CampaignRecipient';
import { EmailLog } from '../models/EmailLog';
import { FollowUp } from '../models/FollowUp';
import { ActivityLog } from '../models/ActivityLog';
import { Integration } from '../models/Integration';
import { seedUsers, seedCompanies, seedLeads, seedTemplates } from './seedData';
import { logger } from '../utils/logger';

export const seedInline = async () => {
  logger.info('Clearing existing database collections...');
  await User.deleteMany({});
  await Organization.deleteMany({});
  await Company.deleteMany({});
  await Lead.deleteMany({});
  await EmailTemplate.deleteMany({});
  await Campaign.deleteMany({});
  await CampaignRecipient.deleteMany({});
  await EmailLog.deleteMany({});
  await FollowUp.deleteMany({});
  await ActivityLog.deleteMany({});
  await Integration.deleteMany({});

  // 1. Seed Users
  logger.info('Seeding Users...');
  const createdUsers: any[] = [];
  for (const u of seedUsers) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(u.password, salt);
    const user = await User.create({
      name: u.name,
      email: u.email.toLowerCase(),
      passwordHash,
      role: u.role as any,
    });
    createdUsers.push(user);
  }
  const adminUser = createdUsers.find((u) => u.role === 'Admin');
  const managerUser = createdUsers.find((u) => u.role === 'Manager');
  const salesUser = createdUsers.find((u) => u.role === 'Sales');

  // 2. Seed Organization
  logger.info('Seeding Organization settings...');
  await Organization.create({
    name: 'Apex Industrial Exports',
    exportProducts: ['Industrial Valves & Actuators', 'Submersible Slurry Pumps', 'High Voltage Transformers', 'CNC Machine Components & Gears', 'Hydraulic Fittings & Flanges'],
    targetMarkets: ['Germany', 'USA', 'UAE', 'Japan', 'Brazil', 'Singapore'],
    dailyEmailLimit: 100,
  });

  // 3. Seed Integrations
  logger.info('Seeding Integrations...');
  await Integration.create([
    { service: 'gmail', provider: 'mock', status: 'Connected', settings: { email: 'export.manager@apexindustrialexports.com' } },
    { service: 'ai', provider: 'mock', status: 'Connected', settings: { model: 'Gemini 1.5 Pro Export Engine' } },
    { service: 'validation', provider: 'mock', status: 'Connected' },
  ]);

  // 4. Seed Companies
  logger.info('Seeding Companies...');
  const companyDocs: Record<string, any> = {};
  for (const c of seedCompanies) {
    const doc = await Company.create(c);
    companyDocs[c.companyName] = doc;
  }

  // 5. Seed Leads
  logger.info('Seeding Leads...');
  const createdLeads: any[] = [];
  for (const l of seedLeads) {
    const comp = companyDocs[l.companyName];
    const leadDoc = await Lead.create({
      ...l,
      companyId: comp ? comp._id : undefined,
      assignedUser: salesUser._id,
    });
    createdLeads.push(leadDoc);
  }

  // 6. Seed Email Templates
  logger.info('Seeding Email Templates...');
  const createdTemplates: any[] = [];
  for (const t of seedTemplates) {
    const tmpl = await EmailTemplate.create({
      ...t,
      createdBy: managerUser._id,
    });
    createdTemplates.push(tmpl);
  }

  // 7. Seed Campaign
  logger.info('Seeding Campaign...');
  const sampleCampaign = await Campaign.create({
    name: 'Europe & USA Industrial Buyers Q3 Campaign',
    product: 'Industrial Valves & Actuators',
    targetCountries: ['Germany', 'USA', 'Brazil'],
    targetIndustries: ['Industrial Machinery', 'Engineering & Controls', 'Industrial Supplies'],
    templateId: createdTemplates[0]._id,
    dailySendingLimit: 50,
    status: 'Approved',
    createdBy: managerUser._id,
    approvedBy: managerUser._id,
    approvedAt: new Date(),
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
  });

  // 8. Seed Campaign Recipients & Email Logs
  for (let i = 0; i < Math.min(3, createdLeads.length); i++) {
    const lead = createdLeads[i];
    const recipient = await CampaignRecipient.create({
      campaignId: sampleCampaign._id,
      leadId: lead._id,
      email: lead.email,
      personalizedSubject: `OEM Supply of Industrial Valves for ${lead.companyName} in ${lead.country}`,
      personalizedBody: `Hello ${lead.contactName},\n\nWe noticed ${lead.companyName} is a premier company in ${lead.industry} in ${lead.country}...`,
      status: i < 2 ? 'Sent' : 'Personalized',
      sentAt: i < 2 ? new Date() : undefined,
    });

    if (i < 2) {
      const log = await EmailLog.create({
        leadId: lead._id,
        campaignId: sampleCampaign._id,
        sender: salesUser.email,
        recipient: lead.email,
        subject: recipient.personalizedSubject,
        body: recipient.personalizedBody,
        status: 'Sent',
        sentAt: new Date(),
        messageId: `msg_seed_${i + 100}`,
        threadId: `thread_seed_${i + 100}`,
      });
      recipient.emailLogId = log._id;
      await recipient.save();

      lead.leadStatus = i === 0 ? 'Replied' : 'Contacted';
      lead.outreachStatus = i === 0 ? 'Replied' : 'Email Sent';
      lead.lastContacted = new Date();
      await lead.save();
    }
  }

  // 9. Seed Follow-ups
  const today = new Date();
  await FollowUp.create({
    leadId: createdLeads[0]._id,
    assignedUser: salesUser._id,
    dueDate: today,
    title: `Send container FOB Hamburg price quotation to Dr. Klaus Becker`,
    notes: `Dr. Klaus Becker expressed high interest in DIN spec valves. Follow up with formal quote document.`,
    status: 'Pending',
    priority: 'High',
  });

  // 10. Seed Activity Log
  await ActivityLog.create([
    {
      user: adminUser._id,
      userName: adminUser.name,
      userRole: adminUser.role,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      details: 'ExportFlow system initialized with standard industrial export configuration.',
    },
  ]);

  logger.info('✅ Seed database populated inline successfully!');
};

export const runSeed = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await connectDB();
    await seedInline();
  } catch (error: any) {
    logger.error('Error during database seed:', error);
  } finally {
    await disconnectDB();
  }
};

if (require.main === module) {
  runSeed();
}
