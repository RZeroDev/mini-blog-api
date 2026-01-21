import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ResponseEntity } from 'src/auth/entity/auth.entity';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';
import { PaginationQuery } from 'src/common/pagination/pagination.types';

@Controller('users')
@ApiTags('03. Gestion des utilisateurs')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBody({ type: CreateUserDto })
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiOkResponse({ type: ResponseEntity })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiOkResponse({ type: ResponseEntity })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'secretary', 'developer')
  @ApiPagination()
  findAll(@Query() query: PaginationQuery) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiOkResponse({ type: ResponseEntity })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
