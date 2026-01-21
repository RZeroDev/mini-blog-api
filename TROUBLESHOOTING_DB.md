# Guide de dépannage - Connexion à la base de données

## Problème : Erreur de connexion à Supabase

Si vous rencontrez l'erreur :
```
Can't reach database server at `aws-1-eu-west-1.pooler.supabase.com:5432`
```

## Solutions possibles

### 1. Vérifier la variable DATABASE_URL

Assurez-vous que votre fichier `.env` contient une variable `DATABASE_URL` valide :

```bash
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### 2. Vérifier l'état de votre projet Supabase

- Connectez-vous à votre dashboard Supabase
- Vérifiez que votre projet est actif (non suspendu)
- Vérifiez que la base de données est en cours d'exécution

### 3. Utiliser la connexion directe au lieu du pooler

Si vous utilisez le pooler Supabase et rencontrez des problèmes, essayez la connexion directe :

**Pooler (actuel) :**
```
postgresql://user:password@aws-1-eu-west-1.pooler.supabase.com:5432/db
```

**Connexion directe :**
```
postgresql://user:password@aws-1-eu-west-1.connect.supabase.com:5432/db
```

### 4. Vérifier les identifiants

- Vérifiez que votre mot de passe de base de données est correct
- Si nécessaire, réinitialisez le mot de passe dans le dashboard Supabase

### 5. Vérifier le réseau/firewall

- Assurez-vous qu'aucun firewall ne bloque le port 5432
- Vérifiez votre connexion Internet
- Si vous êtes sur un réseau d'entreprise, contactez l'administrateur réseau

### 6. Utiliser une base de données locale pour le développement

Si vous préférez utiliser une base de données locale pour le développement :

#### Option A : PostgreSQL local

1. Installer PostgreSQL localement
2. Créer une base de données :
```bash
createdb mini_blog
```

3. Mettre à jour votre `.env` :
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mini_blog?schema=public"
```

4. Exécuter les migrations :
```bash
npx prisma migrate dev
```

5. Exécuter le seed :
```bash
npx prisma db seed
```

#### Option B : Docker PostgreSQL

1. Créer un fichier `docker-compose.yml` :
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mini_blog
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Démarrer PostgreSQL :
```bash
docker-compose up -d
```

3. Mettre à jour votre `.env` :
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_blog?schema=public"
```

4. Exécuter les migrations et le seed (voir Option A)

## Vérification de la connexion

Pour tester la connexion à la base de données :

```bash
# Dans le dossier mini-blog-api
npx prisma db pull
```

Si cette commande fonctionne, votre connexion est correcte.

## Logs améliorés

L'application affiche maintenant des messages d'erreur plus détaillés dans les logs pour vous aider à diagnostiquer le problème.
