import { Module } from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { AlertesController } from './alertes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [AlertesController],
  providers: [AlertesService],
  imports: [PrismaModule, PushNotificationModule, PaginationModule],
})
export class AlertesModule {}
