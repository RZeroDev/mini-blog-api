import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { CategoriesGateway } from './categories.gateway';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesGateway],
  imports: [PrismaModule, PaginationModule],
})
export class CategoriesModule {}
