import type { Request } from 'express';
import type { User } from '../../../generated/prisma/client.js';

export type AuthUser = User;

export type RequestWithAuthUser = Request & {
  user?: AuthUser;
};

export type RequestWithCookies<Name extends string = string> = Request & {
  cookies?: Partial<Record<Name, string>>;
};

export function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as { id?: unknown }).id === 'string'
  );
}
