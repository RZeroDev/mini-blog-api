import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaginationQuery } from '../common/pagination/pagination.types';
import { ApiPagination } from '../common/pagination/pagination.swagger';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PostEntity } from './entities/post.entity';

@Controller('posts')
@ApiTags('05. Gestion des posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Créer un nouveau post (admin uniquement)
   * POST /posts
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau post (admin uniquement)' })
  @ApiCreatedResponse({
    description: 'Post créé avec succès',
    type: PostEntity,
  })
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (file) {
      createPostDto.image = file.filename;
    }
    // Convertir published en booléen si c'est une string
    if (typeof createPostDto.published === 'string') {
      createPostDto.published = createPostDto.published === 'true';
    }
    return this.postsService.create(createPostDto, req.user.id);
  }

  /**
   * Récupérer tous les posts avec pagination (public)
   * GET /posts
   */
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les posts avec pagination (public)' })
  @ApiOkResponse({
    description: 'Liste de tous les posts',
    type: [PostEntity],
  })
  @ApiPagination()
  findAll(@Query() query: PaginationQuery) {
    return this.postsService.findAll(query);
  }

  /**
   * Récupérer un post par ID (public)
   * GET /posts/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un post par son ID (public)' })
  @ApiParam({ name: 'id', description: 'ID du post' })
  @ApiOkResponse({
    description: 'Détails du post',
    type: PostEntity,
  })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  /**
   * Récupérer les posts par catégorie (public)
   * GET /posts/category/:categoryId
   */
  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Récupérer les posts par catégorie (public)' })
  @ApiParam({ name: 'categoryId', description: 'ID de la catégorie' })
  @ApiOkResponse({
    description: 'Liste des posts de la catégorie',
    type: [PostEntity],
  })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.postsService.findByCategory(categoryId);
  }

  /**
   * Mettre à jour un post (admin uniquement)
   * PATCH /posts/:id
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un post (admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du post à modifier' })
  @ApiOkResponse({
    description: 'Post mis à jour avec succès',
    type: PostEntity,
  })
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (file) {
      updatePostDto.image = file.filename;
    }
    // Convertir published en booléen si c'est une string
    if (typeof updatePostDto.published === 'string') {
      updatePostDto.published = updatePostDto.published === 'true';
    }
    return this.postsService.update(
      id,
      updatePostDto,
      req.user.id,
      req.user.role?.name,
    );
  }

  /**
   * Supprimer un post (admin uniquement)
   * DELETE /posts/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un post (admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID du post à supprimer' })
  @ApiNoContentResponse({ description: 'Post supprimé avec succès' })
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.id, req.user.role?.name);
  }
}
