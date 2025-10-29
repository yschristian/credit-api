import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(" Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@creditjambo.com" },
    update: {},
    create: {
      email: "admin@creditjambo.com",
      name: "Admin User",
      phone: "+250788000000",
      password: adminPassword,
      role: "ADMIN",
      balance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      loanBalance: 0,
      status: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create sample customers
  const customers = [
    {
      email: "jean.uwimana@gmail.com",
      name: "Jean Uwimana",
      phone: "+250788123456",
      password: await bcrypt.hash("password123", 10),
    },
    {
      email: "marie.mukamana@gmail.com.com",
      name: "Marie Mukamana",
      phone: "+250788234567",
      password: await bcrypt.hash("password123", 10),
    },
  ];

  for (const customer of customers) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        ...customer,
        role: "CUSTOMER",
        balance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        loanBalance: 0,
        status: true,
      },
    });

    console.log("Customer created:", user.email);

    // Create sample deposits
    const depositAmount = Math.floor(Math.random() * 50000) + 10000;
    await prisma.savings.create({
      data: {
        userId: user.id,
        amount: depositAmount,
        paymentType: "DEPOSIT",
        referenceId: `DEP-${Date.now()}`,
      },
    });

    // Update user balance
    await prisma.user.update({
      where: { id: user.id },
      data: {
        balance: depositAmount,
        totalDeposits: depositAmount,
        loanBalance: depositAmount * 0.5,
      },
    });

    console.log(` Created deposit for ${user.name}: RWF ${depositAmount}`);
  }

  console.log(" Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(" Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });