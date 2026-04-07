'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  clearLoginFailures,
  isLoginRateLimited,
  recordLoginFailure,
} from '@/lib/login-rate-limit';
import { createSession, deleteSession } from '@/lib/session';
import { loginSchema, registerSchema } from '@/lib/validations';

export type AuthState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    agreeTerms?: string[];
    _form?: string[];
  };
  message?: string;
} | undefined;

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002'
  );
}

function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

export async function register(state: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    agreeTerms: formData.get('agreeTerms') === 'on',
  };

  const validated = registerSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { firstName, lastName, email, password } = validated.data;

  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashed },
      select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
    });

    await createSession(user);
    redirect('/feed');
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    if (isPrismaUniqueError(error)) {
      return { errors: { email: ['Email already registered'] } };
    }

    console.error('Registration failed:', error);
    return { errors: { _form: ['Unable to register right now. Please try again.'] } };
  }
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = loginSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors };
  }

  const { email, password } = validated.data;
  const hdrs = await headers();
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    'unknown';
  const rateLimitKey = `${email.toLowerCase()}|${ip}`;

  if (isLoginRateLimited(rateLimitKey)) {
    return {
      errors: {
        _form: ['Too many failed login attempts. Please wait 15 minutes and try again.'],
      },
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName: true, email: true, avatar: true, password: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      recordLoginFailure(rateLimitKey);
      return { errors: { _form: ['Invalid email or password'] } };
    }

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    };
    await createSession(safeUser);
    clearLoginFailures(rateLimitKey);
    redirect('/feed');
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    console.error('Login failed:', error);
    return { errors: { _form: ['Unable to log in right now. Please try again.'] } };
  }
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
