import { z } from "zod";

export const DepositDto = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentType: z.string().min(1, "Payment type is required").optional(),
  reference: z.string().optional(),
});

export const WithdrawDto = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentType: z.string().min(1, "Payment type is required"),
});

export type DepositInput = z.infer<typeof DepositDto>;
export type WithdrawInput = z.infer<typeof WithdrawDto>;