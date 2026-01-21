import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async getDashboardAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Total assets
    const totalAssets = await this.prisma.asset.count();
    // Total stolen or lost
    const totalAlerte = await this.prisma.asset.count({
      where: {
        OR: [
          { status: 'THEFT' },
          { status: 'LOST' },
        ],
      },
    });
    // Total found
    const totalRetrouve = await this.prisma.asset.count({
      where: { status: 'RETROUVE' },
    });
    // Last 5 registered
    const last5Assets = await this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        category: true,
        user: true,
        alerte: true,
      },
    });

    return {
      totalAssets,
      totalAlerte,
      totalRetrouve,
      last5Assets,
    };
  }

  async getDashboardUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Total assets for user
    const totalAssets = await this.prisma.asset.count({
      where: { userId },
    });
    // Total stolen or lost for user
    const totalAlerte = await this.prisma.asset.count({
      where: {
        userId,
        OR: [
          { status: 'THEFT' },
          { status: 'LOST' },
        ],
      },
    });
    // Total found for user
    const totalRetrouve = await this.prisma.asset.count({
      where: { userId, status: 'RETROUVE' },
    });
    // Last 5 registered for user
    const last5Assets = await this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        category: true,
        alerte: true,
      },
    });

    return {
      totalAssets,
      totalAlerte,
      totalRetrouve,
      last5Assets,
    };
  }

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Nombre total d'utilisateurs
    const totalUsers = await this.prisma.user.count();

    // Utilisateurs actifs
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    // Utilisateurs vérifiés
    const verifiedUsers = await this.prisma.user.count({
      where: { isVerified: true },
    });

    // Nouveaux utilisateurs ce mois
    const newUsersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Montant total des dons
    const totalDonations = await this.prisma.donation.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalDonationsAmount = totalDonations._sum.amount || 0;

    // Nombre total de dons
    const totalDonationsCount = await this.prisma.donation.count();

    // Dons validés
    const validatedDonations = await this.prisma.donation.aggregate({
      where: { status: true },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Moyenne des dons
    const avgDonation = totalDonationsCount > 0 
      ? totalDonationsAmount / totalDonationsCount 
      : 0;

    // Total des abonnements (nombre de UserSubscription)
    const totalSubscriptions = await this.prisma.userSubscription.count();

    // Revenus totaux des abonnements (somme des prix des abonnements)
    const subscriptionsRevenue = await this.prisma.userSubscription.findMany({
      include: {
        subscription: {
          select: {
            price: true,
          },
        },
      },
    });
    const totalSubscriptionsRevenue = subscriptionsRevenue.reduce(
      (sum, us) => sum + us.subscription.price,
      0,
    );

    // Total de biens enregistrés
    const totalAssets = await this.prisma.asset.count();

    // Biens par statut
    const assetsByStatus = {
      available: await this.prisma.asset.count({
        where: { status: 'AVAILABLE' },
      }),
      theft: await this.prisma.asset.count({
        where: { status: 'THEFT' },
      }),
      lost: await this.prisma.asset.count({
        where: { status: 'LOST' },
      }),
      retrouve: await this.prisma.asset.count({
        where: { status: 'RETROUVE' },
      }),
    };

    // Biens vérifiés
    const verifiedAssets = await this.prisma.asset.count({
      where: { isVerified: true },
    });

    // Nouveaux biens ce mois
    const newAssetsThisMonth = await this.prisma.asset.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Nouveaux biens cette semaine
    const newAssetsThisWeek = await this.prisma.asset.count({
      where: {
        createdAt: {
          gte: startOfWeek,
        },
      },
    });

    // Total des alertes
    const totalAlertes = await this.prisma.alerte.count();

    // Alertes résolues
    const resolvedAlertes = await this.prisma.alerte.count({
      where: { status: true },
    });

    // Alertes non résolues
    const unresolvedAlertes = totalAlertes - resolvedAlertes;

    // Total des signaux
    const totalSignals = await this.prisma.signal.count();

    // Signaux résolus
    const resolvedSignals = await this.prisma.signal.count({
      where: { status: true },
    });

    // Signaux non résolus
    const unresolvedSignals = totalSignals - resolvedSignals;

    // Total des notifications
    const totalNotifications = await this.prisma.notification.count();

    // Notifications non lues
    const unreadNotifications = await this.prisma.notification.count({
      where: { isRead: false },
    });

    // Top catégories (catégories avec le plus de biens)
    const categoriesWithAssets = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: {
        assets: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const topCategories = categoriesWithAssets
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        assetCount: cat._count.assets,
      }))
      .sort((a, b) => b.assetCount - a.assetCount);

    // Derniers biens enregistrés
    const lastAssets = await this.prisma.asset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            pseudo: true,
          },
        },
      },
    });

    return {
      // Utilisateurs
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsersThisMonth,
      
      // Dons
      totalDonationsAmount,
      totalDonationsCount,
      validatedDonationsAmount: validatedDonations._sum.amount || 0,
      validatedDonationsCount: validatedDonations._count || 0,
      avgDonation: Math.round(avgDonation * 100) / 100,
      
      // Abonnements
      totalSubscriptions,
      totalSubscriptionsRevenue,
      
      // Biens
      totalAssets,
      assetsByStatus,
      verifiedAssets,
      newAssetsThisMonth,
      newAssetsThisWeek,
      
      // Alertes
      totalAlertes,
      resolvedAlertes,
      unresolvedAlertes,
      
      // Signaux
      totalSignals,
      resolvedSignals,
      unresolvedSignals,
      
      // Notifications
      totalNotifications,
      unreadNotifications,
      
      // Catégories
      topCategories,
      
      // Derniers biens
      lastAssets,
    };
  }
}
