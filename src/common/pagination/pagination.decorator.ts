import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PaginationQuery } from './pagination.types';

export const Paginate = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationQuery => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    return {
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder as 'asc' | 'desc',
    };
  },
); 