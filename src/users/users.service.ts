import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../emails/email.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // 1. Solicitar código de verificação
  async requestVerificationCode(email: string) {
    const code = randomInt(100000, 999999).toString(); // Gera um código de 6 dígitos

    // Upsert (atualiza o código se o usuário já existir ou cria um novo registro)
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { verificationCode: code },
      create: { email, verificationCode: code },
    });

    // Enviar email com o código de verificação
    await this.emailService.sendVerificationEmail(email, code);

    return { message: 'Código de verificação enviado com sucesso.' };
  }

  // 2. Validar o código e definir username e senha
  async verifyCodeAndSetCredentials(
    email: string,
    code: string,
    username: string,
    password: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Verificar se o código é válido
    if (!user || user.verificationCode !== code) {
      throw new BadRequestException('Código inválido ou expirado.');
    }

    // Verificar se o username já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('Username já está em uso.');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar os dados do usuário
    await this.prisma.user.update({
      where: { email },
      data: {
        username,
        password: hashedPassword,
        isVerified: true,
        verificationCode: null, // Limpar o código após validação
      },
    });

    return { message: 'Cadastro concluído com sucesso.' };
  }

  // 3. Login do usuário
  async authenticateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
  
    if (!user || !user.isVerified) {
      throw new NotFoundException('Usuário não encontrado ou não verificado.');
    }
  
    // Comparar a senha
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new BadRequestException('Credenciais inválidas.');
    }
  
    // Retorne o id, email e role
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
