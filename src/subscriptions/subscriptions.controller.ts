import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UserMakeSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';

@Controller('subscriptions')
@ApiTags('08. Gestion des abonnements')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a subscription' })
  @ApiResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,developer')
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les abonnements' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,developer,secretary,client')
  @ApiPagination()
  findAll(@Query() query: PaginationQuery) {
      return this.subscriptionsService.findAll(query);
  }

  @Get('all-susers-subscriptions')
  @ApiOperation({ summary: 'Récupérer tous les abonnements des utilisateurs' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,developer,secretary')
  @ApiPagination()
  findAllUsersSubscriptions(@Query() query: PaginationQuery) {
    return this.subscriptionsService.findAllUsersSubscriptions(query);
  }

  @Post('user-make-subscription')
  userMakeSubscription(@Body() userMakeSubscriptionDto: UserMakeSubscriptionDto) {
    return this.subscriptionsService.userMakeSubscription(userMakeSubscriptionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un abonnement' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,developer')
  updateStatus(@Param('id') id: string) {
    return this.subscriptionsService.updateStatus(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un abonnement' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,developer')
  update(@Param('id') id: string, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un abonnement' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,developer')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
