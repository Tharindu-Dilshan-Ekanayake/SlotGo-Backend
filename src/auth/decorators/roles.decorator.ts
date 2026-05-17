import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '../../users/entities/user-role-type.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
