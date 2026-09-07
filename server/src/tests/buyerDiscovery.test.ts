import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { duplicateCheckService } from '../services/duplicateCheck.service';
import { mockBuyerDiscoveryProvider } from '../services/buyerDiscovery/mock.provider';

describe('Phase 1 — Buyer Discovery Module Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({ email: 'discovery.tester@exportflow.com' });
    await Lead.deleteMany({ country: 'Germany', productInterest: 'Industrial Machinery' });

    // Create test user and obtain auth token
    const res = await request(app).post('/api/auth/register').send({
      name: 'Discovery Tester',
      email: 'discovery.tester@exportflow.com',
      password: 'password123',
      role: 'Admin',
    });
    authToken = res.body.token;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('1. Buyer Discovery Request Validation — Should return 400 when missing required fields', async () => {
    const res = await request(app)
      .post('/api/buyer-discovery/search')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        product: '', // Empty product
        country: 'Germany',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('2. Mock Provider — Should generate realistic B2B buyer records in mock mode', async () => {
    const mockResults = await mockBuyerDiscoveryProvider.searchBuyers({
      product: 'Industrial Machinery',
      country: 'Germany',
      industry: 'Industrial Equipment',
      buyerType: 'Importer',
      contactRole: 'Procurement Manager',
    });

    expect(mockResults.length).toBeGreaterThan(0);
    expect(mockResults[0].companyName).toContain('Industrial');
    expect(mockResults[0].email).toContain('@');
    expect(mockResults[0].country).toBe('Germany');
  });

  it('3. Provider Normalization & New Lead Creation — Should discover and save new leads to MongoDB', async () => {
    const res = await request(app)
      .post('/api/buyer-discovery/search')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        product: 'Industrial Machinery',
        country: 'Germany',
        industry: 'Industrial Equipment',
        buyerType: 'Importer',
        contactRole: 'Procurement Manager',
        keywords: 'industrial machinery importer',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBe('mock');
    expect(res.body.summary.totalFound).toBeGreaterThan(0);
    expect(res.body.summary.newLeads).toBeGreaterThan(0);
    expect(res.body.leads.length).toBe(res.body.summary.totalFound);

    // Verify DB persistence
    const savedLeads = await Lead.find({ country: 'Germany', productInterest: 'Industrial Machinery' });
    expect(savedLeads.length).toBe(res.body.summary.newLeads);
  });

  it('4. Duplicate Detection (4-Vector Rules) — Should detect existing leads on second discovery run', async () => {
    const res = await request(app)
      .post('/api/buyer-discovery/search')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        product: 'Industrial Machinery',
        country: 'Germany',
        industry: 'Industrial Equipment',
        buyerType: 'Importer',
        contactRole: 'Procurement Manager',
        keywords: 'industrial machinery importer',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.existingLeads).toBeGreaterThan(0);
    expect(res.body.summary.newLeads).toBe(0);

    const existingItem = res.body.leads.find((l: any) => l.existing === true);
    expect(existingItem).toBeDefined();
    expect(existingItem.existing).toBe(true);
  });

  it('5. 4-Vector Duplicate Engine — Should flag duplicates by ProviderId, Email, Domain, and Company+Contact', async () => {
    // 5.1 Provider ID match
    const dup1 = await duplicateCheckService.checkLead({
      externalProvider: 'mock',
      externalProviderId: 'mock_lead_germany_1',
    });
    expect(dup1.isDuplicate).toBe(true);

    // 5.2 Email match
    const dup2 = await duplicateCheckService.checkLead({
      email: 'm.weber@germany-machinery-mock.de',
    });
    expect(dup2.isDuplicate).toBe(true);

    // 5.3 Domain match
    const dup3 = await duplicateCheckService.checkLead({
      website: 'https://germany-machinery-mock.de/page',
    });
    expect(dup3.isDuplicate).toBe(true);

    // 5.4 Company + Contact match
    const dup4 = await duplicateCheckService.checkLead({
      companyName: 'Rheinland Industrial Machinery GmbH',
      contactName: 'Dr. Markus Weber',
    });
    expect(dup4.isDuplicate).toBe(true);
  });
});
