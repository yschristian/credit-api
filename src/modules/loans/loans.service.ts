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

    // Get active loans amount
    const activeLoanAmount = await this.repository.getActiveLoansAmount(userId);

    // Calculate available loan balance
    const availableLoanBalance = Math.max(0, user.loanBalance - activeLoanAmount);

    // Check if user has any available loan balance
    if (user.loanBalance === 0) {
      throw new BadRequestException(
        "You need to make deposits first. You can borrow 50% of your net savings (deposits - withdrawals)."
      );
    }

    // Check eligibility
    if (availableLoanBalance === 0) {
      throw new BadRequestException(
        "You have reached your maximum loan limit. Please repay existing loans or make more deposits."
      );
    }

    if (data.loanAmount > availableLoanBalance) {
      throw new BadRequestException(
        `Maximum available loan amount is RWF ${availableLoanBalance.toLocaleString()}. You currently have RWF ${activeLoanAmount.toLocaleString()} in active loans out of your RWF ${user.loanBalance.toLocaleString()} loan capacity.`
      );
    }

    // Minimum loan amount check
    if (data.loanAmount < 50) {
      throw new BadRequestException("Minimum loan amount is RWF 50");
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

  // Get user to update their loan balance
  const user = await this.usersRepository.findById(loan.userId);
  if (!user) {
    throw new NotFoundException("User not found");
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

  // Update loan status
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

  // ✅ IMPORTANT: Deduct approved loan from user's available loan balance
  // This ensures accurate tracking of remaining borrowing capacity
  const newLoanBalance = user.loanBalance - loan.loanAmount;
  
  await this.usersRepository.update(loan.userId, {
    loanBalance: Math.max(0, newLoanBalance), // Prevent negative values
  });

  console.log(`✅ User loan balance updated: ${user.loanBalance} → ${newLoanBalance}`);

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

    // Get active loans amount (remaining balance of all active loans)
    const activeLoanAmount = await this.repository.getActiveLoansAmount(userId);

    // User is eligible if they have available loan balance
    const eligible = user.loanBalance > 0;

    // Generate helpful reason message
    let reason: string | undefined;
    let recommendation: string | undefined;
    console.log("user.loanBalance",user.loanBalance)
    if (!eligible) {
      if (activeLoanAmount >= user.loanBalance) {
        reason = "You have reached your maximum loan limit.";
        recommendation = "Please repay your existing loans or make more deposits to increase your loan capacity.";
      } else if (user.loanBalance === 0) {
        reason = "You don't have any loan balance available.";
        recommendation = "Make deposits to build your loan capacity. You can borrow 50% of your net savings (deposits - withdrawals).";
      }
    }

    return {
      eligible,
      currentBalance: user.balance,
      totalDeposits: user.totalDeposits,
      totalWithdrawals: user.totalWithdrawals,
      netSavings: user.totalDeposits - user.totalWithdrawals,
      maxLoanBalance: user.loanBalance,
      activeLoanAmount,
      availableLoanBalance:  user.loanBalance,
      loanUtilizationPercentage: user.loanBalance > 0
        ? Math.round((activeLoanAmount / user.loanBalance) * 100)
        : 0,
      reason,
      recommendation,
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