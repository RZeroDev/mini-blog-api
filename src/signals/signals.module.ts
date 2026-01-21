import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';

@Module({
  controllers: [SignalsController],
  providers: [SignalsService],
  imports: [PrismaModule,PaginationModule,PushNotificationModule],
})
export class SignalsModule {}
