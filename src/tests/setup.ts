import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  // await prisma.paymentHistory.deleteMany();
  // await prisma.loan.deleteMany();
  // await prisma.savings.deleteMany();
  // await prisma.user.deleteMany();
  
  // Disconnect
  // await prisma.$disconnect();
});

// Export for use in tests
export { prisma };