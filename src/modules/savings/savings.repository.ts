import prisma from "../../config/database";

export class SavingsRepository {
  async createTransaction(
    userId: string,
    amount: number,
    paymentType: any,
    referenceId?: string
  ) {
    return prisma.savings.create({
      data: {
        userId,
        amount,
        paymentType,
        referenceId
      },
    });
  }

  async getUserTransactions(userId: string, skip: number, take: number) {
    const [transactions, total] = await Promise.all([
      prisma.savings.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.savings.count({ where: { userId } }),
    ]);

    return { transactions, total };
  }

  async getAllTransactions(skip: number, take: number) {
    const [transactions, total] = await Promise.all([
      prisma.savings.findMany({
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.savings.count(),
    ]);

    return { transactions, total };
  }

  async getTransactionStats(userId: string) {
    const deposits = await prisma.savings.aggregate({
      where: {
        userId,
        paymentType: "DEPOSIT",
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const withdrawals = await prisma.savings.aggregate({
      where: {
        userId,
        paymentType: "WITHDRAW",
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return {
      totalDeposits: deposits._sum.amount || 0,
      depositsCount: deposits._count,
      totalWithdrawals: withdrawals._sum.amount || 0,
      withdrawalsCount: withdrawals._count,
    };
  }
}