import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load env vars from root .env or server .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional().default('mongodb://localhost:27017/exportflow'),
  JWT_SECRET: z.string().default('exportflow_super_secret_jwt_key_2026_industrial_b2b_app'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional().default('http://localhost:5000/api/gmail/oauth/callback'),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['mock', 'gemini', 'openai']).default('mock'),
  EMAIL_VALIDATION_API_KEY: z.string().optional(),
  EMAIL_VALIDATION_PROVIDER: z.enum(['mock', 'hunter', 'zerobounce']).default('mock'),
  REDIS_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
