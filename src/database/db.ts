import { Pool } from 'pg';
import dotenv from 'dotenv';
import { DB_CONFIG } from '../config';
import { logger } from '../utils/logger';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: DB_CONFIG.POOL.MAX,
  idleTimeoutMillis: DB_CONFIG.POOL.IDLE_TIMEOUT,
  connectionTimeoutMillis: DB_CONFIG.POOL.CONNECTION_TIMEOUT,
});

// Log query performance chỉ trong development
const isDev = process.env.NODE_ENV === 'development';

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    
    if (isDev) {
      const duration = Date.now() - start;
      if (duration > DB_CONFIG.QUERY.SLOW_QUERY_THRESHOLD) {
        logger.warn(`Slow query detected (${duration}ms)`, { 
          query: text.substring(0, 80), 
          rows: res.rowCount 
        });
      }
    }
    
    return res;
  } catch (error: any) {
    logger.error('Database query error', {
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

