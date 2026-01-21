import { Controller, Post, Body, Req, UseGuards, Get, Param, Query } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { SendPushNotificationDto } from './dto/send-push-notification.dto';
import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { RequestWithUser } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';
@Controller('push-notification')
export class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post('send')
  send(@Body() dto: SendPushNotificationDto) {
    return this.pushNotificationService.send(dto);
  }

  @Post('register-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register token' })
  registerToken(@Body() dto: { token: string }, @Req() req: RequestWithUser) {
    return this.pushNotificationService.registerToken(dto.token, req.user.id);
  }

  @Get('user/notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiPagination()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  
  async userNotification(@Req() req: RequestWithUser, @Query() query: PaginationQuery){
    return await this.pushNotificationService.userNotification(req.user.id,query)
  }

  @Post('user/notifications/read/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async readAllNotification(@Req() req: RequestWithUser){
    return await this.pushNotificationService.readAllNotification(req.user.id)
  }

  @Post('user/notifications/read:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async readNotification(@Req() req: RequestWithUser, @Param('id') id: string){
    return await this.pushNotificationService.readNotification(req.user.id,id)
  }
}
