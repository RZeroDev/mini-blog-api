import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaginationService } from '../common/pagination/pagination.service';

@Module({
  imports: [PrismaModule],
  controllers: [LogsController],
  providers: [LogsService, PaginationService],
  exports: [LogsService],
})
export class LogsModule {}
