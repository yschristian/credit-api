import { z } from "zod";

export const CreateUserDto = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+250\d{9}$/, "Invalid phone number format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const UpdateUserDto = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^\+250\d{9}$/).optional(),
  loanBalance : z.number().min(0).optional(),
  status: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;