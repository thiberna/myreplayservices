import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../emails/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    EmailModule,
    forwardRef(() => AuthModule), 
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService], 
})
export class UsersModule {}
