import { z } from "zod";

export const MakePaymentDto = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  amount: z.number().positive("Amount must be positive"),
  reference: z.string().optional(),
});

export type MakePaymentInput = z.infer<typeof MakePaymentDto>;