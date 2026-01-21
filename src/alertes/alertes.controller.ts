import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AlertesService } from './alertes.service';
import { CreateAlerteDto } from './dto/create-alerte.dto';
import { UpdateAlerteDto } from './dto/update-alerte.dto';
import { RequestWithUser } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';

@Controller('alertes')
@ApiTags('07. Gestion des alertes')
export class AlertesController {
  constructor(private readonly alertesService: AlertesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une alerte' })
  @ApiBearerAuth()
  @Roles('client')
  create(
    @Body() createAlerteDto: CreateAlerteDto,
    @Req() req: RequestWithUser,
  ) {
    return this.alertesService.create(createAlerteDto, req.user.id);
  }

  @Get()
  @ApiPagination()
  @ApiOperation({ summary: 'Récupérer tous les alertes' })
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'developer')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ResponseEntity })
  findAll(@Query() query: PaginationQuery) {
    return this.alertesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alertesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlerteDto: UpdateAlerteDto) {
    return this.alertesService.update(+id, updateAlerteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alertesService.remove(+id);
  }
}
