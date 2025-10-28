import prisma from "../../config/database";

export class PaymentsRepository {
  async create(data: {
    userId: string;
    loanId: string;
    amount: number;
    status: string;
    reference?: string;
  }) {
    return prisma.paymentHistory.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loan: {
          select: {
            id: true,
            loanAmount: true,
            remainingBalance: true,
            status: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.paymentHistory.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        loan: true,
      },
    });
  }

  async findUserPayments(userId: string, skip: number, take: number) {
    const [payments, total] = await Promise.all([
      prisma.paymentHistory.findMany({
        where: { userId },
        skip,
        take,
        include: {
          loan: {
            select: {
              id: true,
              loanAmount: true,
              purpose: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.paymentHistory.count({ where: { userId } }),
    ]);

    return { payments, total };
  }

  async findLoanPayments(loanId: string) {
    return prisma.paymentHistory.findMany({
      where: { loanId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllPayments(skip: number, take: number) {
    const [payments, total] = await Promise.all([
      prisma.paymentHistory.findMany({
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          loan: {
            select: {
              id: true,
              loanAmount: true,
              purpose: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.paymentHistory.count(),
    ]);

    return { payments, total };
  }
}