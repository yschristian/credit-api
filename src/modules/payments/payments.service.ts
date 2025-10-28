import { PaymentsRepository } from "./payments.repository";
import { LoansRepository } from "../loans/loans.repository";
import { MakePaymentInput } from "./payments.dto";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { UsersRepository } from "../users/users.repository";

export class PaymentsService {
  private repository: PaymentsRepository;
  private loansRepository: LoansRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.repository = new PaymentsRepository();
    this.loansRepository = new LoansRepository();
    this.usersRepository = new UsersRepository();
  }

 async makePayment(userId: string, data: MakePaymentInput) {
  // Get loan
  const loan = await this.loansRepository.findById(data.loanId);
  if (!loan) {
    throw new NotFoundException("Loan not found");
  }

  // Check if loan belongs to user
  if (loan.userId !== userId) {
    throw new BadRequestException("Unauthorized to make payment for this loan");
  }

  // Check if loan is active
  if (loan.status !== "ACTIVE") {
    throw new BadRequestException("Loan is not active");
  }

  // Check payment amount
  if (data.amount > loan.remainingBalance) {
    throw new BadRequestException(
      `Payment amount exceeds remaining balance of RWF ${loan.remainingBalance.toLocaleString()}`
    );
  }

  // Get user
  const user = await this.usersRepository.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const reference =  `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  // Create payment record
  const payment = await this.repository.create({
    userId,
    loanId: data.loanId,
    amount: data.amount,
    status: "COMPLETED",
    reference: reference,
  });

  // Update loan
  const newAmountPaid = loan.amountPaid + data.amount;
  const newRemainingBalance = Math.max(0, loan.remainingBalance - data.amount);
  const newStatus = newRemainingBalance === 0 ? "COMPLETED" : "ACTIVE";

  // Calculate next payment date (30 days from now)
  const nextPaymentDate =
    newStatus === "COMPLETED"
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await this.loansRepository.update(data.loanId, {
    amountPaid: newAmountPaid,
    remainingBalance: newRemainingBalance,
    status: newStatus,
    nextPaymentDate,
  });

  const amountToRestore = (data.amount / loan.loanAmount) * loan.loanAmount;
  const newUserLoanBalance = user.loanBalance + amountToRestore;

  await this.usersRepository.update(userId, {
    loanBalance: newUserLoanBalance,
  });

  console.log(`✅ User loan balance restored: ${user.loanBalance} → ${newUserLoanBalance}`);

  return {
    payment,
    message:
      newStatus === "COMPLETED"
        ? "Loan fully repaid! Congratulations! Your loan capacity has been restored."
        : `Payment successful! Remaining balance: RWF ${newRemainingBalance.toLocaleString()}`,
  };
}

  async getPaymentById(paymentId: string) {
    const payment = await this.repository.findById(paymentId);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return payment;
  }

  async getUserPayments(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { payments, total } = await this.repository.findUserPayments(
      userId,
      skip,
      limit
    );

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoanPayments(loanId: string) {
    return this.repository.findLoanPayments(loanId);
  }

  async getAllPayments(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { payments, total } = await this.repository.findAllPayments(
      skip,
      limit
    );

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}