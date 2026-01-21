import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationModule } from '../common/pagination/pagination.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [PaginationModule, forwardRef(() => LogsModule)],
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
  exports: [PostsService],
})
export class PostsModule {}
