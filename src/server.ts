import app from "./app";
import { config } from "./config/env";
import prisma from "./config/database";
import {
  startLoanBalanceUpdateJob,
  startOverdueLoanCheckJob,
} from "./jobs/loanBalance.cron";

const PORT = config.port;

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Environment: ${config.nodeEnv}`);
    });

    startLoanBalanceUpdateJob();
    startOverdueLoanCheckJob();
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
