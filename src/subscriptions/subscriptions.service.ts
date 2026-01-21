import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto, UserMakeSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { Subscription, UserSubscription } from '@prisma/client';
import { PaginationService } from 'src/common/pagination/pagination.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService, private readonly paginationService: PaginationService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { assetRemaining: createSubscriptionDto.assetRemaining },
    });
    if (existingSubscription) {
      throw new BadRequestException('Abonnement avec ce nombre de biens déjà existant');
    }
    const subscription = await this.prisma.subscription.create({
      data: createSubscriptionDto,
    });
    return {
      data: subscription,
      message: 'Abonnement créé avec succès',
    };
  }

  async findAll(query: PaginationQuery) {
    const subscriptions = await this.paginationService.paginate<Subscription>(
      this.prisma.subscription,
      query,
      {
        searchFields: ['assetRemaining', 'price'],
      },
    );
    return {
      data: subscriptions,
      message: 'Subscriptions récupérées avec succès',
    };
  }

  async userMakeSubscription(userMakeSubscriptionDto: UserMakeSubscriptionDto) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: userMakeSubscriptionDto.subscriptionId },
    });
    if (!subscription) {  
      throw new NotFoundException('Abonnement non trouvé');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userMakeSubscriptionDto.userId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
      await this.prisma.userSubscription.create({
        data: {
          userId: userMakeSubscriptionDto.userId,
          subscriptionId: userMakeSubscriptionDto.subscriptionId,
          transactionId: userMakeSubscriptionDto.transactionId,
        },
      });
      const newAssetRemaining = user.assetRemaining + subscription.assetRemaining;
     const updatedUser = await this.prisma.user.update({
        where: { id: userMakeSubscriptionDto.userId },
        data: {
          assetRemaining: newAssetRemaining,
        },
      });
    return {
      data: updatedUser,
      message: 'Abonnement effectué avec succès',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!existingSubscription) {
      throw new NotFoundException('Abonnement non trouvé');
    }
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
    return {
      data: subscription,
      message: 'Abonnement mis à jour avec succès',
    };
  }

  async remove(id: string) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        userSubscription: true,
      },
    });
    if (!existingSubscription) {
      throw new NotFoundException('Abonnement non trouvé');
    }
    if (existingSubscription.userSubscription.length > 0) {
      throw new BadRequestException('Abonnement non supprimable, il est lié à des utilisateurs');
    }
    await this.prisma.subscription.delete({
      where: { id },
    });
    return {
      message: 'Abonnement supprimé avec succès',
    };
  }

  async updateStatus(id: string) {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!existingSubscription) {
      throw new NotFoundException('Abonnement non trouvé');
    }
    const subscription = await this.prisma.subscription.update({
      where: { id },
      data: { status: !existingSubscription.status },
    });
    return {
      data: subscription,
      message: 'Statut mis à jour avec succès',
    };
  }

  async findAllUsersSubscriptions(query: PaginationQuery) {
    const userSubscriptions = await this.paginationService.paginate<UserSubscription>(
      this.prisma.userSubscription,
      query,
      {
        include: {
          user: true,
          subscription: true,
        },
      },
    );
    return {
      data: userSubscriptions,
      message: 'Abonnements des utilisateurs récupérés avec succès',
    };
  }
}
