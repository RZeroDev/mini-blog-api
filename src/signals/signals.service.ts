import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { uploadImage } from 'src/utils/image-upload.util';
import { PushNotificationService } from 'src/push-notification/push-notification.service';

@Injectable()
export class SignalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushNotificationService,
  ) {}

  async createSignal(
    createSignalDto: CreateSignalDto,
    assetImages: Express.Multer.File[],
    placeImages: Express.Multer.File[],
    userId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new Error('Aucun utilisateur trouvé');
      }
      const asset = await this.prisma.asset.findUnique({
        where: {
          id: createSignalDto.assetId,
        },
        include: {
          alerte: true,
          user: true,
        },
      });
      if (!asset) {
        throw new Error('Aucun bien trouvé');
      }

      const assetsImageUrls: string[] = [];
      const placeImagesUrls: string[] = [];
      console.log(assetImages);
      
      try {
        if (assetImages && assetImages?.length > 0) {
          for (const assetImage of assetImages) {
            const assetImageUrl = await uploadImage(assetImage, {
              fileNamePrefix: 'retrouveAssetImage',
              directory: 'upload/assets/retouves',
            });
            assetsImageUrls.push(assetImageUrl.relativePath);
          }
        }
        if (placeImages && placeImages?.length > 0) {
          for (const placeImage of placeImages) {
            const placeImageUrl = await uploadImage(placeImage, {
              fileNamePrefix: 'retrouvePlaceImage',
              directory: 'upload/assets/retouves',
            });
            placeImagesUrls.push(placeImageUrl.relativePath);
          }
        }
      } catch (error) {
        throw new Error(
          `Erreur lors de la création du signal: ${error.message}`,
        );
      }
      const signal = await this.prisma.signal.create({
        data: {
          ...createSignalDto,
          latitude: createSignalDto.latitude
            ? parseFloat(createSignalDto.latitude)
            : null,
          longitude: createSignalDto.longitude
            ? parseFloat(createSignalDto.longitude)
            : null,
          assetId: asset.id,
          userId: userId,
          assetImages: assetsImageUrls,
          placeImages: placeImagesUrls,
        },
      });
      if (asset.user.tokenNotification) {
        await this.push.send({
          tokens: [asset.user.tokenNotification],
          title: 'Signalement de bien',
          body: 'Un de nos utilisateurs à siganler un de vos volé comme retrouvé',
        });
      }
      await this.prisma.notification.create({
        data: {
          userId: asset.userId,
          title: 'Signalement de bien',
          message:
            'Un de nos utilisateurs à siganler un de vos volé comme retrouvé',
          assetId: asset.id,
        },
      });
      return {
        data: signal,
        message: 'Signal envoyé avec succès',
      };
    } catch (error) {
      throw new Error(`Erreur lors de la création du signal: ${error.message}`);
    }
  }
}
