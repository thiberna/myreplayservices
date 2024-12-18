import { Controller, Post, Body, BadRequestException, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
              private readonly authService: AuthService
  ) {}

  // 1. Solicitar código de verificação por email
  @Post('request-code')
  async requestVerificationCode(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('O email é obrigatório.');
    }
    return this.usersService.requestVerificationCode(email);
  }

  // 2. Validar código e cadastrar username e senha
  @Post('verify-code')
  async verifyCodeAndSetCredentials(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    if (!email || !code || !username || !password) {
      throw new BadRequestException('Todos os campos são obrigatórios.');
    }
    return this.usersService.verifyCodeAndSetCredentials(email, code, username, password);
  }

  // 3. Login com email e senha
  @Post('login')
  @Roles('USER')
  async login(@Body('email') email: string, @Body('password') password: string) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.generateToken(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: { id: string; email: string; role: string }) {
    return user; // Retorna os dados do usuário autenticado
  }
  
}
