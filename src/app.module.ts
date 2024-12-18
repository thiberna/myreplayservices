import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './emails/email.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule, EmailModule, AuthModule], 
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
