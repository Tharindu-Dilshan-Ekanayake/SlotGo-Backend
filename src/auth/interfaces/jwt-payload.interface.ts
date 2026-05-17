import { UserRoleType } from '../../users/entities/user-role-type.enum';

export interface JwtPayload {
  email: string;
  name: string;
  role: UserRoleType;
  sub: number;
}
