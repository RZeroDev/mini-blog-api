import { Injectable } from '@nestjs/common';
import { CreateDonationDto } from './dto/create-donation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationQuery } from 'src/common/pagination/pagination.types';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { Donation } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(private prisma: PrismaService, private readonly paginationService: PaginationService) {}
  async create(createDonationDto: CreateDonationDto) {
    const donation = await this.prisma.donation.create({
      data: createDonationDto,
    });
    return {
      message: 'Merci pour votre donation!',
      donation,
    };
  }

  async findAll(paginationQuery: PaginationQuery) {
    const donations = await this.paginationService.paginate<Donation>(
      this.prisma.donation,
      paginationQuery,
      {
        searchFields: ['email', 'name', 'phone', 'amount'],
        include: {
          user: true,
        },
      },
    );
    return {
      data: donations,
      message: 'Donations récupérées avec succès',
    };
  }
}
