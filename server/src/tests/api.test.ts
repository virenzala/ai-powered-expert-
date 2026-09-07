import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Lead } from '../models/Lead';

describe('ExportFlow Full-Stack API Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await Lead.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('1. Auth — Should register an Admin user and return JWT token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Admin',
      email: 'admin.test@exportflow.com',
      password: 'password123',
      role: 'Admin',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('Admin');
    authToken = res.body.token;
  });

  it('2. Auth — Should login user with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin.test@exportflow.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('3. Leads — Should create a lead with auto validation & AI classification', async () => {
    const res = await request(app)
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

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.companyName).toBe('Bavaria Valve Systems GmbH');
    expect(res.body.data.validationStatus).toBe('Valid');
    expect(res.body.data.aiClassification).toBeDefined();
    expect(res.body.data.aiScore).toBeGreaterThan(60);
  });

  it('4. Leads — Should detect duplicate lead on email match', async () => {
    const res = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        companyName: 'Bavaria Valve Systems GmbH',
        contactName: 'Hans Muller',
        email: 'h.muller@bavariavalve.de',
        country: 'Germany',
        industry: 'Industrial Machinery',
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_LEAD');
  });

  it('5. Dashboard — Should return dynamic KPI summary stats', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.kpis.totalLeads).toBeGreaterThanOrEqual(1);
    expect(res.body.funnel.length).toBe(6);
  });
});
