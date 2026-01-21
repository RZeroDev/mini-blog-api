import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostEntity } from './entities/post.entity';
import { PaginationService } from '../common/pagination/pagination.service';
import { PaginationQuery } from '../common/pagination/pagination.types';
import { createSlug } from '../utils';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
    @Inject(forwardRef(() => LogsService))
    private logsService: LogsService,
  ) {}

  /**
   * Obtenir les statistiques du dashboard
   */
  async getStats() {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalViews,
    ] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { published: true } }),
      this.prisma.post.count({ where: { published: false } }),
      this.prisma.category.count(),
      this.prisma.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalViews: totalViews._sum.views || 0,
    };
  }

  /**
   * Incrémenter les vues d'un post
   */
  async incrementViews(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post avec l'ID ${id} introuvable`);
    }

    // Incrémenter les vues
    await this.prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Vue enregistrée',
      views: (post.views || 0) + 1,
    };
  }

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
    const slugExists = await this.prisma.post.findUnique({
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

    // Logger la création
    try {
      await this.logsService.create({
        action: 'CREATE',
        entity: 'POST',
        entityId: post.id,
        userId,
        userName: `${post.user.firstName} ${post.user.lastName}`,
        details: JSON.stringify({
          title: post.title,
          slug: post.slug,
          published: post.published,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la création du log:', error);
    }

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
   * Récupérer les posts par catégorie (public) - Avec pagination
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
      },
    );

    return {
      statusCode: 200,
      data: {
        items: result.items.map((post: any) => new PostEntity(post)),
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
      const slugExists = await this.prisma.post.findUnique({
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

    // Logger la modification
    try {
      await this.logsService.create({
        action: 'UPDATE',
        entity: 'POST',
        entityId: updatedPost.id,
        userId,
        userName: `${updatedPost.user.firstName} ${updatedPost.user.lastName}`,
        details: JSON.stringify({
          title: updatedPost.title,
          slug: updatedPost.slug,
          published: updatedPost.published,
          changes: updatePostDto,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la création du log:', error);
    }

    return new PostEntity(updatedPost);
  }

  /**
   * Supprimer un post (admin uniquement)
   */
  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
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

    // Logger la suppression
    try {
      await this.logsService.create({
        action: 'DELETE',
        entity: 'POST',
        entityId: id,
        userId,
        details: JSON.stringify({
          title: post.title,
          slug: post.slug,
        }),
      });
    } catch (error) {
      console.error('Erreur lors de la création du log:', error);
    }
  }
}
