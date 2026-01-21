import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationQuery } from '../common/pagination/pagination.types';
import { ApiPagination } from '../common/pagination/pagination.swagger';

@Controller('logs')
@ApiTags('07. Logs système')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * Récupérer tous les logs (admin uniquement)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les logs (admin uniquement)' })
  @ApiPagination()
  @ApiOkResponse({
    description: 'Liste des logs avec pagination',
  })
  findAll(@Query() query: PaginationQuery) {
    return this.logsService.findAll(query);
  }

  /**
   * Récupérer les logs par action
   */
  @Get('action/:action')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les logs par action (admin uniquement)' })
  @ApiParam({ name: 'action', description: 'Type d\'action' })
  @ApiPagination()
  @ApiOkResponse({
    description: 'Logs filtrés par action',
  })
  findByAction(
    @Param('action') action: string,
    @Query() query: PaginationQuery,
  ) {
    return this.logsService.findByAction(action, query);
  }

  /**
   * Récupérer les logs par utilisateur
   */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les logs d\'un utilisateur (admin uniquement)',
  })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur' })
  @ApiPagination()
  @ApiOkResponse({
    description: 'Logs de l\'utilisateur',
  })
  findByUser(
    @Param('userId') userId: string,
    @Query() query: PaginationQuery,
  ) {
    return this.logsService.findByUser(userId, query);
  }

  /**
   * Nettoyer les anciens logs
   */
  @Delete('cleanup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer les logs anciens (admin uniquement)' })
  @ApiOkResponse({
    description: 'Logs supprimés',
  })
  deleteOldLogs(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 90;
    return this.logsService.deleteOldLogs(daysNumber);
  }
}
