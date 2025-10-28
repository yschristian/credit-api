import { SavingsRepository } from "./savings.repository";
import { UsersRepository } from "../users/users.repository";
import { DepositInput, WithdrawInput } from "./savings.dto";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { CONSTANTS } from "../../common/constants";
import { ref } from "process";

export class SavingsService {
  private repository: SavingsRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.repository = new SavingsRepository();
    this.usersRepository = new UsersRepository();
  }

  async deposit(userId: string, data: DepositInput) {
    // Get user
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const referenceId = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    // Create deposit transaction
    const transaction = await this.repository.createTransaction(
      userId,
      data.amount,
      data.paymentType,
      referenceId
    );

    // Calculate new values
    const newBalance = user.balance + data.amount;
    const newTotalDeposits = user.totalDeposits + data.amount;
    const newLoanBalance =
      (newTotalDeposits - user.totalWithdrawals) * CONSTANTS.LOAN_TO_DEPOSIT_RATIO;

    // Update user balance
    await this.usersRepository.updateBalance(
      userId,
      newBalance,
      newTotalDeposits,
      user.totalWithdrawals,
      newLoanBalance
    );

    return {
      transaction,
      newBalance,
      newLoanBalance,
      message: `Deposit successful! Your loan balance is now RWF ${newLoanBalance.toLocaleString()}`,
    };
  }

  async withdraw(userId: string, data: WithdrawInput) {
    // Get user
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check balance
    if (user.balance < data.amount) {
      throw new BadRequestException("Insufficient balance");
    }

    // Create withdrawal transaction
    const referenceId = `WITH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const transaction = await this.repository.createTransaction(
      userId,
      data.amount,
      referenceId,
      data.paymentType
    );

    // Calculate new values
    const newBalance = user.balance - data.amount;
    const newTotalWithdrawals = user.totalWithdrawals + data.amount;
    const newLoanBalance =
      (user.totalDeposits - newTotalWithdrawals) * CONSTANTS.LOAN_TO_DEPOSIT_RATIO;

    // Update user balance
    await this.usersRepository.updateBalance(
      userId,
      newBalance,
      user.totalDeposits,
      newTotalWithdrawals,
      newLoanBalance
    );

    return {
      transaction,
      newBalance,
      newLoanBalance,
      message: `Withdrawal successful! Your loan balance is now RWF ${newLoanBalance.toLocaleString()}`,
    };
  }

  async getTransactions(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { transactions, total } = await this.repository.getUserTransactions(
      userId,
      skip,
      limit
    );

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllTransactions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { transactions, total } = await this.repository.getAllTransactions(
      skip,
      limit
    );

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats(userId: string) {
    return this.repository.getTransactionStats(userId);
  }
}