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
import { PaginationService } from '../common/pagination/pagination.service';
import { PaginationQuery } from '../common/pagination/pagination.types';
import { createSlug } from '../utils';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

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

    // Générer un slug unique à partir du titre
    let slug = createSlug(createPostDto.title);
    let slugExists = await this.prisma.post.findUnique({
      where: { slug },
    });

    // Si le slug existe déjà, ajouter un suffixe numérique
    if (slugExists) {
      let counter = 1;
      let newSlug = `${slug}-${counter}`;
      while (await this.prisma.post.findUnique({ where: { slug: newSlug } })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        slug,
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
   * Récupérer tous les posts avec pagination (public)
   */
  async findAll(query: PaginationQuery) {
    const posts = await this.paginationService.paginate(
      this.prisma.post,
      query,
      {
        searchFields: ['title', 'content'],
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
        orderBy: { createdAt: 'desc' },
      },
    );

    return {
      data: posts,
      message: 'Posts récupérés avec succès',
    };
  }

  /**
   * Récupérer un post par slug (public)
   */
  async findBySlug(slug: string): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
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
      throw new NotFoundException(`Post avec le slug ${slug} introuvable`);
    }

    return new PostEntity(post);
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
   * Récupérer les posts par catégorie avec pagination (public)
   */
  async findByCategory(categoryId: string, query: PaginationQuery) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const result = await this.paginationService.paginate(
      this.prisma.post,
      query,
      {
        where: {
          categoryId,
          published: true,
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
        orderBy: { createdAt: 'desc' },
      },
    );

    return {
      statusCode: 200,
      data: {
        items: result.items.map((post) => new PostEntity(post)),
        meta: result.meta,
      },
      message: `Posts de la catégorie ${category.name} récupérés avec succès`,
    };
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

    // Si le titre change, générer un nouveau slug
    const updateData: any = { ...updatePostDto };
    if (updatePostDto.title && updatePostDto.title !== post.title) {
      let slug = createSlug(updatePostDto.title);
      let slugExists = await this.prisma.post.findUnique({
        where: { slug },
      });

      // Si le slug existe déjà (et ce n'est pas le post actuel), ajouter un suffixe numérique
      if (slugExists && slugExists.id !== id) {
        let counter = 1;
        let newSlug = `${slug}-${counter}`;
        while (
          await this.prisma.post.findUnique({ where: { slug: newSlug } })
        ) {
          counter++;
          newSlug = `${slug}-${counter}`;
        }
        slug = newSlug;
      }
      updateData.slug = slug;
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updateData,
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
