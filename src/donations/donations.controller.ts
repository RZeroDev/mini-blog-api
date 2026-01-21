import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiPagination } from 'src/common/pagination/pagination.swagger';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { ResponseEntity } from 'src/auth/entity/auth.entity';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Get()
  @ApiPagination()
  @ApiOperation({ summary: 'Récupérer tous les donations' })
  @ApiBearerAuth()
  @Roles('admin', 'secretary', 'developer')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ResponseEntity })
  findAll(@Query() paginationQuery: PaginationQuery) {
    return this.donationsService.findAll(paginationQuery);
  }
}
