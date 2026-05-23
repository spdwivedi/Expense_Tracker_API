import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../config/db.js';

describe('Expense Tracker API Integration Tests', () => {
  const uniqueId = Date.now();
  const testUser = {
    name: 'Integration Tester',
    email: `testuser_${uniqueId}@example.com`,
    password: 'SecurePassword123!'
  };

  let authToken = '';
  let targetCategoryId = '';
  let targetTransactionId = '';

  // Clean up test users before and after running test suites to ensure isolation
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('🛡️ Authentication & Authorization Flows', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe(testUser.email);
    });

    it('should authenticate user and return a signed JWT', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });

    it('should block unauthorized requests to protected endpoints', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
      // ✅ Updated to match your middleware's exact response string
      expect(res.body).toHaveProperty('error', 'Access token required'); 
    });

    it('should grant access to protected profile with a valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });
  });

  describe('🏷️ Category & Isolation Flows', () => {
    it('should retrieve a list containing global default categories', async () => {
      const res = await request(app)
        .get('/api/v1/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      // Save an available category ID for transaction testing
      if (res.body.length > 0) {
        targetCategoryId = res.body[0].id;
      }
    });
  });

  describe('💵 Transaction Operational Ledger Flows', () => {
    it('should create a new transaction record linked to the user', async () => {
      // Fallback check if categories list calculation was delayed
      if (!targetCategoryId) {
        const defaultCategory = await prisma.category.findFirst({ where: { isDefault: true } });
        targetCategoryId = defaultCategory!.id;
      }

      const payload = {
        amount: 450.50,
        type: 'EXPENSE',
        categoryId: targetCategoryId,
        date: new Date().toISOString(),
        note: 'Automated integration check entry'
      };

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(Number(res.body.amount)).toBe(450.50);
      targetTransactionId = res.body.id;
    });

    it('should fetch user transactions using pagination and filters', async () => {
      const res = await request(app)
        .get('/api/v1/transactions?page=1&limit=5&type=EXPENSE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('transactions');
      expect(res.body).toHaveProperty('meta');
      expect(Array.isArray(res.body.transactions)).toBe(true);
    });

    it('should erase the created transaction record cleanly', async () => {
      const res = await request(app)
        .delete(`/api/v1/transactions/${targetTransactionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Transaction deleted successfully');
    });
  });
});