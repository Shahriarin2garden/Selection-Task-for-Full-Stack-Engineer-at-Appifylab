'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
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
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { firstName, lastName, email, password } = validated.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ['Email already registered'] } };
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { firstName, lastName, email, password: hashed },
    select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
  });

  await createSession(user);
  redirect('/feed');
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = loginSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, firstName: true, lastName: true, email: true, avatar: true, password: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { errors: { _form: ['Invalid email or password'] } };
  }

  const { password: _, ...safeUser } = user;
  await createSession(safeUser);
  redirect('/feed');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
