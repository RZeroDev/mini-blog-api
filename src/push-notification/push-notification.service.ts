import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SendPushNotificationDto } from './dto/send-push-notification.dto';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { ApiOperation } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/users/entities/user.entity';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { PaginationService } from 'src/common/pagination/pagination.service';
@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly expo: Expo;

  constructor(private readonly prisma: PrismaService, private readonly paginationService: PaginationService) {
    this.prisma = prisma;
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
      // FCMv1 is default per Expo push service guidance
      useFcmV1: true,
    });
  }

  @ApiOperation({ summary: 'Send push notification' })
  async send(dto: SendPushNotificationDto): Promise<{
    sent: number;
    invalidTokens: string[];
    tickets: ExpoPushTicket[];
  }> {
    const invalidTokens: string[] = [];
    const validTokens: string[] = [];

    for (const token of dto.tokens) {
      if (!Expo.isExpoPushToken(token)) {
        invalidTokens.push(token);
      } else {
        validTokens.push(token);
      }
    }

    const messages: ExpoPushMessage[] = validTokens.map((to) => ({
      to,
      sound: dto.sound ?? 'default',
      title: dto.title,
      body: dto.body,
      data: dto.data,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error(
          'Error sending push notification chunk',  
          error as Error,
        );
      }
    }

    return {
      sent: validTokens.length,
      invalidTokens,
      tickets,
    };
  }

  async registerToken(token: string, userId: string) {
    console.log('token', token);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
   const newUser = await this.prisma.user.update({
      where: { id: userId },
      data: { tokenNotification: token },
    });
    return {
      message: 'token enregister',
      user: plainToInstance(UserEntity, newUser),
    };
  }

  async userNotification(userId:string,query:PaginationQuery){
    const user = await this.prisma.user.findUnique({
      where: {id:userId}
    });
    if (!user) {
      throw new NotFoundException('Aucun bien trouvé!');
    }
    const notifications = await this.paginationService.paginate(this.prisma.notification, query, {
      where:{userId},
      include:{
        asset:true
      },
    })

    return {
      data:notifications,
      messages:'Liste des notifications'
    }
  }

  async readAllNotification(userId:string){
    const user = await this.prisma.user.findUnique({
      where: {id:userId}
    }) 
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé')
    }
    await this.prisma.notification.updateMany({
      where:{userId},
      data:{isRead:true}
    })
    
    return {
      message:'Toute les notifications sont lues'
    }
  }

   async readNotification(userId:string,notificationId:string){
    const user = await this.prisma.user.findUnique({
      where:{id:userId}
    })
    if (!user) {
      throw new NotFoundException('Aucun utilisateur trouvé')
    }
    await this.prisma.notification.update({
      where:{id:notificationId},
      data:{isRead:true}
    })
    return {
      message:'Notification lue'
    }
   }
  
}
