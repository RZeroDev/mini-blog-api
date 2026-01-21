import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQuery, PaginationOptions, PaginatedResponse } from './pagination.types';
import { paginate } from 'nestjs-prisma-pagination';

@Injectable()
export class PaginationService {
  constructor(private readonly prisma: PrismaService) {}

  async paginate<T>(
    model: any,
    query: PaginationQuery,
    options: PaginationOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const {
      page = 1,
      limit = options.defaultLimit || 10,
      search,
      sortBy = options.defaultSortBy || 'createdAt',
      sortOrder = options.defaultSortOrder || 'desc'
    } = query;

    const paginationQuery = paginate(
      {
        page,
        limit,
        search,
      },
      {
        search: options.searchFields || [],
        orderBy: options.orderBy || { [sortBy]: sortOrder },
      }
    );

    const whereCondition = options.where 
      ? { ...paginationQuery.where, ...options.where }
      : paginationQuery.where;

    const [total, items] = await Promise.all([
      model.count({ where: whereCondition }),
      model.findMany({
        where: whereCondition,
        include: options.include,
        orderBy: options.orderBy || { [sortBy]: sortOrder },
      })
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
} 