import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL is missing from process.env inside prisma.config.ts');
}

// Config
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});