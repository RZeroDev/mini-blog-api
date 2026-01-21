import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { uploadImage } from 'src/utils/image-upload.util';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { Asset, AssetStatus } from '@prisma/client';
import { AssetsGateway } from './assets.gateway';
import { PushNotificationService } from 'src/push-notification/push-notification.service';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
    private readonly assetsGateway: AssetsGateway, // Inject gateway
    private readonly push: PushNotificationService,
  ) {}

  async create(
    createAssetDto: CreateAssetDto,
    invoices: Express.Multer.File[],
    images: Express.Multer.File[],
    userId: string,
  ) {
    // const existingAsset = await this.prisma.asset.findUnique({
    //   where: {
    //     data: createAssetDto.data,
    //   },
    // });
    // if (existingAsset) {
    //   throw new BadRequestException(
    //     'Un bien avec ce numéro de série existe déjà',
    //   );
    // }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé');
    }
    if (user.assetRemaining <= 0) {
      throw new BadRequestException('Vous avez atteint le nombre maximum de biens');
    }

    const invoiceUrls: string[] = [];
    const imageUrls: string[] = [];

    try {
      if (invoices && invoices.length > 0) {
        for (const invoice of invoices) {
          const invoiceUrl = await uploadImage(invoice, {
            fileNamePrefix: 'invoice',
            directory: 'uploads/assets/invoices',
          });
          invoiceUrls.push(invoiceUrl.relativePath);
        }
      }

      if (images && images.length > 0) {
        for (const image of images) {
          const imageUpload = await uploadImage(image, {
            fileNamePrefix: 'image',
            directory: 'uploads/assets/images',
          });
          imageUrls.push(imageUpload.relativePath);
        }
      }

      const asset = await this.prisma.asset.create({
        data: {
          data: (createAssetDto.data ?? {}) as any,
          invoices: invoiceUrls,
          images: imageUrls,
          userId: userId,
          categoryId: createAssetDto.categoryId,
        },
      });
      
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { assetRemaining: { decrement: 1 } },
      });

      const userAssets = await this.paginationService.paginate<Asset>(
        this.prisma.asset,
        { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
        {
          where: { userId: userId },
          include: {
            category: true,
            alerte: true,
          },
        },
      );
      this.assetsGateway.emitAssetUpdated(userAssets, userId);

      return {
        data: asset,
        user: updatedUser,
        message: 'Bien créé avec succès',
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  async findAll(query: PaginationQuery) {
    const assets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      query,
      {
        searchFields: ['serialNumber', 'name', 'description', 'category.name'],
        include: {
          category: true,
          user: true,
          alerte: true,
          
        },
      },
    );
    return { data: assets, message: 'Liste des biens récuprer avec succès' };
  }

  async findByCategory(id: string, query: PaginationQuery) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }
    const assets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      query,
      {
        where: { categoryId: category.id },
        include: {
          category: true,
          user: true,
          alerte: true,
        },
      },
    );
    return {
      data: assets,
      message: 'Liste des biens par catégorie récupérée avec succès',
    };
  }

  async findByUserCategory(id: string, query: PaginationQuery, userId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Catégorie non trouvée');
    }
    const assets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      query,
      {
        where: { categoryId: category.id, userId },
        include: {
          category: true,
          alerte: true,
          user: true,
        },
      },
    );
    return {
      data: assets,
      message: 'Liste des biens par catégorie récupérée avec succès',
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        user: true,
        alerte: true,
      },
    });
    if (!asset) {
      throw new NotFoundException('Bien non trouvé');
    }
    return { data: asset, message: 'Bien récupéré avec succès' };
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new NotFoundException('Bien non trouvé');
    }
    if (asset.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions pour mettre à jour ce bien",
      );
    }
    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      include: {
        category: true,
        user: true,
        alerte: true,
      },
      data: {
        data: updateAssetDto.data as any,
        categoryId: updateAssetDto.categoryId,
        isVerified: false,
      },
    });
    const userAssets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      {
        where: { userId: userId },
        include: {
          category: true,
          alerte: true,
        },
      },
    );
    this.assetsGateway.emitAssetUpdated(userAssets, userId);
    return { data: updatedAsset, message: 'Bien mis à jour avec succès' };
  }

  async updateImages(
    id: string,
    images: Express.Multer.File[],
    existingImages: string[],
    userId: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new NotFoundException('Bien non trouvé');
    }
    if (asset.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions pour mettre à jour les images de ce bien",
      );
    }

    const newImageUrls: string[] = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const imageUpload = await uploadImage(image, {
          fileNamePrefix: 'image',
          directory: 'uploads/assets/images',
        });
        newImageUrls.push(imageUpload.relativePath);
      }
    }

    const allImageUrls = [...existingImages, ...newImageUrls];

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data: { images: allImageUrls },
      include: {
        category: true,
        user: true,
        alerte: true,
      },
    });
    const userAssets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      {
        where: { userId: userId },
        include: {
          category: true,
          alerte: true,
        },
      },
    );
    this.assetsGateway.emitAssetUpdated(userAssets, userId);
    return { data: updatedAsset, message: 'Images mises à jour avec succès' };
  }

  async updateInvoice(
    id: string,
    invoices: Express.Multer.File[],
    existingInvoices: string[],
    userId: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new NotFoundException('Bien non trouvé');
    }
    if (asset.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions pour mettre à jour la facture de ce bien",
      );
    }

    // Upload des nouvelles factures
    const newInvoiceUrls: string[] = [];
    if (invoices && invoices.length > 0) {
      for (const invoice of invoices) {
        if (invoice.mimetype === 'application/pdf') {
          const invoiceUrl = await uploadImage(invoice, {
            fileNamePrefix: 'invoice',
            directory: 'uploads/assets/invoices',
          });
          newInvoiceUrls.push(invoiceUrl.relativePath);
        } else {
          throw new BadRequestException('Le fichier doit être un PDF');
        }
      }
    }

    const allInvoiceUrls = [...existingInvoices, ...newInvoiceUrls];

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data: { invoices: allInvoiceUrls, isVerified: false },
      include: {
        category: true,
        user: true,
        alerte: true,
      },
    });
    const userAssets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      {
        where: { userId: userId },
        include: {
          category: true,
          alerte: true,
        },
      },
    );
    this.assetsGateway.emitAssetUpdated(userAssets, userId);
    return { data: updatedAsset, message: 'Factures mises à jour avec succès' };
  }

  async remove(id: string, userId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw new NotFoundException('Bien non trouvé');
    }
    if (asset.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions pour supprimer ce bien",
      );
    }
    await this.prisma.asset.delete({ where: { id } });
    return { message: 'Bien supprimé avec succès' };
  }

  async updateStatus(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!asset) {
      throw new NotFoundException('Bien non trouvé');
    }

    const updatedAsset = await this.prisma.asset.update({
      where: { id },
      data: { isVerified: !asset.isVerified },
    });

    const userAssets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      { page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
      {
        where: { userId: asset.userId },
        include: {
          category: true,
          alerte: true,
        },
      },
    );
    this.assetsGateway.emitAssetUpdated(userAssets, asset.userId);
    await this.prisma.notification.create({
      data: {
        title: 'Statut du bien mis à jour',
        message: `Hello, notre equipe viens de ${asset.isVerified ? 'réjété' : 'validé'} votre bien.`,
        assetId: asset.id,
        userId: asset.userId,
      },
    });
    if (asset.user.tokenNotification) {
      await this.push.send({
        tokens: [asset.user.tokenNotification],
        title: 'Statut du bien mis à jour',
        body: `Hello, notre equipe viens de ${asset.isVerified ? 'réjété' : 'validé'} votre bien.`,
      });
    }
    return { data: updatedAsset, message: 'Statut mis à jour avec succès' };
  }

  async findAllForUser(
    userId: string,
    query: PaginationQuery,
    filter: string,
    search: string,
  ) {
    let statusFilter;

    switch (filter) {
      case 'alerted':
        statusFilter = { in: [AssetStatus.THEFT, AssetStatus.LOST] };
        break;
      case 'retrouved':
        statusFilter = AssetStatus.RETROUVE;
        break;
      case 'all':
      default:
        statusFilter = undefined;
        break;
    }

    const whereCondition: any = {
      userId,
      data: {
        string_contains: search,
      },
    };

    if (statusFilter) {
      whereCondition.status = statusFilter;
    }

    const assets = await this.paginationService.paginate<Asset>(
      this.prisma.asset,
      query,
      {
        where: whereCondition,
        include: {
          category: true,
          alerte: true,
        },
      },
    );

    const total = await this.prisma.asset.count(
      {
        where: {
          userId
        },
      },
    );

    const totalRetrouve = await this.prisma.asset.count({
      where: {
        userId,
        status: AssetStatus.RETROUVE,
      },
    });
    
    const totalAlerte = await this.prisma.asset.count({
      where: {
        userId,
        status: { in: [AssetStatus.THEFT, AssetStatus.LOST] },
      },
    });
    
    return {
      data: assets,
      total,
      totalRetrouve,
      totalAlerte,
      message: 'Liste des biens récupérée avec succès',
    };
  }

  async thiefOrLostSearch(key: string) {
    console.log(key);

    const assets = await this.prisma.asset.findMany({
      where: {
        data: {
          string_contains: key,
        },
      },
      include: {
        category: true,
        alerte: true,
        user: true,
      },
    });
    return { data: assets, message: 'Recherche effectuée avec succès' };
  }
}
