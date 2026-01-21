import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { RequestWithUser } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @ApiOperation({ summary: 'Récupérer le tableau de bord' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiPagination()
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'developer')
  @UseGuards(JwtAuthGuard)
    async getDashboardAdmin(@Req() req: RequestWithUser) {
    return this.dashboardService.getDashboardAdmin(req.user.id);
  }

  @Get('user')
  @ApiOperation({ summary: 'Récupérer le tableau de bord utilisateur' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @Roles('client')
  @UseGuards(JwtAuthGuard)
  async getDashboardUser(@Req() req: RequestWithUser) {
    return this.dashboardService.getDashboardUser(req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques générales' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'developer')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.dashboardService.getStats();
  }
}
