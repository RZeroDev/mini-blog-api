import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from 'src/users/entities/user.entity';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/profile.dto';
import { deleteImage, uploadImage } from 'src/utils/image-upload.util';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      message: 'Profil récupéré avec succès',
      data: plainToInstance(UserEntity, user),
    };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      include: {
        role: true,
      },
      data: updateProfileDto,
    });

    return {
      message: 'Profil mis à jour avec succès',
      data: plainToInstance(UserEntity, updatedUser),
    };
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Mot de passe mis à jour avec succès',
    };
  }

  async uploadImage(id: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    try {
      const result = await uploadImage(file, {
        fileNamePrefix: 'profile',
        directory: 'uploads/profile',
      });

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          picture: result.relativePath,
        },
        include: {
          role: true,
        },
      });

      if (user.picture) {
        await deleteImage(user.picture);
      }
      
      return {
        message: 'Image uploadée avec succès',
        data: plainToInstance(UserEntity, updatedUser),
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }
}
