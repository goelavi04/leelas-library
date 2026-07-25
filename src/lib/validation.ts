import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.");

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(200),
  email: emailSchema,
  password: passwordSchema,
  adminCode: z.string().trim().min(1, "Enter the admin code.").max(200),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null));

export const bookSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(300),
  author: z.string().trim().min(1, "Enter an author.").max(300),
  genre: optionalText(100),
  isbn: optionalText(50),
  shelfLocation: optionalText(100),
  notes: optionalText(2000),
});

export const checkoutSchema = z.object({
  bookId: z.string().uuid(),
  memberId: z.string().uuid("Choose a member."),
  dueDate: z.string().min(1, "Choose a due date."),
});

export const memberSchema = z.object({
  fullName: z.string().trim().min(1, "Enter a name.").max(200),
  email: optionalText(200),
  phone: optionalText(50),
  notes: optionalText(2000),
});

export const zeroResultQuerySchema = z.string().trim().min(1).max(200);
