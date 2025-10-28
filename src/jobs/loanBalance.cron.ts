import cron from "node-cron";
import prisma from "../config/database";
import { CONSTANTS } from "../common/constants";

/**
 * Cron job to update loan balance for all users
 * Runs every day at midnight
 * Formula: loanBalance = (totalDeposits - totalWithdrawals) * LOAN_TO_DEPOSIT_RATIO
 */
export function startLoanBalanceUpdateJob() {
  cron.schedule("0 0 * * *", async () => {
    console.log("🔄 Running loan balance update job...");

    try {
      const users = await prisma.user.findMany({
        where: { status: true },
      });

      let updatedCount = 0;

      for (const user of users) {
        const newLoanBalance =
          (user.totalDeposits - user.totalWithdrawals) *
          CONSTANTS.LOAN_TO_DEPOSIT_RATIO;

        if (newLoanBalance !== user.loanBalance) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loanBalance: newLoanBalance },
          });

          updatedCount++;
          console.log(
            `✅ Updated loan balance for ${user.email}: RWF ${newLoanBalance.toLocaleString()}`
          );
        }
      }

      console.log(
        `✅ Loan balance update job completed! Updated ${updatedCount} users.`
      );
    } catch (error) {
      console.error("❌ Error in loan balance update job:", error);
    }
  });

  console.log("⏰ Loan balance update cron job started (runs daily at midnight)");
}

/**
 * Cron job to check overdue loans
 * Runs every day at 1 AM
 */
export function startOverdueLoanCheckJob() {
  cron.schedule("0 1 * * *", async () => {
    console.log("🔄 Checking for overdue loans...");

    try {
      const now = new Date();

      const overdueLoans = await prisma.loan.findMany({
        where: {
          status: "ACTIVE",
          nextPaymentDate: {
            lt: now,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (overdueLoans.length > 0) {
        console.log(`⚠️ Found ${overdueLoans.length} overdue loans`);

        for (const loan of overdueLoans) {
          // You can add email notifications here
          console.log(
            `⚠️ Overdue loan: ${loan.user.name} (${loan.user.email}) - Loan ID: ${loan.id}`
          );

          // Optionally update loan status to DEFAULTED after certain days
          const daysSinceOverdue = Math.floor(
            (now.getTime() - loan.nextPaymentDate!.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceOverdue > 30) {
            await prisma.loan.update({
              where: { id: loan.id },
              data: { status: "DEFAULTED" },
            });
            console.log(`❌ Marked loan ${loan.id} as DEFAULTED`);
          }
        }
      } else {
        console.log("✅ No overdue loans found");
      }
    } catch (error) {
      console.error("❌ Error checking overdue loans:", error);
    }
  });

  console.log("⏰ Overdue loan check cron job started (runs daily at 1 AM)");
}