import { Pool } from 'pg';
import dotenv from 'dotenv';
import { 
  DB_POOL_MAX_CONNECTIONS, 
  DB_POOL_IDLE_TIMEOUT, 
  DB_POOL_CONNECTION_TIMEOUT,
  DB_SLOW_QUERY_THRESHOLD
} from '../utils/constants';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: DB_POOL_MAX_CONNECTIONS,
  idleTimeoutMillis: DB_POOL_IDLE_TIMEOUT,
  connectionTimeoutMillis: DB_POOL_CONNECTION_TIMEOUT,
});

// Log query performance chỉ trong development
const isDev = process.env.NODE_ENV === 'development';

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    
    if (isDev) {
      const duration = Date.now() - start;
      if (duration > DB_SLOW_QUERY_THRESHOLD) {
        console.log('⚠️  Slow query detected:', { text: text.substring(0, 80), duration, rows: res.rowCount });
      }
    }
    
    return res;
  } catch (error: any) {
    console.error('❌ Database query error:', {
      query: text.substring(0, 100),
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

