import { z } from "zod";

// Mirrors POST /api/auth/login in docs/API.md.
export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").pipe(z.email("This does not look like an email")),
  password: z.string().min(1, "Enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;
