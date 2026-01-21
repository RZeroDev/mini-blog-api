import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';
import { PaginationQuery } from '../common/pagination/pagination.types';

export interface CreateLogDto {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LogsService {
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService,
  ) {}

  /**
   * Créer un log
   */
  async create(createLogDto: CreateLogDto) {
    return this.prisma.log.create({
      data: createLogDto,
    });
  }

  /**
   * Récupérer tous les logs avec pagination
   */
  async findAll(query: PaginationQuery) {
    const result = await this.paginationService.paginate(
      this.prisma.log,
      query,
      {
        orderBy: { createdAt: 'desc' },
      },
    );

    return {
      statusCode: 200,
      data: {
        items: result.items,
        meta: result.meta,
      },
      message: 'Logs récupérés avec succès',
    };
  }

  /**
   * Récupérer les logs par action
   */
  async findByAction(action: string, query: PaginationQuery) {
    const result = await this.paginationService.paginate(
      this.prisma.log,
      query,
      {
        where: { action },
        orderBy: { createdAt: 'desc' },
      },
    );

    return {
      statusCode: 200,
      data: {
        items: result.items,
        meta: result.meta,
      },
      message: `Logs de type ${action} récupérés avec succès`,
    };
  }

  /**
   * Récupérer les logs par utilisateur
   */
  async findByUser(userId: string, query: PaginationQuery) {
    const result = await this.paginationService.paginate(
      this.prisma.log,
      query,
      {
        where: { userId },
        orderBy: { createdAt: 'desc' },
      },
    );

    return {
      statusCode: 200,
      data: {
        items: result.items,
        meta: result.meta,
      },
      message: 'Logs de l\'utilisateur récupérés avec succès',
    };
  }

  /**
   * Supprimer les logs anciens (plus de 90 jours)
   */
  async deleteOldLogs(days: number = 90) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });

    return {
      statusCode: 200,
      message: `${result.count} logs supprimés`,
    };
  }
}
