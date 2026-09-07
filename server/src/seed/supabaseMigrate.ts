import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export async function runSupabaseMigration(dbPassword?: string) {
  const host = process.env.SUPABASE_HOST || 'aws-0-ap-northeast-2.pooler.supabase.com';
  const port = parseInt(process.env.SUPABASE_PORT || '5432', 10);
  const database = process.env.SUPABASE_DB || 'postgres';
  const user = process.env.SUPABASE_USER || 'postgres.fizgzsyswipsjbffamve';
  const password = dbPassword || process.env.SUPABASE_PASSWORD || process.env.DATABASE_PASSWORD;

  if (!password) {
    console.log('⚠️ Please set SUPABASE_PASSWORD in server/.env or pass it as an argument.');
    console.log(`Connection target: postgres://${user}:****@${host}:${port}/${database}`);
    return;
  }

  console.log(`Connecting to Supabase PostgreSQL at ${host}:${port}/${database}...`);
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
    console.log('⚡ Connected successfully to Supabase PostgreSQL Database!');

    const sqlPath = path.resolve(__dirname, '../config/schema.supabase.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing DDL Schema Migration (tables, indexes, enums, RLS)...');
    await client.query(sqlScript);
    console.log('✅ Supabase PostgreSQL Schema Migration Completed Successfully!');
  } catch (err: any) {
    console.error('❌ Supabase Migration Error:', err.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  const pwd = process.argv[2];
  runSupabaseMigration(pwd);
}
