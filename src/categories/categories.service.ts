import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { Category } from '@prisma/client';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { uploadImage } from 'src/utils/image-upload.util';
import { CategoriesGateway } from './categories.gateway';
import { createSlug } from 'src/utils';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly categoriesGateway: CategoriesGateway,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    file: Express.Multer.File,
  ) {
    const exists = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (exists) {
      throw new BadRequestException('Catégorie déjà existante');
    }
    try {
      const result = await uploadImage(file, {
        fileNamePrefix: 'category',
        directory: 'uploads/categories',
      });

      const createdCategorie = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug: createSlug(createCategoryDto.name),
          image: result.relativePath,
        },
      });

      return {
        data: createdCategorie,
        message: 'Catégorie créée avec succès',
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  async findAll(query: PaginationQuery) {
    const categories = await this.paginationService.paginate<Category>(
      this.prisma.category,
      query,
      {
        searchFields: ['name'],
        include: {
          posts: true,
        },
      },
    );

    return {
      data: categories,
      message: 'Catégories récupérées avec succès',
    };
  }

  async findAllWithoutPagination() {
    const categories = await this.prisma.category.findMany({
      orderBy: {
        name: 'desc',
      },
    });
    return {
      message: 'Catégories récupérées avec succès',
      data: categories,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      data: category,
      message: 'Catégorie récupérée avec succès',
    };
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file: Express.Multer.File,
  ) {
    const exists = await this.prisma.category.findFirst({
      where: {
        name: updateCategoryDto.name,
        id: { not: id },
      },
      include: {
        posts: true,
      },
    });

    if (exists) {
      throw new BadRequestException('Catégorie déjà existante');
    }

    try {
      const currentCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!currentCategory) {
        throw new NotFoundException('Catégorie non trouvée');
      }

      let imageUrl = currentCategory.image;

      if (file) {
        const result = await uploadImage(file, {
          fileNamePrefix: 'category',
          directory: 'uploads/categories',
        });
        imageUrl = result.relativePath;
      }

      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          image: imageUrl,
          slug: createSlug(updateCategoryDto.name ?? currentCategory.name),
        },
        include: {
          posts: true,
        },
      });

      this.categoriesGateway.emitCategoryUpdated(
        await this.findAllWithoutPagination(),
      );

      return {
        data: category,
        message: 'Catégorie mise à jour avec succès',
      };
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        posts: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }

    if (category.posts && category.posts.length > 0) {
      throw new BadRequestException(
        'Catégorie non supprimable, elle contient des posts enregistrés',
      );
    }

    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });

    this.categoriesGateway.emitCategoryUpdated(
      await this.findAllWithoutPagination(),
    );

    return {
      data: deletedCategory,
      message: 'Catégorie supprimée avec succès',
    };
  }
}
