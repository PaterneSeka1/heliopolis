import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithAuthUser } from '../types/auth-user.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuthUser>();
    return request.user;
  },
);
