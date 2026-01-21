import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Créer un nouveau post (admin uniquement)
   */
  async create(
    createPostDto: CreatePostDto,
    userId: string,
  ): Promise<PostEntity> {
    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: createPostDto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Catégorie introuvable');
    }

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        content: createPostDto.content,
        userId,
        categoryId: createPostDto.categoryId,
        published: createPostDto.published ?? false,
        ...(createPostDto.image && { image: createPostDto.image }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picture: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    return new PostEntity(post);
  }

  /**
   * Récupérer tous les posts (public)
   */
  async findAll(): Promise<PostEntity[]> {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picture: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    return posts.map((post) => new PostEntity(post));
  }

  /**
   * Récupérer un post par ID (public)
   */
  async findOne(id: string): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picture: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    return new PostEntity(post);
  }

  /**
   * Récupérer les posts par catégorie (public)
   */
  async findByCategory(categoryId: string): Promise<PostEntity[]> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const posts = await this.prisma.post.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picture: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    return posts.map((post) => new PostEntity(post));
  }

  /**
   * Mettre à jour un post (admin uniquement)
   */
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    userRole: string,
  ): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    // Seul l'admin peut modifier
    if (userRole !== 'admin') {
      throw new ForbiddenException(
        'Vous n\'avez pas les permissions pour modifier ce post',
      );
    }

    // Vérifier que la catégorie existe si elle est fournie
    if (updatePostDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updatePostDto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Catégorie introuvable');
      }
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            picture: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    return new PostEntity(updatedPost);
  }

  /**
   * Supprimer un post (admin uniquement)
   */
  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    // Seul l'admin peut supprimer
    if (userRole !== 'admin') {
      throw new ForbiddenException(
        'Vous n\'avez pas les permissions pour supprimer ce post',
      );
    }

    await this.prisma.post.delete({
      where: { id },
    });
  }
}
