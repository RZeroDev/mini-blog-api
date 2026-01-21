#!/bin/sh

echo "📦 Génération du client Prisma..."
npx prisma generate

echo "🧱 Déploiement des migrations..."
npx prisma migrate deploy

