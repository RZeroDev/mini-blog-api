import { Injectable } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as pug from 'pug';
import * as fs from 'fs';

@Injectable()
export class MailersService {
    private transporter: Transporter;

    constructor() {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'lyricsmevtr@gmail.com',
          pass: 'fsmu fpgf ffwv rxtp'
        },
      });
    }
  
    private async readTemplate(templateName: string): Promise<string> {
      const templatePath = path.join(process.cwd(), 'dist', 'mailers', 'templates', `${templateName}.template.pug`);
      return fs.promises.readFile(templatePath, 'utf8');
    }
  
    private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
      let result = template;
      for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      return result;
    }
  
    async sendOtpEmail(to: string, username: string, otp: string): Promise<void> {
      try {
        const template = await this.readTemplate('otp');
        const date = new Date().toLocaleDateString('fr-FR');
        const year = new Date().getFullYear().toString();
  
        const html = pug.render(template, {
          username,
          otp,
          date,
          year,
          purpose: 'vérification de votre email',
          title: 'Votre code OTP'
        });
  
        const mailOptions = {
          from: '"Verrou" <lyricsmevtr@gmail.com>',
          to,
          subject: 'Votre code OTP de vérification Verrou',
          html,
        };
  
        await this.transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error;
      }
    }
  
    async sendPasswordResetOtpEmail(to: string, username: string, otp: string): Promise<void> {
      try {
        const template = await this.readTemplate('otp');
        const date = new Date().toLocaleDateString('fr-FR');
        const year = new Date().getFullYear().toString();
  
        const html = pug.render(template, {
          username,
          otp,
          date,
          year,
          purpose: 'réinitialisation de votre mot de passe',
          title: 'Code de réinitialisation de mot de passe'
        });
  
        const mailOptions = {
          from: '"Verrou" <lyricsmevtr@gmail.com>',
          to,
          subject: 'Votre code de réinitialisation de mot de passe Verrou',
          html,
        };
  
        await this.transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw error;
      }
    }
  
    sendMail(to: string, subject: string, text: string) {
      const mailOptions = {
        from: '"Verrou" <lyricsmevtr@gmail.com>',
        to,
        subject,
        text,
      };
  
      return this.transporter.sendMail(mailOptions);
    }
  
    async sendUserCreatedEmail(to: string, firstName: string, lastName: string, password: string): Promise<void> {
      try {
        const template = await this.readTemplate('user-created');
        const html = pug.render(template, {
          firstName,
          lastName,
          email: to,
          password,
        });
        const mailOptions = {
          from: '"Verrou" <lyricsmevtr@gmail.com>',
          to,
          subject: 'Bienvenue sur Verrou !',
          html,
        };
        await this.transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de création utilisateur:', error);
        throw error;
      }
    }
}
