import prisma from "../../config/database";
import { LoanStatus } from "@prisma/client";

export class LoansRepository {
  async create(data: {
    userId: string;
    loanAmount: number;
    interestRate: number;
    duration: number;
    monthlyPayment: number;
    remainingBalance: number;
    purpose: string;
    status: LoanStatus;
  }) {
    return prisma.loan.create({
      data,
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
    });
  }

  async findById(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            balance: true,
            loanBalance: true,
          },
        },
        paymentHistories: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async findUserLoans(userId: string, skip: number, take: number) {
    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.loan.count({ where: { userId } }),
    ]);

    return { loans, total };
  }

  async findAllLoans(skip: number, take: number, status?: LoanStatus) {
    const where = status ? { status } : {};

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
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
      prisma.loan.count({ where }),
    ]);

    return { loans, total };
  }

  async update(id: string, data: any) {
    return prisma.loan.update({
      where: { id },
      data,
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
  }

  async getActiveLoansAmount(userId: string) {
    const result = await prisma.loan.aggregate({
      where: {
        userId,
        status: { in: ["ACTIVE", "APPROVED"] },
      },
      _sum: {
        remainingBalance: true,
      },
    });

    return result._sum.remainingBalance || 0;
  }

  async getPendingLoansAmount(userId: string) {
  const result = await prisma.loan.aggregate({
    where: {
      userId,
      status: "PENDING",
    },
    _sum: {
      loanAmount: true,  
    },
  });

  return result._sum.loanAmount || 0;
}


  async getUserLoanStats(userId: string) {
    const activeLoans = await prisma.loan.count({
      where: { userId, status: "ACTIVE" },
    });

    const completedLoans = await prisma.loan.count({
      where: { userId, status: "COMPLETED" },
    });

    const totalBorrowed = await prisma.loan.aggregate({
      where: { userId },
      _sum: { loanAmount: true },
    });

    const totalPaid = await prisma.loan.aggregate({
      where: { userId },
      _sum: { amountPaid: true },
    });

    return {
      activeLoans,
      completedLoans,
      totalBorrowed: totalBorrowed._sum.loanAmount || 0,
      totalPaid: totalPaid._sum.amountPaid || 0,
    };
  }
}