import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRoleType } from '../users/entities/user-role-type.enum';
import { PublicUser, UsersService } from '../users/users.service';

type AuthResponse = {
  accessToken: string;
  user: PublicUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<AuthResponse> {
    const isFirstUser = (await this.usersService.count()) === 0;
    const user = await this.usersService.create({
      ...registerUserDto,
      role: isFirstUser ? UserRoleType.ADMIN : UserRoleType.COUNTER,
    });

    return {
      accessToken: await this.signToken(user),
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user || !(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const publicUser = this.usersService.toPublicUser(user);

    return {
      accessToken: await this.signToken(publicUser),
      user: publicUser,
    };
  }

  private signToken(user: PublicUser): Promise<string> {
    const payload: JwtPayload = {
      email: user.email,
      name: user.name,
      role: user.role,
      sub: user.id,
    };

    return this.jwtService.signAsync(payload);
  }
}
