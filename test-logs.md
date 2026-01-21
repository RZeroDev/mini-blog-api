# Test du système de logs

## Fonctionnalités implémentées

### Backend (NestJS)

1. **Modèle Log dans Prisma**
   - `action`: Type d'action (CREATE, UPDATE, DELETE, VIEW, LOGIN, etc.)
   - `entity`: Type d'entité (POST, CATEGORY, USER, etc.)
   - `entityId`: ID de l'entité concernée
   - `userId`: ID de l'utilisateur qui a effectué l'action
   - `userName`: Nom de l'utilisateur (pour éviter les jointures)
   - `details`: Détails additionnels en JSON
   - `ipAddress`: Adresse IP
   - `userAgent`: User agent du navigateur
   - `createdAt`: Date de création

2. **Service de logs (`LogsService`)**
   - `create()`: Créer un log
   - `findAll()`: Récupérer tous les logs avec pagination
   - `findByAction()`: Récupérer les logs par action
   - `findByUser()`: Récupérer les logs par utilisateur
   - `deleteOldLogs()`: Supprimer les logs anciens (par défaut > 90 jours)

3. **Controller de logs (`LogsController`)**
   - `GET /logs`: Récupérer tous les logs (admin uniquement)
   - `GET /logs/action/:action`: Récupérer les logs par action
   - `GET /logs/user/:userId`: Récupérer les logs par utilisateur
   - `DELETE /logs/cleanup?days=90`: Nettoyer les anciens logs

4. **Logging automatique dans PostsService**
   - Création d'un post → Log CREATE
   - Modification d'un post → Log UPDATE
   - Suppression d'un post → Log DELETE

### Frontend (React)

1. **Page Logs (`/dashboard/logs`)**
   - Affichage de tous les logs avec pagination
   - Statistiques en temps réel (total de logs, page actuelle, filtre actif)
   - Filtres par action (Tous, Créations, Modifications, Suppressions, Vues, Connexions)
   - Badges colorés par type d'action
   - Icônes par type d'entité
   - Détails expandables (JSON)
   - Bouton "Actualiser"
   - Bouton "Nettoyer" (supprimer les logs > 90 jours)
   - Pagination (Précédent/Suivant)

2. **Navigation**
   - Ajout de "Logs système" dans le sidebar du dashboard
   - Route protégée (admin uniquement)

## Comment tester

### 1. Démarrer le backend
```bash
cd mini-blog-api
npm run start:dev
```

### 2. Démarrer le frontend
```bash
cd mini-blog
npm run dev
```

### 3. Se connecter en tant qu'admin
- Email: `admin@mini-blog.com`
- Mot de passe: (celui défini dans les seeders)

### 4. Créer des logs
- Créer un article → Log CREATE
- Modifier un article → Log UPDATE
- Supprimer un article → Log DELETE

### 5. Consulter les logs
- Aller sur `/dashboard/logs`
- Filtrer par action
- Voir les détails de chaque log
- Tester la pagination

### 6. Nettoyer les logs
- Cliquer sur "Nettoyer" pour supprimer les logs de plus de 90 jours

## Routes API disponibles

```bash
# Récupérer tous les logs (page 1, 20 par page)
GET http://localhost:4000/logs?page=1&limit=20
Authorization: Bearer <token>

# Récupérer les logs de type CREATE
GET http://localhost:4000/logs/action/CREATE?page=1&limit=20
Authorization: Bearer <token>

# Récupérer les logs d'un utilisateur
GET http://localhost:4000/logs/user/<userId>?page=1&limit=20
Authorization: Bearer <token>

# Nettoyer les logs de plus de 90 jours
DELETE http://localhost:4000/logs/cleanup?days=90
Authorization: Bearer <token>
```

## Améliorations futures possibles

1. **Logging automatique étendu**
   - Ajouter le logging pour les catégories (CREATE, UPDATE, DELETE)
   - Ajouter le logging pour les utilisateurs (LOGIN, LOGOUT, REGISTER)
   - Utiliser l'intercepteur `LoggingInterceptor` globalement

2. **Filtres avancés**
   - Filtrer par date (aujourd'hui, cette semaine, ce mois)
   - Filtrer par entité (POST, CATEGORY, USER)
   - Recherche par nom d'utilisateur ou ID d'entité

3. **Export de logs**
   - Exporter les logs en CSV
   - Exporter les logs en JSON

4. **Notifications**
   - Alertes en temps réel pour certaines actions critiques
   - Dashboard avec graphiques des actions par jour/semaine

5. **Rétention automatique**
   - Cron job pour nettoyer automatiquement les logs anciens
   - Configuration de la durée de rétention

## Notes techniques

- Les logs sont créés de manière asynchrone pour ne pas bloquer les requêtes principales
- Les erreurs de logging sont capturées et loggées dans la console mais ne bloquent pas l'application
- La pagination est gérée côté serveur pour de meilleures performances
- Les logs incluent l'adresse IP et le user agent pour le tracking
- Les détails sont stockés en JSON pour une flexibilité maximale
