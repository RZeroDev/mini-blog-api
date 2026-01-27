import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from './logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Actions à logger
    const loggableActions = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = loggableActions[method];

    // Ne logger que certaines routes et certaines méthodes
    if (action && this.shouldLog(url)) {
      const entity = this.extractEntity(url);
      const entityId = this.extractEntityId(url);

      return next.handle().pipe(
        tap(() => {
          // Exécuter le logging de manière asynchrone sans bloquer
          this.logsService.create({
            action,
            entity,
            entityId: entityId || undefined,
            userId: user?.id,
            userName: user ? `${user.firstName} ${user.lastName}` : undefined,
            details: JSON.stringify({
              method,
              url,
              body: request.body,
            }),
            ipAddress: ip || headers['x-forwarded-for'],
            userAgent: headers['user-agent'],
          }).catch((error) => {
            // Ne pas bloquer la requête si le logging échoue
            console.error('Erreur lors de la création du log:', error);
          });
        }),
      );
    }

    return next.handle();
  }

  private shouldLog(url: string): boolean {
    // Ne pas logger les routes de logs elles-mêmes
    if (url.includes('/logs')) return false;
    
    // Logger uniquement les routes d'API importantes
    const loggableRoutes = ['/posts', '/categories', '/users', '/auth'];
    return loggableRoutes.some((route) => url.includes(route));
  }

  private extractEntity(url: string): string {
    if (url.includes('/posts')) return 'POST';
    if (url.includes('/categories')) return 'CATEGORY';
    if (url.includes('/users')) return 'USER';
    if (url.includes('/auth/login')) return 'AUTH';
    return 'UNKNOWN';
  }

  private extractEntityId(url: string): string | null {
    // Extraire l'ID de l'URL si présent (format: /entity/uuid)
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : null;
  }
}
