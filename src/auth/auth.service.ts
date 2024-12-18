import { Inject, Injectable, forwardRef, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) 
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Valida o usuário e retorna o token JWT
  async validateUser(email: string, password: string) {
    const user = await this.usersService.authenticateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  // Gera o token JWT
  async generateToken(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
