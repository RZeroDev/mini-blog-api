import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProfileModule } from './profile/profile.module';
import { CategoriesModule } from './categories/categories.module';
import { AssetsModule } from './assets/assets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertesModule } from './alertes/alertes.module';
import { PushNotificationModule } from './push-notification/push-notification.module';
import { SignalsModule } from './signals/signals.module';
import { DonationsModule } from './donations/donations.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    RolesModule,
    ProfileModule,
    CategoriesModule,
    AssetsModule,
    DashboardModule,
    AlertesModule,
    PushNotificationModule,
    SignalsModule,
    DonationsModule,
    SubscriptionsModule,
  ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
