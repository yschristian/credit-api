import { z } from "zod";

export const ApplyLoanDto = z.object({
  loanAmount: z.number().positive("Loan amount must be positive"),
  duration: z.number().min(1).max(24, "Duration must be between 1 and 24 months"),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
});

export const ApproveLoanDto = z.object({
  interestRate: z.number().positive("Interest rate must be positive"),
  approvalNotes: z.string().optional(),
});

export const RejectLoanDto = z.object({
  rejectionReason: z.string().min(10, "Rejection reason must be at least 10 characters"),
});

export type ApplyLoanInput = z.infer<typeof ApplyLoanDto>;
export type ApproveLoanInput = z.infer<typeof ApproveLoanDto>;
export type RejectLoanInput = z.infer<typeof RejectLoanDto>;