import { applyDecorators, SetMetadata } from '@nestjs/common';
import { DefaultActions } from '@prisma/client';

export const RequirePermission = (
  permissions: DefaultActions | Array<DefaultActions>,
) => {
  const authorizedPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];
  return applyDecorators(
    SetMetadata('permissions', {
      permissions: authorizedPermissions,
    }),
  );
};
