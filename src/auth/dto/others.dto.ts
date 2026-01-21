import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailVerificationDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Code OTP de vérification' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Nouveau mot de passe' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class CheckResetPasswordDto {
  @ApiProperty({ description: 'Code OTP de réinitialisation' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ description: "Email de l'utilisateur" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

}
