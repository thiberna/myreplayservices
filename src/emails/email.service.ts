import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar o transporte SMTP
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Configuração do servidor SMTP
      port: 587,              // Porta do servidor (TLS)
      secure: false,          // false para STARTTLS, true para SSL
      auth: {
        user: process.env.EMAIL_USER,     
        pass: process.env.EMAIL_PASS, 
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    // Carregar o arquivo HTML do email
    const templatePath = path.join(process.cwd(), 'src', 'templates', 'verification-email.html');
    const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Substituir o marcador {code} pelo código real
    const htmlContent = htmlTemplate.replace('{code}', code);

    const mailOptions = {
      from: `"MyReplays" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: 'Verificação de Email - MyReplays',
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return { success: true, message: 'Email enviado com sucesso!' };
    } catch (error) {
      console.error('Erro ao enviar email:', error.message);
      throw new Error('Erro ao enviar email');
    }
  }
}
