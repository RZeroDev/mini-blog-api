import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categories')
@ApiTags('04. Gestion des catégories de biens')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['name', 'image'],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une catégorie de bien' })
  @ApiOkResponse({ type: ResponseEntity })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.create(createCategoryDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les catégories de biens' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiPagination()
  async findAll(@Query() query: PaginationQuery) {
    return this.categoriesService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: 'Récupérer toutes les catégories de biens sans pagination' })
  @ApiOkResponse({ type: ResponseEntity })
  findAllWithoutPagination() {
    return this.categoriesService.findAllWithoutPagination();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie de bien' })
  @ApiOkResponse({ type: ResponseEntity })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['name']
    },
  })
  @ApiOperation({ summary: 'Mettre à jour une catégorie de bien' })
  @ApiOkResponse({ type: ResponseEntity })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, file);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une catégorie de bien' })
  @ApiOkResponse({ type: ResponseEntity })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
