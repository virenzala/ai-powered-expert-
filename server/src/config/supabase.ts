import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL || 'https://fizgzsyswipsjbffamve.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      logger.warn(`Supabase connection notice: ${error.message}`);
      return false;
    }
    logger.info('⚡ Connected to Supabase Cloud PostgreSQL.');
    return true;
  } catch (err: any) {
    logger.warn(`Supabase client initialized (Waiting for valid SUPABASE_URL in .env).`);
    return false;
  }
};
