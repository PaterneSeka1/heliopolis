import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Observable } from 'rxjs';
import type { AuthUser } from '../types/auth-user.js';
import { isAuthUser } from '../types/auth-user.js';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = AuthUser | null>(_err: unknown, user: unknown): TUser {
    return (isAuthUser(user) ? user : null) as TUser;
  }
}
