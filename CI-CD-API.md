## Guide CI/CD pour `mini-blog-api` (NestJS)

Ce document explique **étape par étape** comment fonctionne la chaîne CI/CD de l’API `mini-blog-api` avec :

- **GitHub Actions**
- **Docker Hub** pour les images
- **Snyk** pour l’analyse de vulnérabilités des dépendances Node
- **Trivy** pour l’analyse de vulnérabilités des images Docker
- **Déploiement automatique sur un VPS** via SSH

---

## 1. Vue d’ensemble

Pipeline pour la branche **`main`** :

1. **CI**
   - Récupérer le code (`checkout`)
   - Installer Node et les dépendances (`npm ci`)
   - Lancer **lint** et **tests**
   - Analyser les **dépendances Node** avec **Snyk**
   - Construire l’**image Docker**
   - Scanner l’**image Docker** avec **Trivy**
   - Pousser l’image sur **Docker Hub**
2. **CD**
   - Se connecter en **SSH** au VPS
   - `docker pull` de la nouvelle image
   - Redémarrer le conteneur `mini-blog-api`

---

## 2. Secrets GitHub Actions à configurer

Dans le dépôt GitHub de `mini-blog-api` :

1. Aller dans **`Settings` → `Secrets and variables` → `Actions`**
2. Cliquer sur **`New repository secret`**
3. Créer les secrets ci-dessous.

### 2.1. Secrets Docker Hub

- **`DOCKERHUB_USERNAME`**
  - Valeur : ton **nom d’utilisateur Docker Hub** (ex. `redopay`).

- **`DOCKERHUB_TOKEN`**
  - Valeur : un **Access Token Docker Hub** (recommandé, plutôt que le mot de passe).
  - À créer sur Docker Hub dans : `Account Settings` → `Security` → `New Access Token`.

Ces secrets permettent à GitHub Actions de :
- se connecter à Docker Hub (`docker login`)
- pousser l’image (`docker push`)

### 2.2. Secrets VPS (déploiement)

- **`VPS_HOST`**
  - Valeur : IP ou domaine du VPS pour la connexion SSH  
    - ex. `123.45.67.89` ou `api-mini-blog.redopay.online` (si ça pointe vers ton VPS).

- **`VPS_USER`**
  - Valeur : utilisateur SSH sur le VPS  
    - ex. `ubuntu`, `root`, `debian`, etc.

- **`VPS_SSH_KEY`**
  - Valeur : **contenu complet** de la clé privée SSH utilisée pour se connecter au VPS.  
  - Exemple de fichier : `~/.ssh/id_rsa` ou `~/.ssh/id_ed25519`.
  - Il faut copier/coller **tout** le contenu, y compris :
    - `-----BEGIN OPENSSH PRIVATE KEY-----`
    - `-----END OPENSSH PRIVATE KEY-----`

**Important côté VPS :**
- La **clé publique** associée doit être présente dans `~/.ssh/authorized_keys` de l’utilisateur `VPS_USER`.
- Sans ça, la connexion SSH depuis GitHub Actions échouera.

### 2.3. Secret Snyk

- Créer un compte sur `snyk.io`.
- Récupérer ton **API Token** dans ton compte Snyk.

Créer le secret GitHub :

- **`SNYK_TOKEN`**
  - Valeur : ton **token API Snyk**.

Ce secret permet au job CI d’exécuter :
- `snyk test` sur les dépendances Node

---

## 3. Nom de l’image Docker sur Docker Hub

On utilise un nom d’image de la forme :

- `DOCKERHUB_USERNAME/mini-blog-api`

Par exemple si ton utilisateur Docker Hub est `redopay` :

- `redopay/mini-blog-api`

Ce nom doit être cohérent :
- dans le workflow GitHub Actions
- sur le VPS pour les commandes `docker pull` / `docker run`

Le premier `docker push` créera automatiquement le dépôt d’image côté Docker Hub.

---

## 4. Workflow GitHub Actions (CI/CD)

Le fichier de workflow doit se trouver dans :

- `.github/workflows/api-ci-cd.yml`

Exemple de contenu (adapté à `mini-blog-api`) :

```yaml
name: CI/CD API

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-test-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint --if-present

      - name: Tests
        run: npm test --if-present

      # --- Snyk (dépendances) ---
      - name: Install Snyk
        run: npm install -g snyk

      - name: Snyk test (dependencies)
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        run: snyk test --severity-threshold=medium

      # --- Build image Docker ---
      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image
        run: |
          IMAGE_NAME=${{ secrets.DOCKERHUB_USERNAME }}/mini-blog-api
          docker build -t $IMAGE_NAME:latest .

      # --- Trivy (scan image) ---
      - name: Install Trivy
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: ${{ secrets.DOCKERHUB_USERNAME }}/mini-blog-api:latest
          format: 'table'
          exit-code: '1'
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'

      # --- Push image si tout est OK ---
      - name: Push Docker image
        run: |
          IMAGE_NAME=${{ secrets.DOCKERHUB_USERNAME }}/mini-blog-api
          docker push $IMAGE_NAME:latest

  deploy:
    needs: build-test-scan
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Prepare SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa

      - name: Deploy on VPS
        run: |
          IMAGE_NAME=${{ secrets.DOCKERHUB_USERNAME }}/mini-blog-api
          HOST=${{ secrets.VPS_HOST }}
          USER=${{ secrets.VPS_USER }}

          ssh -o StrictHostKeyChecking=no $USER@$HOST << EOF
            docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" -p "${{ secrets.DOCKERHUB_TOKEN }}"
            docker pull $IMAGE_NAME:latest
            docker stop mini-blog-api || true
            docker rm mini-blog-api || true
            docker run -d \
              --name mini-blog-api \
              -p 3000:3000 \
              $IMAGE_NAME:latest
          EOF
```

---

## 5. Explication des jobs

### 5.1. Job `build-test-scan`

**But** : vérifier la qualité du code, la sécurité, et construire/pousser l’image Docker.

Étapes :

- `Checkout code`  
  - Récupère le code source du dépôt.

- `Use Node.js`  
  - Configure Node.js (version 20) pour exécuter les commandes `npm`.

- `Install dependencies`  
  - Installe les dépendances à partir de `package-lock.json` (`npm ci`).

- `Lint`  
  - Lance `npm run lint` si le script est défini dans `package.json`.

- `Tests`  
  - Lance `npm test` si le script est défini.

- `Install Snyk` / `Snyk test`  
  - Installe Snyk globalement.
  - Utilise `SNYK_TOKEN` pour authentifier.
  - Analyse les dépendances du projet Node (vulnérabilités).

- `Log in to Docker Hub`  
  - Se connecte au registry Docker Hub avec `DOCKERHUB_USERNAME` + `DOCKERHUB_TOKEN`.

- `Build Docker image`  
  - Build l’image Docker à partir du `Dockerfile` du projet.
  - Tag : `${DOCKERHUB_USERNAME}/mini-blog-api:latest`.

- `Install Trivy` / scan image  
  - Scanne l’image Docker fraîchement construite.
  - Si des vulnérabilités **CRITICAL ou HIGH** sont trouvées → le job échoue (`exit-code: 1`).

- `Push Docker image`  
  - Si tout est OK (lint, tests, Snyk, Trivy) → push de l’image sur Docker Hub.

### 5.2. Job `deploy`

**But** : déployer la nouvelle version de l’API sur le VPS.

- `needs: build-test-scan`  
  - Ce job démarre **uniquement si** `build-test-scan` a réussi.

- `if: github.ref == 'refs/heads/main'`  
  - Déploiement seulement pour la branche `main`.

Étapes :

- `Prepare SSH key`  
  - Crée le dossier `~/.ssh` dans le runner GitHub.
  - Écrit la clé privée depuis le secret `VPS_SSH_KEY` dans `~/.ssh/id_rsa`.
  - Applique les permissions `600`.

- `Deploy on VPS`  
  - Se connecte en SSH : `ssh $VPS_USER@$VPS_HOST`.
  - Sur le VPS :
    - `docker login` sur Docker Hub.
    - `docker pull` de l’image `${DOCKERHUB_USERNAME}/mini-blog-api:latest`.
    - `docker stop mini-blog-api` si un conteneur existe déjà (sinon ignore).
    - `docker rm mini-blog-api` pour supprimer l’ancien conteneur.
    - `docker run -d --name mini-blog-api -p 3000:3000 ...` pour démarrer la nouvelle version.

**Remarque :**
- Le port `3000:3000` doit correspondre au port utilisé par NestJS (voir `src/main.ts` ou script de démarrage).
- Tu peux adapter les volumes, variables d’environnement, etc. dans la commande `docker run`.

---

## 6. Vérifications côté VPS

Sur le VPS, avant de compter sur la CI/CD, il est recommandé de tester **manuellement** :

1. Vérifier que Docker est installé :

```bash
docker version
```

2. Tester la connexion à Docker Hub :

```bash
docker login
```

3. Tester le pull et le run de l’image :

```bash
docker pull DOCKERHUB_USERNAME/mini-blog-api:latest
docker run --rm -p 3000:3000 DOCKERHUB_USERNAME/mini-blog-api:latest
```

Si l’API répond bien sur `http://<IP_VPS>:3000`, la partie Docker est OK.

Ensuite, tu pourras configurer un reverse proxy (ex. Nginx) pour faire pointer :

- `api-mini-blog.redopay.online` → `localhost:3000`

---

## 7. Utilisation au quotidien

1. Tu fais des changements dans le code de `mini-blog-api`.
2. Tu pushes sur la branche **`main`**.
3. GitHub Actions exécute automatiquement le workflow :
   - Lint + tests
   - Snyk (dépendances)
   - Build Docker + Trivy (image)
   - Push image sur Docker Hub
   - Déploiement automatique sur le VPS
4. Tu peux suivre le statut dans l’onglet **`Actions`** de GitHub.

En cas d’erreur (lint, tests, Snyk, Trivy, déploiement), GitHub affichera clairement à quelle étape ça bloque.

