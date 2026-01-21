import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckResetPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, SendEmailVerificationDto } from './dto/others.dto';
import { AuthEntity, RegisterEntity } from './entity/auth.entity';

@Controller('auth')
@ApiTags('01. Authentification & Authorization')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Inscription d'un utilisateur" })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  @ApiOkResponse({ type: RegisterEntity })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @ApiOperation({ summary: "Connexion d'un utilisateur" })
  @ApiBody({ type: LoginDto })
  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  
  @Post('forgot-password')
  @ApiOperation({ summary: "Envoi du code OTP pour réinitialisation du mot de passe" })
  @ApiOkResponse({
    description: 'Envoi du code OTP pour réinitialisation du mot de passe',
    type:RegisterEntity
  })
  sendEmailForgotPassword(
    @Body() sendEmailVerificationDto: SendEmailVerificationDto,
  ) {
    return this.authService.sendEmailForgotPassword(sendEmailVerificationDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: "Réinitialisation du mot de passe avec le code OTP" })
  @ApiOkResponse({
    description: 'Réinitialisation du mot de passe avec le code OTP',
    type:RegisterEntity
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('forgot-password/check-otp')
  @ApiOperation({ summary: "Réinitialisation du mot de passe avec le code OTP" })
  @ApiOkResponse({
    description: 'Réinitialisation du mot de passe avec le code OTP',
    type:RegisterEntity
  })
  checkResetPassword(@Body() checkResetPasswordDto: CheckResetPasswordDto) {
    return this.authService.checkResetPassword(checkResetPasswordDto);
  }
}
