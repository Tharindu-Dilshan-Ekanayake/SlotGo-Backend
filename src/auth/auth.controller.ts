import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary:
      'Register a user and return JWT token. The first registered user becomes admin.',
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: {
          id: 1,
          name: 'Counter User',
          email: 'counter@example.com',
          role: 'counter',
          createdAt: '2026-05-17T00:00:00.000Z',
          updatedAt: '2026-05-17T00:00:00.000Z',
        },
      },
    },
  })
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and return JWT token' })
  @ApiOkResponse({
    schema: {
      example: {
        accessToken: 'jwt-token',
        user: {
          id: 1,
          name: 'Counter User',
          email: 'counter@example.com',
          role: 'counter',
          createdAt: '2026-05-17T00:00:00.000Z',
          updatedAt: '2026-05-17T00:00:00.000Z',
        },
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
