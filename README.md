# 🚀 Mini Blog API - Backend

API REST pour l'application Mini Blog développée avec NestJS, Prisma et PostgreSQL.

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [API Documentation](#api-documentation)
- [Base de données](#base-de-données)
- [Sécurité](#sécurité)
- [Pipeline CI/CD](#pipeline-cicd)
- [Déploiement](#déploiement)

---

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x (ou compte Supabase)
- **Git**

---

## 📦 Installation

### 1. Cloner le repository

```bash
git clone https://github.com/votre-organisation/cyberincub.git
cd cyberincub/mini-blog-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Vérifier l'installation

```bash
npm run build
```

Si le build réussit, vous êtes prêt à continuer ! ✅

---

## ⚙️ Configuration

### 1. Créer le fichier `.env`

Copiez le fichier d'exemple et configurez vos variables :

```bash
cp .env.example .env
```

### 2. Configurer les variables d'environnement

Éditez le fichier `.env` avec vos valeurs :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mini_blog?schema=public"

# JWT Secret (CHANGER EN PRODUCTION!)
JWT_SECRET="votre-secret-jwt-super-securise"
JWT_EXPIRES_IN="7d"

# Application
PORT=4000
NODE_ENV="development"

# Frontend URL (pour CORS)
FRONTEND_URL="http://localhost:5173"

# Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PATH="./uploads"

# Seed Password (Développement uniquement)
SEED_ADMIN_PASSWORD="Admin@mini-blog@1234"

# Rate Limiting
RATE_LIMIT_TTL=60000  # 1 minute
RATE_LIMIT_MAX=100    # 100 requêtes

# Logs
LOG_LEVEL="debug"
LOG_RETENTION_DAYS=90
```

### 3. Configurer la base de données

#### Option A : PostgreSQL local

```bash
# Installer PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE mini_blog;
CREATE USER mini_blog_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mini_blog TO mini_blog_user;
\q
```

#### Option B : Supabase (recommandé)

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Copier la connection string dans `DATABASE_URL`

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev

# Peupler la base de données (optionnel)
npm run seed
```

---

## 🚀 Lancement

### Mode développement

```bash
npm run start:dev
```

L'API sera accessible sur : **http://localhost:4000**  
Documentation Swagger : **http://localhost:4000/docs**

### Mode production

```bash
# Build
npm run build

# Lancer
npm run start:prod
```

### Mode debug

```bash
npm run start:debug
```

Puis attachez votre debugger sur le port **9229**.

---

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run start` | Démarrer en mode normal |
| `npm run start:dev` | Démarrer en mode développement (watch) |
| `npm run start:debug` | Démarrer en mode debug |
| `npm run start:prod` | Démarrer en mode production |
| `npm run build` | Compiler le projet |
| `npm run lint` | Vérifier le code (ESLint) |
| `npm run format` | Formater le code (Prettier) |
| `npm run test` | Lancer les tests unitaires |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:cov` | Tests avec couverture |
| `npm run test:e2e` | Tests end-to-end |
| `npm run seed` | Peupler la base de données |
| `npm run migrate` | Exécuter les migrations Prisma |

### Scripts Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en prod
npx prisma migrate deploy

# Ouvrir Prisma Studio (GUI)
npx prisma studio

# Réinitialiser la base (⚠️ supprime toutes les données)
npx prisma migrate reset
```

---

## 📁 Structure du projet

```
mini-blog-api/
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données
│   └── seed.ts                # Script de peuplement
├── src/
│   ├── auth/                  # Authentification JWT
│   ├── categories/            # Gestion des catégories
│   ├── common/                # Utilitaires partagés
│   │   ├── decorators/        # Décorateurs personnalisés
│   │   ├── filters/           # Filtres d'exception
│   │   ├── guards/            # Guards (auth, roles)
│   │   └── interceptors/      # Intercepteurs (logging, response)
│   ├── logs/                  # Système de logs
│   ├── pagination/            # Service de pagination
│   ├── posts/                 # Gestion des articles
│   ├── prisma/                # Service Prisma
│   ├── roles/                 # Gestion des rôles
│   ├── uploads/               # Upload de fichiers
│   ├── users/                 # Gestion des utilisateurs
│   ├── utils/                 # Fonctions utilitaires
│   ├── app.module.ts          # Module principal
│   └── main.ts                # Point d'entrée
├── uploads/                   # Fichiers uploadés
├── .env                       # Variables d'environnement (à créer)
├── .env.example               # Exemple de configuration
├── .snyk                      # Config Snyk (faux positifs)
├── nest-cli.json              # Config NestJS
├── package.json               # Dépendances npm
└── tsconfig.json              # Config TypeScript
```

---

## 📖 API Documentation

### Accéder à la documentation

Une fois l'API lancée, accédez à la documentation Swagger :

**URL** : http://localhost:4000/docs

### Principaux endpoints

#### 🔐 Authentification

- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/profile` - Profil utilisateur (authentifié)

#### 📝 Posts (Articles)

- `GET /posts` - Liste des articles (paginée)
- `GET /posts/:slug` - Détails d'un article
- `GET /posts/category/:id` - Articles par catégorie (paginée)
- `POST /posts` - Créer un article (admin)
- `PATCH /posts/:id` - Modifier un article (admin)
- `DELETE /posts/:id` - Supprimer un article (admin)
- `POST /posts/:id/view` - Incrémenter les vues
- `GET /posts/stats` - Statistiques des articles

#### 📂 Categories

- `GET /categories` - Liste des catégories
- `GET /categories/:slug` - Détails d'une catégorie
- `POST /categories` - Créer une catégorie (admin)
- `PATCH /categories/:id` - Modifier une catégorie (admin)
- `DELETE /categories/:id` - Supprimer une catégorie (admin)

#### 👥 Users

- `GET /users` - Liste des utilisateurs (admin)
- `GET /users/:id` - Détails d'un utilisateur (admin)
- `PATCH /users/:id` - Modifier un utilisateur (admin)
- `DELETE /users/:id` - Supprimer un utilisateur (admin)

#### 📊 Logs

- `GET /logs` - Liste des logs (admin, paginée)
- `DELETE /logs/cleanup` - Nettoyer les anciens logs (admin)

#### 📤 Uploads

- `POST /uploads/post` - Upload image d'article (admin)
- `POST /uploads/category` - Upload image de catégorie (admin)
- `POST /uploads/user` - Upload photo de profil (authentifié)

### Authentification des requêtes

La plupart des endpoints nécessitent un token JWT. Obtenez-le via `/auth/login`, puis ajoutez-le dans les headers :

```bash
Authorization: Bearer votre_token_jwt
```

### Exemples de requêtes

#### Inscription

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password@123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Connexion

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mini-blog.com",
    "password": "Admin@mini-blog@1234"
  }'
```

#### Récupérer les articles

```bash
curl -X GET "http://localhost:4000/posts?page=1&limit=10" \
  -H "accept: application/json"
```

---

## 🗄️ Base de données

### Modèles principaux

#### User
- Utilisateurs de l'application
- Authentification JWT
- Rôles (admin, user)

#### Role
- Système de rôles
- RBAC (Role-Based Access Control)

#### Category
- Catégories d'articles
- Images associées

#### Post
- Articles de blog
- Relation avec User et Category
- Compteur de vues
- Statut published/draft

#### Log
- Système de logs
- Traçabilité des actions
- Rotation automatique (90 jours)

### Diagramme de relations

```
User ----< Post
  |         |
  |         v
  |      Category
  |
  v
Role

User ----> Log (actions)
```

### Migrations

Les migrations Prisma sont versionnées dans `prisma/migrations/`.

Pour créer une nouvelle migration :

```bash
npx prisma migrate dev --name description_de_la_modification
```

---

## 🔒 Sécurité

### Mesures implémentées

#### 1. Authentification & Autorisation
- ✅ JWT avec expiration configurable
- ✅ Hashage des mots de passe (bcrypt, 10 rounds)
- ✅ RBAC (Role-Based Access Control)
- ✅ Guards NestJS (JwtAuthGuard, RolesGuard)

#### 2. Protection XSS
- ✅ Validation des entrées (class-validator)
- ✅ Sanitization des données
- ✅ Content Security Policy (Helmet.js)
- ✅ Headers de sécurité

#### 3. Protection CSRF
- ✅ CORS configuré avec liste blanche
- ✅ SameSite cookies
- ✅ Rate limiting

#### 4. Autres
- ✅ Validation DTOs stricte
- ✅ Prisma ORM (protection SQL injection)
- ✅ Upload sécurisé (taille, type MIME)
- ✅ Système de logs pour traçabilité

### Headers de sécurité (Helmet.js)

```typescript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'; ...
```

### Variables sensibles

⚠️ **Jamais commiter le fichier `.env`**

En production :
- Utiliser un gestionnaire de secrets (AWS Secrets Manager, Vault, etc.)
- Rotationner régulièrement `JWT_SECRET`
- Utiliser des mots de passe forts
- Activer HTTPS

### Scans de sécurité

```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix

# Scan Snyk (si configuré)
npx snyk test
```

---

## 🔄 Pipeline CI/CD

### Vue d'ensemble

Le projet utilise **GitHub Actions** pour l'intégration et le déploiement continus.

### Workflows disponibles

#### 1. CI - Tests & Build (`ci.yml`)

**Déclenchement** : Push sur toutes les branches

**Étapes** :
1. ✅ Checkout du code
2. ✅ Setup Node.js 18
3. ✅ Installation des dépendances
4. ✅ Linting (ESLint)
5. ✅ Type checking (TypeScript)
6. ✅ Build du projet
7. ✅ Tests unitaires (si configurés)

```yaml
name: CI Backend
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

#### 2. Security Scan (`security.yml`)

**Déclenchement** : Push, PR, et hebdomadaire (cron)

**Étapes** :
1. ✅ npm audit (vulnérabilités connues)
2. ✅ Snyk scan (dépendances + code)
3. ✅ SonarQube (qualité de code, optionnel)

```yaml
name: Security Scan
on:
  push:
  pull_request:
  schedule:
    - cron: '0 0 * * 0' # Hebdomadaire
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm audit --audit-level=moderate
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

#### 3. Deploy (`deploy.yml`) - Optionnel

**Déclenchement** : Push sur `main` ou `production`

**Plateforme** : Render.com (ou autre)

**Étapes** :
1. ✅ Build
2. ✅ Migrations Prisma
3. ✅ Déploiement
4. ✅ Health check

### Configuration des secrets GitHub

Allez dans **Settings** > **Secrets and variables** > **Actions** :

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL (production) |
| `JWT_SECRET` | Secret JWT (générer avec `openssl rand -base64 32`) |
| `SNYK_TOKEN` | Token Snyk pour scans de sécurité |
| `SONAR_TOKEN` | Token SonarQube (optionnel) |

### Badges de statut

Ajoutez ces badges à votre README :

```markdown
![CI](https://github.com/votre-org/cyberincub/workflows/CI%20Backend/badge.svg)
![Security](https://github.com/votre-org/cyberincub/workflows/Security%20Scan/badge.svg)
```

### Branch protection

Recommandé pour la branche `main` :

- ✅ Require pull request reviews
- ✅ Require status checks to pass (CI, Security)
- ✅ Require branches to be up to date
- ✅ Require linear history

---

## 🚀 Déploiement

### Déploiement sur Render.com

#### 1. Créer un compte Render

Allez sur [render.com](https://render.com) et créez un compte.

#### 2. Créer un nouveau Web Service

1. Connectez votre repository GitHub
2. Sélectionnez `mini-blog-api`
3. Configuration :
   - **Name** : mini-blog-api
   - **Environment** : Node
   - **Build Command** : `npm install && npx prisma generate && npm run build`
   - **Start Command** : `npm run start:prod`
   - **Plan** : Free (ou Starter)

#### 3. Configurer les variables d'environnement

Dans Render Dashboard > Environment :

```env
DATABASE_URL=your_production_database_url
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=4000
```

#### 4. Ajouter une base de données PostgreSQL

1. Render Dashboard > New > PostgreSQL
2. Copier la **Internal Database URL**
3. Mettre à jour `DATABASE_URL` dans votre Web Service

#### 5. Déployer

Render déploie automatiquement à chaque push sur `main`.

### Autres options de déploiement

#### Heroku

```bash
heroku create mini-blog-api
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

#### Railway

```bash
railway login
railway init
railway add
railway up
```

#### VPS (Ubuntu)

```bash
# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Cloner le projet
git clone https://github.com/votre-org/cyberincub.git
cd cyberincub/mini-blog-api

# Installer et build
npm install
npx prisma generate
npm run build

# Installer PM2
npm install -g pm2

# Lancer avec PM2
pm2 start dist/main.js --name mini-blog-api
pm2 startup
pm2 save
```

### Migrations en production

⚠️ **Important** : Toujours exécuter les migrations avant de déployer le nouveau code.

```bash
npx prisma migrate deploy
```

---

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires
npm test

# Tests avec watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Structure des tests

```
src/
├── posts/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   ├── posts.controller.spec.ts  # Tests controller
│   └── posts.service.spec.ts     # Tests service
```

---

## 🐛 Dépannage

### Problème : "Cannot reach database server"

**Solution** :
1. Vérifiez que PostgreSQL est lancé
2. Vérifiez `DATABASE_URL` dans `.env`
3. Testez la connexion :
   ```bash
   npx prisma studio
   ```

### Problème : "Port 4000 already in use"

**Solution** :
```bash
# Trouver le processus
lsof -i :4000

# Tuer le processus
kill -9 <PID>

# Ou changer le port dans .env
PORT=4001
```

### Problème : Erreur de migration Prisma

**Solution** :
```bash
# Réinitialiser la base (⚠️ supprime les données)
npx prisma migrate reset

# Ou créer une nouvelle migration
npx prisma migrate dev --name fix_issue
```

### Problème : Module non trouvé après npm install

**Solution** :
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

---

## 📚 Ressources

### Documentation officielle

- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs/)
- [PostgreSQL](https://www.postgresql.org/docs/)

### Tutoriels

- [NestJS Crash Course](https://www.youtube.com/watch?v=GHTA143_b-s)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)

### Sécurité

- [OWASP Top 10](https://owasp.org/Top10/)
- [Snyk Learn - XSS](https://learn.snyk.io/lesson/xss/?ecosystem=javascript)

---

## 👥 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'feat: add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Conventions de commit

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteurs

- **CyberIncub Team** - *Développement initial*

---

## 🙏 Remerciements

- NestJS pour le framework
- Prisma pour l'ORM
- Supabase pour l'hébergement database
- La communauté open-source

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 1.0.0  
**Node.js** : >= 18.x  
**Status** : ✅ Production Ready
