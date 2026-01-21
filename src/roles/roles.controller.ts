import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { Roles } from 'src/auth/roles.decorator';
@Controller('roles')
@ApiTags('06. Roles des utilisateurs')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les rôles' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin,secretary,developer')
  findAll() {
    return this.rolesService.findAll();
  }
}
