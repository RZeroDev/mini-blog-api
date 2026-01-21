import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckResetPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, SendEmailVerificationDto } from './dto/others.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailersService } from 'src/mailers/mailers.service';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/users/entities/user.entity';
import { generateUniquePseudo } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });
    if (existingUser) {
      throw new BadRequestException(
        'Un utilisateur existe déjà avec cet email',
      );
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const role = await this.prisma.role.findUnique({
      where: {
        name: 'client',
      },
    });

    if (!role) {
      throw new BadRequestException('Role non trouvé');
    }

    // Générer un pseudo unique pour l'utilisateur
    let pseudo = generateUniquePseudo();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Vérifier que le pseudo généré est unique
    while (!isUnique && attempts < maxAttempts) {
      const existingPseudo = await this.prisma.user.findFirst({
        where: { pseudo },
      });
      if (!existingPseudo) {
        isUnique = true;
      } else {
        pseudo = generateUniquePseudo();
        attempts++;
      }
    }

    await this.prisma.user.create({
      data: {
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        pseudo, // Ajouter le pseudo généré
        role: {
          connect: {
            id: role.id,
          },
        },
        password: hashedPassword,
      },
    });

    return {
      message: 'Compte créé avec succès',
      pseudo: pseudo, // Retourner le pseudo généré
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new BadRequestException(
        "Votre compte est bloqué merci de contacter l'administrateur",
      );
    }

    const expiresIn = 60 * 60 * 24 * 3; // 3 jours
    const accessToken = this.jwtService.sign(
      { userId: user.id },
      { expiresIn },
    );
    const expiredTokenAt = new Date(Date.now() + expiresIn * 1000);

    return {
      message: 'Connexion réussie',
      accessToken,
      expiredTokenAt,
      user: plainToInstance(UserEntity, user),
    };
  }

  
  async sendEmailForgotPassword(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: sendEmailVerificationDto.email },
    });

    if (!user) {
      throw new NotFoundException(
        `Aucun utilisateur trouvé avec l'email ${sendEmailVerificationDto.email}`,
      );
    }

    const canSend = await this.canSendEmail(user.id);
    if (!canSend) {
      throw new BadRequestException(
        'Veuillez attendre 1 minute et 30 secondes avant de demander un nouveau code',
      );
    }

    const otpCode = this.generateOtp();
    const expiredOtp = this.getOtpExpiration();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: otpCode,
        otpExpiresAt: expiredOtp,
        lastEmailSentAt: new Date(),
      },
    });
    const fullname = `${user.firstName} ${user.lastName}`;

    try {
      await this.mailerService.sendPasswordResetOtpEmail(
        user.email,
        fullname,
        otpCode,
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
    }

    return {
      message: 'Code de réinitialisation de mot de passe envoyé avec succès',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException(
        `Aucun utilisateur trouvé avec l'email ${resetPasswordDto.email}`,
      );
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }

  async checkResetPassword(checkResetPasswordDto: CheckResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: checkResetPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.otp !== checkResetPasswordDto.otp) {
      throw new BadRequestException('Code OTP invalide');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Code OTP expiré');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiresAt: null,
      },
    });

    return {
      message: 'Code vérifié avec succès',
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOtpExpiration(): Date {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10);
    return expiration;
  }

  private async canSendEmail(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastEmailSentAt: true },
    });

    if (!user?.lastEmailSentAt) return true;

    const timeSinceLastEmail =
      Date.now() - new Date(user.lastEmailSentAt).getTime();
    return timeSinceLastEmail >= 90000; // 1m30 en millisecondes
  }

}
