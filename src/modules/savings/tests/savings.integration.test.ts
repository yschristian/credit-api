import request from 'supertest';
import app from '../../../app';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../utils/bcrypt.util';
import { generateAccessToken } from '../../../utils/jwt.util';

const prisma = new PrismaClient();

describe('Savings API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await hashPassword('password123');
    const user = await prisma.user.create({
      data: {
        email: 'savings-test@example.com',
        name: 'Savings Test User',
        phone: '+250788999888',
        password: hashedPassword,
        balance: 1000,
        totalDeposits: 5000,
        totalWithdrawals: 4000,
        loanBalance: 500,
        role: 'CUSTOMER',
        status: true,
      },
    });

    userId = user.id;

    // Generate auth token
    authToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.savings.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  // Deposit Tests
  describe('POST /api/savings/deposit', () => {
    it('should successfully process a deposit', async () => {
      const response = await request(app)
        .post('/api/savings/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 500,
          method: 'Mobile Money',
          reference: 'MTN-TEST-123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transaction).toBeDefined();
      expect(response.body.data.transaction.amount).toBe(500);
      expect(response.body.data.newBalance).toBe(1500);
      expect(response.body.data.newLoanBalance).toBe(750);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/savings/deposit')
        .send({
          amount: 500,
          method: 'Cash',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid amount', async () => {
      const response = await request(app)
        .post('/api/savings/deposit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: -100,
          method: 'Cash',
        });

      expect(response.status).toBe(400);
    });
  });

  // Transactions Tests
  describe('GET /api/savings/transactions', () => {
    it('should return user transactions', async () => {
      const response = await request(app)
        .get('/api/savings/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toBeDefined();
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/savings/transactions?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  //  Stats Tests
  describe('GET /api/savings/stats', () => {
    it('should return transaction statistics', async () => {
      const response = await request(app)
        .get('/api/savings/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalDeposits).toBeDefined();
      expect(response.body.data.totalWithdrawals).toBeDefined();
      expect(response.body.data.depositsCount).toBeDefined();
      expect(response.body.data.withdrawalsCount).toBeDefined();
    });
  });
});

