import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.");

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1, "Enter your name.").max(200),
    email: emailSchema,
    password: passwordSchema,
    accountType: z.enum(["user", "admin"]),
    adminCode: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.accountType === "admin" && !data.adminCode) {
      ctx.addIssue({ code: "custom", path: ["adminCode"], message: "Enter the admin code." });
    }
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

export const checkoutSchema = z
  .object({
    bookId: z.string().uuid(),
    borrowerType: z.enum(["registered", "guest"]),
    borrowerUserId: z.string().uuid().optional().or(z.literal("")),
    borrowerName: z.string().trim().max(200).optional().or(z.literal("")),
    borrowerContact: z.string().trim().max(200).optional().or(z.literal("")),
    dueDate: z.string().min(1, "Choose a due date."),
  })
  .superRefine((data, ctx) => {
    if (data.borrowerType === "registered" && !data.borrowerUserId) {
      ctx.addIssue({
        code: "custom",
        path: ["borrowerUserId"],
        message: "Choose a registered borrower.",
      });
    }
    if (data.borrowerType === "guest" && !data.borrowerName) {
      ctx.addIssue({
        code: "custom",
        path: ["borrowerName"],
        message: "Enter the borrower's name.",
      });
    }
  });

export const zeroResultQuerySchema = z.string().trim().min(1).max(200);
