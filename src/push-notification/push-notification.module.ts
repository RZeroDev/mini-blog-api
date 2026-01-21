import { Module } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [PrismaModule, PaginationModule],
  controllers: [PushNotificationController],
  providers: [PushNotificationService],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
