import { z } from "zod";

export const RegisterDto = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+250\d{9}$/, "Invalid phone number format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginDto = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password is required"),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenDto>;