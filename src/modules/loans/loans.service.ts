import { LoansRepository } from "./loans.repository";
import { UsersRepository } from "../users/users.repository";
import { ApplyLoanInput, ApproveLoanInput, RejectLoanInput } from "./loans.dto";
import {
  BadRequestException,
  NotFoundException,
} from "../../common/exceptions";
import { CONSTANTS } from "../../common/constants";

export class LoansService {
  private repository: LoansRepository;
  private usersRepository: UsersRepository;

  constructor() {
    this.repository = new LoansRepository();
    this.usersRepository = new UsersRepository();
  }

  async applyForLoan(userId: string, data: ApplyLoanInput) {
    // Get user
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check minimum balance requirement
    if (user.balance < CONSTANTS.MIN_BALANCE_FOR_LOAN) {
      throw new BadRequestException(
        `Minimum balance of RWF ${CONSTANTS.MIN_BALANCE_FOR_LOAN.toLocaleString()} required to apply for a loan`
      );
    }

    // Get active loans amount
    const activeLoanAmount = await this.repository.getActiveLoansAmount(userId);

    // Calculate available loan balance
    const availableLoanBalance = Math.max(0, user.loanBalance - activeLoanAmount);

    // Check eligibility
    if (availableLoanBalance === 0) {
      throw new BadRequestException(
        "You have reached your maximum loan limit. Please repay existing loans or make more deposits."
      );
    }

    if (data.loanAmount > availableLoanBalance) {
      throw new BadRequestException(
        `Maximum available loan amount is RWF ${availableLoanBalance.toLocaleString()}`
      );
    }

    // Calculate interest rate based on duration
    const interestRate = this.calculateInterestRate(data.duration);

    // Calculate total amount with interest
    const totalAmount =
      data.loanAmount * (1 + (interestRate / 100) * (data.duration / 12));

    // Calculate monthly payment
    const monthlyPayment = totalAmount / data.duration;

    // Create loan application
    const loan = await this.repository.create({
      userId,
      loanAmount: data.loanAmount,
      interestRate,
      duration: data.duration,
      monthlyPayment,
      remainingBalance: totalAmount,
      purpose: data.purpose,
      status: "PENDING",
    });

    return loan;
  }

  async approveLoan(loanId: string, data: ApproveLoanInput) {
    // Get loan
    const loan = await this.repository.findById(loanId);
    if (!loan) {
      throw new NotFoundException("Loan not found");
    }

    if (loan.status !== "PENDING") {
      throw new BadRequestException("Only pending loans can be approved");
    }

    // Calculate dates
    const approvalDate = new Date();
    const disbursementDate = new Date();
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + loan.duration);

    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    // Recalculate with custom interest rate if provided
    let remainingBalance = loan.remainingBalance;
    let monthlyPayment = loan.monthlyPayment;

    if (data.interestRate && data.interestRate !== loan.interestRate) {
      const totalAmount =
        loan.loanAmount * (1 + (data.interestRate / 100) * (loan.duration / 12));
      remainingBalance = totalAmount;
      monthlyPayment = totalAmount / loan.duration;
    }

    // Update loan
    const updatedLoan = await this.repository.update(loanId, {
      status: "ACTIVE",
      interestRate: data.interestRate || loan.interestRate,
      remainingBalance,
      monthlyPayment,
      approvalDate,
      disbursementDate,
      dueDate,
      nextPaymentDate,
    });

    return updatedLoan;
  }

  async rejectLoan(loanId: string, data: RejectLoanInput) {
    // Get loan
    const loan = await this.repository.findById(loanId);
    if (!loan) {
      throw new NotFoundException("Loan not found");
    }

    if (loan.status !== "PENDING") {
      throw new BadRequestException("Only pending loans can be rejected");
    }

    // Update loan
    const updatedLoan = await this.repository.update(loanId, {
      status: "REJECTED",
    });

    return updatedLoan;
  }

  async getLoanById(loanId: string) {
    const loan = await this.repository.findById(loanId);
    if (!loan) {
      throw new NotFoundException("Loan not found");
    }
    return loan;
  }

  async getUserLoans(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const { loans, total } = await this.repository.findUserLoans(
      userId,
      skip,
      limit
    );

    return {
      loans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllLoans(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const { loans, total } = await this.repository.findAllLoans(
      skip,
      limit,
      status as any
    );

    return {
      loans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoanEligibility(userId: string) {
    // Get user
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get active loans amount
    const activeLoanAmount = await this.repository.getActiveLoansAmount(userId);

    // Calculate available loan balance
    const availableLoanBalance = Math.max(0, user.loanBalance - activeLoanAmount);

    // Check eligibility
    const eligible =
      user.balance >= CONSTANTS.MIN_BALANCE_FOR_LOAN &&
      availableLoanBalance > 0;

    let reason: string | undefined;
    if (!eligible) {
      if (user.balance < CONSTANTS.MIN_BALANCE_FOR_LOAN) {
        reason = `Minimum balance of RWF ${CONSTANTS.MIN_BALANCE_FOR_LOAN.toLocaleString()} required`;
      } else {
        reason = "No available loan balance. Repay existing loans or make more deposits.";
      }
    }

    return {
      eligible,
      currentBalance: user.balance,
      totalDeposits: user.totalDeposits,
      totalWithdrawals: user.totalWithdrawals,
      maxLoanBalance: user.loanBalance,
      activeLoanAmount,
      availableLoanBalance,
      minBalanceRequired: CONSTANTS.MIN_BALANCE_FOR_LOAN,
      reason,
    };
  }

  async getUserLoanStats(userId: string) {
    return this.repository.getUserLoanStats(userId);
  }

  private calculateInterestRate(duration: number): number {
    if (duration <= 3) return 15; // 15% for 3 months or less
    if (duration <= 6) return 12; // 12% for 4-6 months
    if (duration <= 12) return 10; // 10% for 7-12 months
    return 8; // 8% for more than 12 months
  }
}