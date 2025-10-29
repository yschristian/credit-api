import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

// Clean up after all tests
afterAll(async () => {
  // Clean up test data
  await prisma.paymentHistory.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.savings.deleteMany();
  await prisma.user.deleteMany();
  
  // Disconnect
  await prisma.$disconnect();
});

// Export for use in tests
export { prisma };