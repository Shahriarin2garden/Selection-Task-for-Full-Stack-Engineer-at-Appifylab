  import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

const protectedRoutes = ['/feed'];
const authRoutes = ['/login', '/register'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuth && session) {
    return NextResponse.redirect(new URL('/feed', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/feed/:path*', '/login', '/register'],
};
