import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z
  .object({
    firstName:       z.string().min(1, 'First name is required').max(50),
    lastName:        z.string().min(1, 'Last name is required').max(50),
    email:           z.string().email('Invalid email address'),
    password:        passwordSchema,
    confirmPassword: z.string(),
    agreeTerms:      z.boolean().refine((v) => v === true, 'You must agree to terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createPostSchema = z.object({
  content:    z.string().min(1, 'Post cannot be empty').max(2000),
  imageUrl:   z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export const createCommentSchema = z.object({
  content:  z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

export type RegisterInput    = z.infer<typeof registerSchema>;
export type LoginInput       = z.infer<typeof loginSchema>;
export type CreatePostInput  = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
