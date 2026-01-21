import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connexion à la base de données établie avec succès');
    } catch (error: any) {
      this.logger.error('Erreur lors de la connexion à la base de données:', error);
      
      if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database server')) {
        this.logger.error(
          '❌ Impossible de se connecter à la base de données.\n' +
          'Vérifiez que:\n' +
          '1. La variable DATABASE_URL est correctement configurée dans votre fichier .env\n' +
          '2. Le serveur de base de données est accessible et en cours d\'exécution\n' +
          '3. Vos identifiants de connexion sont valides\n' +
          '4. Aucun firewall ne bloque la connexion'
        );
      }
      
      // Gérer l'erreur de circuit breaker Supabase
      if (error?.message?.includes('Circuit breaker open') || error?.message?.includes('Too many authentication errors')) {
        this.logger.error(
          '❌ Circuit breaker Supabase ouvert - Trop d\'erreurs d\'authentification\n' +
          'Solutions:\n' +
          '1. Attendez 5-10 minutes pour que le circuit breaker se réinitialise\n' +
          '2. Vérifiez que vos identifiants DATABASE_URL sont corrects\n' +
          '3. Essayez d\'utiliser la connexion directe au lieu du pooler:\n' +
          '   - Pooler: aws-1-eu-west-1.pooler.supabase.com:5432\n' +
          '   - Direct: aws-1-eu-west-1.connect.supabase.com:5432\n' +
          '4. Vérifiez votre projet Supabase dans le dashboard - il peut être suspendu'
        );
      }
      
      // Ne pas bloquer le démarrage de l'application, mais logger l'erreur
      // L'application continuera mais les requêtes échoueront
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Déconnexion de la base de données');
  }
}
