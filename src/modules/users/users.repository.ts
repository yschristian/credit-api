import prisma from "../../config/database";
import { CreateUserInput, UpdateUserInput } from "./users.dto";

export class UsersRepository {
  async create(data: CreateUserInput & { password: string }) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        totalDeposits: true,
        loanBalance: true,
        role: true,
        status: true,
        joinDate: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        totalDeposits: true,
        totalWithdrawals: true,
        loanBalance: true,
        role: true,
        status: true,
        joinDate: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(skip: number, take: number) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          balance: true,
          loanBalance: true,
          role: true,
          status: true,
          joinDate: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }

  async update(id: string, data: UpdateUserInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        balance: true,
        loanBalance: true,
        role: true,
        status: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async updateBalance(
    id: string,
    balance: number,
    totalDeposits: number,
    totalWithdrawals: number,
    loanBalance: number
  ) {
    return prisma.user.update({
      where: { id },
      data: {
        balance,
        totalDeposits,
        totalWithdrawals,
        loanBalance,
      },
    });
  }
}