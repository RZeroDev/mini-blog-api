import { Module } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [DonationsController],
  providers: [DonationsService],
  imports: [PrismaModule,PaginationModule],
})
export class DonationsModule {}
