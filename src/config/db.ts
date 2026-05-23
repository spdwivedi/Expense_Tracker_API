import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is missing from environment variables');
}

// Pool
export const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Adapter
const adapter = new PrismaPg(pool);

// Client
const prisma = new PrismaClient({ adapter });

// Export
export default prisma;