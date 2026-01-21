import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { AssetsGateway } from './assets.gateway';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, AssetsGateway],
  imports: [PrismaModule,PaginationModule,PushNotificationModule],

})
export class AssetsModule {}
