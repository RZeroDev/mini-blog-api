import { Body, Controller, Get, Patch, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiOperation, ApiOkResponse, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RequestWithUser } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/profile.dto';

@Controller('profile')
@ApiTags('02. Profile utilisateur')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'user', 'developer')
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiOkResponse({ type: ResponseEntity })
  async getProfile(@Req() req: RequestWithUser) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'user', 'developer')
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
  @ApiOkResponse({ type: ResponseEntity })
  async updateProfile(@Req() req: RequestWithUser, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, updateProfileDto);
  }


  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'user', 'developer')
  @ApiOperation({ summary: 'Mettre à jour le mot de passe utilisateur' })
  @ApiOkResponse({ type: ResponseEntity })
  async updatePassword(@Req() req: RequestWithUser, @Body() updatePasswordDto: UpdatePasswordDto) {
    return this.profileService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Patch('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Uploader une image de profil' })
  @ApiOkResponse({ type: ResponseEntity })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'user', 'developer')
   uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    if (!file) {
      throw new BadRequestException('Aucun fichier uploadé');
    }
    return this.profileService.uploadImage(req.user.id, file);
  }
}
