import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';
@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  imports: [PrismaModule, PaginationModule],
})
export class SubscriptionsModule {}
