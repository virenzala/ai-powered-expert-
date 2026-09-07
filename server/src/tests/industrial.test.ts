import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { industrialCalculatorService } from '../services/industrialCalculator.service';
import { rfqParserService } from '../services/rfqParser.service';
import { aiService } from '../services/ai/ai.service';

describe('Industrial Export Outreach Suite Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    // Register test admin user to get auth token
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Industrial Admin',
      email: 'industrial_admin@exportflow.com',
      password: 'password123',
    });

    if (res.body && res.body.token) {
      authToken = res.body.token;
    } else {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'industrial_admin@exportflow.com',
        password: 'password123',
      });
      authToken = loginRes.body.token;
    }
  });

  describe('Industrial Calculator Service Unit Tests', () => {
    test('calculateLandedCost should correctly compute FOB and CIF pricing and container load', () => {
      const result = industrialCalculatorService.calculateLandedCost({
        basePricePerUnitUSD: 150,
        quantity: 100,
        unitWeightKg: 15,
        incoterm: 'CIF',
        destinationPort: 'Port of Rotterdam',
      });

      expect(result.quantity).toBe(100);
      expect(result.exwSubtotalUSD).toBe(15000);
      expect(result.fobTotalUSD).toBeGreaterThan(15000);
      expect(result.cifTotalUSD).toBeGreaterThan(result.fobTotalUSD);
      expect(result.estimatedTransitDays).toBe(24);
      expect(result.containerDetails.recommendedContainer).toBeDefined();
    });

    test('getHsCatalog should return industrial HS codes', () => {
      const catalog = industrialCalculatorService.getHsCatalog();
      expect(catalog.length).toBeGreaterThan(0);
      expect(catalog[0].code).toBeDefined();
      expect(catalog[0].primaryStandards).toBeDefined();
    });
  });

  describe('RFQ Parser Service Unit Tests', () => {
    test('parseRfqText should extract specs from raw pump tender text', () => {
      const rawText = `Requirement: 20 pcs of Submersible Slurry Pumps for mining plant. Need FOB Houston quote by next Friday. High pressure 75kW rating required.`;
      const result = rfqParserService.parseRfqText(rawText);

      expect(result.category).toContain('Pumps');
      expect(result.quantity).toBe(20);
      expect(result.destinationPort).toContain('Houston');
      expect(result.preferredIncoterm).toBe('FOB');
      expect(result.draftQuoteResponse.subject).toContain('Submersible Slurry Pump');
    });
  });

  describe('AI Role-based Personalization Service Tests', () => {
    test('personalizeEmail should apply Engineering persona copy', async () => {
      const result = await aiService.personalizeEmail({
        lead: {
          companyName: 'Bavaria Motors',
          contactName: 'Hans Schmidt',
          jobTitle: 'Lead Design Engineer',
          country: 'Germany',
          industry: 'Industrial Machinery',
          roleCategory: 'Engineering',
          preferredIncoterms: 'CIF',
          targetPort: 'Hamburg Port',
          hsCode: '8481.80.10',
        },
        template: {
          subject: 'Supply of {{product_name}} for {{company_name}}',
          body: 'Hello {{contact_name}},\n\nWe would like to introduce our company.',
        },
        productName: 'Gate Valves',
      });

      expect(result.subject).toContain('Bavaria Motors');
      expect(result.body).toContain('ASME B16.34');
      expect(result.rolePersonaApplied).toBe('Engineering');
    });
  });

  describe('Industrial API REST Endpoint Tests', () => {
    test('GET /api/industrial/hs-codes should return 200 and catalog', async () => {
      const res = await request(app)
        .get('/api/industrial/hs-codes')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('POST /api/industrial/calculate-quote should calculate landed cost', async () => {
      const res = await request(app)
        .post('/api/industrial/calculate-quote')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          basePricePerUnitUSD: 220,
          quantity: 50,
          unitWeightKg: 25,
          incoterm: 'CIF',
          destinationPort: 'Port of Rotterdam',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.calculation.cifTotalUSD).toBeGreaterThan(11000);
    });

    test('POST /api/industrial/parse-rfq should return parsed quote response', async () => {
      const res = await request(app)
        .post('/api/industrial/parse-rfq')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rawText: 'Looking for supplier of 500 units of Hydraulic Fittings, CIF Hamburg, ASME B16.5 compliant.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.productName).toBeDefined();
    });
  });
});
