import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';

@Module({
  imports: [HttpModule], // Importa HttpModule apenas onde é necessário
  providers: [EmailService],
  exports: [EmailService], // Exporta para ser usado em outros módulos
})
export class EmailModule {}
