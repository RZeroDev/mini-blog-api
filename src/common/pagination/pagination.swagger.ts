import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPagination() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de la page' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'éléments par page' }),
    ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Champ de tri' }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Ordre de tri' }),
    ApiQuery({ name: 'search', required: false, type: String, description: 'Terme de recherche' }),
  );
} 