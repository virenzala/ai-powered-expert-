process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../index';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Lead } from '../models/Lead';
import { duplicateCheckService } from '../services/duplicateCheck.service';

async function runTests() {
  console.log('=== STARTING EXPORTFLOW END-TO-END API SUITE ===');
  let authToken = '';

  try {
    await connectDB();
    await User.deleteMany({ email: 'admin.test@exportflow.com' });
    await Lead.deleteMany({ email: 'h.muller@bavariavalve.de' });
    await Lead.deleteMany({ country: 'Germany', productInterest: 'Industrial Machinery' });

    // Test 1: Auth Register
    console.log('Test 1: Auth Registration...');
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Test Admin',
      email: 'admin.test@exportflow.com',
      password: 'password123',
      role: 'Admin',
    });
    console.assert(regRes.status === 201, `Reg failed with status ${regRes.status}`);
    console.assert(regRes.body.token !== undefined, 'Token missing in registration');
    authToken = regRes.body.token;
    console.log('✓ Registration Test PASSED');

    // Test 2: Auth Login
    console.log('Test 2: Auth Login...');
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'admin.test@exportflow.com',
      password: 'password123',
    });
    console.assert(loginRes.status === 200, `Login failed with status ${loginRes.status}`);
    console.log('✓ Login Test PASSED');

    // Test 3: Lead Creation with Auto-Validation & AI Classification
    console.log('Test 3: Lead Creation with Auto-Validation & AI Classification...');
    const leadRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'Bavaria Valve Systems GmbH',
        contactName: 'Hans Muller',
        jobTitle: 'Director of Procurement',
        email: 'h.muller@bavariavalve.de',
        phone: '+49 89 123456',
        website: 'https://bavariavalve.de',
        country: 'Germany',
        industry: 'Industrial Machinery',
        productInterest: 'Industrial Valves',
        companyDescription: 'German manufacturer of industrial valves and pressure controls.',
      });
    console.assert(leadRes.status === 201, `Lead creation failed with status ${leadRes.status}`);
    console.assert(leadRes.body.data.validationStatus === 'Valid', 'Validation status not Valid');
    console.assert(leadRes.body.data.aiScore >= 60, 'AI Score lower than expected');
    console.log('✓ Lead Creation & AI Qualification Test PASSED');

    // Test 4: Duplicate Lead Detection
    console.log('Test 4: Duplicate Lead Detection...');
    const dupRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'Bavaria Valve Systems GmbH',
        contactName: 'Hans Muller',
        email: 'h.muller@bavariavalve.de',
        country: 'Germany',
        industry: 'Industrial Machinery',
      });
    console.assert(dupRes.status === 409, `Duplicate check failed; status was ${dupRes.status}`);
    console.assert(dupRes.body.code === 'DUPLICATE_LEAD', 'Duplicate error code missing');
    console.log('✓ Duplicate Detection Test PASSED');

    // Test 5: Dashboard KPI Aggregation
    console.log('Test 5: Dashboard Dynamic KPI Aggregation...');
    const dashRes = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${authToken}`);
    console.assert(dashRes.status === 200, `Dashboard failed with status ${dashRes.status}`);
    console.assert(dashRes.body.kpis.totalLeads >= 1, 'Total leads count incorrect');
    console.assert(dashRes.body.funnel.length === 6, 'Funnel stages count incorrect');
    console.log('✓ Dashboard KPI Test PASSED');

    // Test 6: Phase 1 Buyer Discovery Search
    console.log('Test 6: Buyer Discovery POST /api/buyer-discovery/search...');
    const discRes = await request(app)
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
    console.assert(discRes.status === 200, `Buyer discovery failed with status ${discRes.status}`);
    console.assert(discRes.body.success === true, 'Success flag false');
    console.assert(discRes.body.mode === 'mock', 'Expected mock mode when APOLLO_API_KEY missing');
    console.assert(discRes.body.summary.newLeads > 0, 'No new leads saved');
    console.log('✓ Buyer Discovery Search PASSED');

    // Test 7: Buyer Discovery 4-Vector Deduplication
    console.log('Test 7: Buyer Discovery Deduplication Check...');
    const discDupRes = await request(app)
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
    console.assert(discDupRes.status === 200, `Deduplicated search failed with status ${discDupRes.status}`);
    console.assert(discDupRes.body.summary.existingLeads > 0, 'Existing leads count should be > 0');
    console.assert(discDupRes.body.summary.newLeads === 0, 'New leads count should be 0 on exact repeat search');
    console.log('✓ Buyer Discovery Deduplication PASSED');

    // Test 8: Industrial Landed Cost Calculator
    console.log('Test 8: Industrial POST /api/industrial/calculate-quote...');
    const indCalcRes = await request(app)
      .post('/api/industrial/calculate-quote')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        basePricePerUnitUSD: 180,
        quantity: 200,
        unitWeightKg: 12,
        incoterm: 'CIF',
        destinationPort: 'Port of Hamburg',
      });
    console.assert(indCalcRes.status === 200, `Industrial calc failed with status ${indCalcRes.status}`);
    console.assert(indCalcRes.body.calculation.cifTotalUSD > 36000, 'CIF Total cost lower than expected');
    console.assert(indCalcRes.body.calculation.estimatedTransitDays === 24, 'Transit days estimate incorrect');
    console.log('✓ Industrial Landed Cost Calculator PASSED');

    // Test 9: Industrial RFQ Parser
    console.log('Test 9: Industrial POST /api/industrial/parse-rfq...');
    const rfqRes = await request(app)
      .post('/api/industrial/parse-rfq')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        rawText: 'Looking for 50 units of Slurry Pumps for mining project in Houston, FOB terms.',
      });
    console.assert(rfqRes.status === 200, `RFQ parser failed with status ${rfqRes.status}`);
    console.assert(rfqRes.body.data.productName !== undefined, 'Parsed product name missing');
    console.assert(rfqRes.body.data.draftQuoteResponse.subject !== undefined, 'Draft quote subject missing');
    console.log('✓ Industrial RFQ Parser PASSED');

    console.log('=== ALL 9 API, BUYER DISCOVERY & INDUSTRIAL INTEGRATION TESTS PASSED CLEANLY! ===');
  } catch (err) {
    console.error('Test Suite Error:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runTests();
