import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { seedUsers, seedCompanies, seedLeads, seedTemplates } from './seedData';
dotenv.config();

export async function seedSupabaseData() {
  const host = process.env.SUPABASE_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com';
  const port = parseInt(process.env.SUPABASE_PORT || '5432', 10);
  const database = process.env.SUPABASE_DB || 'postgres';
  const user = process.env.SUPABASE_USER || 'postgres.fizgzsyswipsjbffamve';
  const password = process.env.SUPABASE_PASSWORD;

  if (!password) {
    console.error('❌ SUPABASE_PASSWORD missing in server/.env');
    return;
  }

  console.log(`Connecting to Supabase PostgreSQL for seeding data...`);
  const client = new Client({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('⚡ Connected to Supabase PostgreSQL!');

    console.log('Populating initial B2B export seed data into Supabase tables...');

    // 1. Seed Users
    const userMap: Record<string, string> = {};
    for (const u of seedUsers) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(u.password, salt);
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id, role;`,
        [u.name, u.email.toLowerCase(), hash, u.role]
      );
      userMap[res.rows[0].role] = res.rows[0].id;
    }

    // 2. Seed Organization
    await client.query(
      `INSERT INTO organizations (name, export_products, target_markets, daily_email_limit)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING;`,
      [
        'Apex Industrial Exports',
        ['Industrial Valves & Actuators', 'Submersible Slurry Pumps', 'High Voltage Transformers'],
        ['Germany', 'USA', 'UAE', 'Japan', 'Brazil'],
        100,
      ]
    );

    // 3. Seed Companies
    const companyMap: Record<string, string> = {};
    for (const c of seedCompanies) {
      const res = await client.query(
        `INSERT INTO companies (company_name, website, country, industry, product_interest, description, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (company_name) DO UPDATE SET website = EXCLUDED.website
         RETURNING id, company_name;`,
        [c.companyName, c.website, c.country, c.industry, c.productInterest, c.description, c.source]
      );
      companyMap[res.rows[0].company_name] = res.rows[0].id;
    }

    // 4. Seed Buyer Leads
    const salesUserId = userMap['Sales'];
    for (const l of seedLeads) {
      const companyId = companyMap[l.companyName];
      await client.query(
        `INSERT INTO leads (
          company_name, contact_name, job_title, email, phone, website, country, industry,
          product_interest, buyer_type, company_description, company_id, assigned_user,
          lead_status, validation_status, ai_score, ai_classification, outreach_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (email) DO NOTHING;`,
        [
          l.companyName,
          l.contactName,
          l.jobTitle,
          l.email.toLowerCase(),
          l.phone,
          l.website,
          l.country,
          l.industry,
          l.productInterest,
          l.buyerType,
          l.companyDescription,
          companyId,
          salesUserId,
          'Valid',
          'Valid',
          l.aiScore || 85,
          l.aiClassification || 'High Priority Buyer',
          'Not Contacted',
        ]
      );
    }

    // 5. Seed Email Templates
    const managerUserId = userMap['Manager'];
    for (const t of seedTemplates) {
      await client.query(
        `INSERT INTO email_templates (name, subject, body_template, product_category, target_buyer_type, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING;`,
        [t.name, t.subject, (t as any).body || (t as any).bodyTemplate, (t as any).product || (t as any).productCategory, (t as any).buyerType || (t as any).targetBuyerType, managerUserId]
      );
    }

    console.log('✅ Supabase B2B Seed Data Populated Successfully!');
  } catch (err: any) {
    console.error('❌ Supabase Seeding Error:', err.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  seedSupabaseData();
}
