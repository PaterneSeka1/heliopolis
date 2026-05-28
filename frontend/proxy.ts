import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_PREFIX: Record<string, string> = {
  ADMIN:      '/dashboard/admin',
  REGION:     '/dashboard/region',
  GUIDE:      '/dashboard/guide',
  SENTINELLE: '/dashboard/guide',
  GARDIEN:    '/dashboard/gardien',
};

const ROLE_HOME: Record<string, string> = {
  ADMIN:      '/dashboard/admin',
  REGION:     '/dashboard/region',
  GUIDE:      '/dashboard/guide',
  SENTINELLE: '/dashboard/guide',
  GARDIEN:    '/dashboard/gardien',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const role = request.cookies.get('user_role')?.value;

  // Pas de cookie → AuthGuard prend le relais (redirige vers /activation)
  if (!role || !(role in ROLE_PREFIX)) {
    return NextResponse.next();
  }

  const allowedPrefix = ROLE_PREFIX[role];
  if (!pathname.startsWith(allowedPrefix)) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
