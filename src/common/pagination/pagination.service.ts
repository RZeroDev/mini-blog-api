import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQuery, PaginationOptions, PaginatedResponse } from './pagination.types';
import { paginate } from 'nestjs-prisma-pagination';

@Injectable()
export class PaginationService {
  private readonly logger = new Logger(PaginationService.name);

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

    try {
      // Exécuter les requêtes séquentiellement pour éviter de surcharger la connexion
      // en cas de problème de circuit breaker Supabase
      // Cela réduit la charge sur la connexion et évite de déclencher le circuit breaker
      const total = await model.count({ where: whereCondition });
      
      // Utiliser skip et take de paginationQuery si disponibles, sinon calculer manuellement
      const skip = paginationQuery.skip !== undefined ? paginationQuery.skip : (page - 1) * limit;
      const take = paginationQuery.take !== undefined ? paginationQuery.take : limit;
      
      const items = await model.findMany({
        where: whereCondition,
        include: options.include,
        orderBy: options.orderBy || { [sortBy]: sortOrder },
        skip,
        take,
      });

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      this.logger.error('Erreur lors de la pagination', error);
      
      // Vérifier si c'est une erreur de connexion à la base de données
      if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database server')) {
        throw new ServiceUnavailableException(
          'Impossible de se connecter à la base de données. Veuillez vérifier votre configuration DATABASE_URL et que le serveur de base de données est accessible.'
        );
      }
      
      // Gérer l'erreur de circuit breaker Supabase
      if (error?.message?.includes('Circuit breaker open') || error?.message?.includes('Too many authentication errors')) {
        this.logger.warn('Circuit breaker Supabase ouvert - trop d\'erreurs d\'authentification');
        throw new ServiceUnavailableException(
          'Le serveur de base de données a temporairement bloqué les connexions à cause de trop d\'erreurs. Veuillez attendre quelques minutes et réessayer. Vérifiez également vos identifiants de connexion dans DATABASE_URL.'
        );
      }
      
      // Relancer l'erreur si ce n'est pas une erreur de connexion
      throw error;
    }
  }
} 