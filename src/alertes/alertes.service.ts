import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAlerteDto } from './dto/create-alerte.dto';
import { UpdateAlerteDto } from './dto/update-alerte.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetStatus } from '@prisma/client';
import { PushNotificationService } from 'src/push-notification/push-notification.service';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class AlertesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushNotificationService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(createAlerteDto: CreateAlerteDto, userId: string) {
    const exisAsset = await this.prisma.asset.findUnique({
      where: {
        id: createAlerteDto.assetId,
      },
    });
    if (!exisAsset) {
      throw new NotFoundException('Aucun bien trouvé!');
    }
    if (exisAsset.userId !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas les permissions pour créer une alerte pour ce bien",
      );
    }
    const alerte = await this.prisma.alerte.create({
      data: {
        ...createAlerteDto,
        status: createAlerteDto.motif === 'trouve' ? true : false,
        userId,
      },
    });
    const asset = await this.prisma.asset.update({
      where: {
        id: createAlerteDto.assetId,
      },
      include: {
        alerte: true,
      },
      data: {
        alerte: {
          connect: {
            id: alerte.id,
          },
        },
        status:
          createAlerteDto.motif === 'vol'
            ? AssetStatus.THEFT
            : createAlerteDto.motif === 'perte'
              ? AssetStatus.LOST
              : createAlerteDto.motif === 'trouve'
                ? AssetStatus.RETROUVE
                : AssetStatus.AVAILABLE,
      },
    });
    // Example: call push notification service here (assuming you have tokens)
    // You can fetch tokens from your users table or accept in DTO
    // await this.push.send({
    //   tokens: ["ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"],
    //   title: 'Alerte créée',
    //   body: `Alerte ${alerte.motif} créée pour votre bien`,
    //   data: { alerteId: alerte.id, assetId: asset.id },
    // });
    return {
      data: asset,
      message: 'Alerte créée avec succès',
    };
  }

 async findAll(query: PaginationQuery) {
    const alertes = await this.paginationService.paginate(this.prisma.alerte, query, {
      include: {
        asset: true,
      },
    });
    return {
      data: alertes,
      message: 'Alertes récupérées avec succès',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} alerte`;
  }

  update(id: number, _updateAlerteDto: UpdateAlerteDto) {
    void _updateAlerteDto;
    return `This action updates a #${id} alerte`;
  }

  remove(id: number) {
    return `This action removes a #${id} alerte`;
  }
}
