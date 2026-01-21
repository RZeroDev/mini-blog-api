import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RequestWithUser } from 'src/users/entities/user.entity';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';

@Controller('assets')
@ApiTags('05. Gestion des biens')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un bien' })
  @ApiResponse({ type: ResponseEntity })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'invoices', maxCount: 5 },
    ]),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        createAssetDto: { type: 'object' },
        invoices: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
      required: ['createAssetDto', 'invoices', 'images'],
    },
  })
  create(
    @Body() createAssetDto: CreateAssetDto,
    @UploadedFiles()
    files: { images?: Express.Multer.File[]; invoices?: Express.Multer.File[] },
    @Req() req: RequestWithUser,
  ) {
    return this.assetsService.create(
      createAssetDto,
      files.invoices || [],
      files.images || [],
      req.user.id,
    );
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,secretary,developer')
  @ApiOperation({ summary: 'Récupérer tous les biens' })
  @ApiPagination()
  @ApiOkResponse({ type: ResponseEntity })
  findAll(@Query() query: PaginationQuery) {
    return this.assetsService.findAll(query);
  }

  @Get('all/user')
  @ApiOperation({ summary: "Récupérer tous les biens d'un utilisateur" })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @ApiPagination()
  findAllForUser(@Req() req: RequestWithUser, @Query() query: PaginationQuery, @Query('filter') filter: string, @Query('searchKey') searchKey: string) {
    return this.assetsService.findAllForUser(req.user.id, query, filter, searchKey);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Récupérer toutes les biens par catégorie' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiPagination()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,secretary,developer')
  findByCategory(@Param('id') id: string, @Query() query: PaginationQuery) {
    return this.assetsService.findByCategory(id, query);
  }

  @Get('users/categories/:id')
  @ApiOperation({
    summary: "Récupérer tous les biens par par catégorie de l'utilisateur",
  })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiPagination()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,secretary,developer')
  findByUserCategory(
    @Param('id') id: string,
    @Query() query: PaginationQuery,
    @Req() req: RequestWithUser,
  ) {
    return this.assetsService.findByUserCategory(id, query, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: "Details d'un bien" })
  @ApiOkResponse({ type: ResponseEntity })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un bien' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @Req() req: RequestWithUser,
  ) {
    return this.assetsService.update(id, updateAssetDto, req.user.id);
  }

  @Patch(':id/images')
  @ApiOperation({ summary: "Mettre à jour les images d'un bien" })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary' } },
        existingImages: {
          type: 'string',
          description: 'JSON string array of existing image URLs',
        },
      },
      required: ['existingImages'],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 10 }]))
  updateImages(
    @Param('id') id: string,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body() body: { existingImages?: string },
    @Req() req: RequestWithUser,
  ) {
    const images = files.images || [];
    const existingImages = body.existingImages
      ? JSON.parse(body.existingImages)
      : [];
    return this.assetsService.updateImages(
      id,
      images,
      existingImages,
      req.user.id,
    );
  }

  @Patch(':id/invoices')
  @ApiOperation({ summary: "Mettre à jour la facture d'un bien" })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invoices: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        existingInvoices: {
          type: 'string',
          description: 'JSON string array of existing invoice URLs',
        },
      },
      required: ['existingInvoices'],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'invoices', maxCount: 5 }]))
  updateInvoice(
    @Param('id') id: string,
    @UploadedFiles() files: { invoices?: Express.Multer.File[] },
    @Body() body: { existingInvoices?: string },
    @Req() req: RequestWithUser,
  ) {
    const invoices = files.invoices || [];
    const existingInvoices = body.existingInvoices
      ? JSON.parse(body.existingInvoices)
      : [];
    return this.assetsService.updateInvoice(
      id,
      invoices,
      existingInvoices,
      req.user.id,
    );
  }

  @Patch(':id/verify')
  @ApiOperation({
    summary: "Mettre à jour le statut de vérification d'un bien",
  })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,secretary,developer')
  updateStatus(@Param('id') id: string) {
    return this.assetsService.updateStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un bien' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('client')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.assetsService.remove(id, req.user.id);
  }

  @Get('search/:key')
  @ApiOperation({
    summary:
      'Rechercher des biens par IMEI, immatriculation, numéro moteur ou numéro de série',
  })
  @ApiOkResponse({ type: ResponseEntity })
  searchAssets(@Param('key') key: string) {
    return this.assetsService.thiefOrLostSearch(key);
  }
}
