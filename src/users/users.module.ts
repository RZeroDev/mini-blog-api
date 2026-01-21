import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailersModule } from 'src/mailers/mailers.module';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [PrismaModule, MailersModule, PaginationModule],
})
export class UsersModule {}
