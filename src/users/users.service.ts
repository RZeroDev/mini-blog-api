import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailersService } from 'src/mailers/mailers.service';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { User } from '@prisma/client';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailersService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }


    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: {
          connect: {
            id: createUserDto.role,
          },
        },
      },
    });

    await this.mailerService.sendUserCreatedEmail(
      createUserDto.email,
      createUserDto.firstName,
      createUserDto.lastName,
      generatedPassword,
    );

    return {
      message: 'Utilisateur créé avec succès',
    };
  }

  async findAll(query: PaginationQuery) {
    const users = await this.paginationService.paginate<User>(
      this.prisma.user,
      query,
      {
        include: {
          role: true,
        },
      },
    );
    return {
      data: users,
      message: 'Utilisateurs récupérés avec succès',
    };
  }

  async findOne(id: string): Promise<{
    code: number;
    message: string;
    user: Omit<UserEntity, 'password'>;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
          posts: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur non trouvé`);
    }

    return {
      code: 200,
      message: 'Utilisateur récupéré avec succès',
      user: user as Omit<UserEntity, 'password'>,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur non trouvé`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        role: {
          connect: {
            id: updateUserDto.role,
          },
        },
      },
    });

    return {
      message: 'Utilisateur mis à jour avec succès',
    };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
